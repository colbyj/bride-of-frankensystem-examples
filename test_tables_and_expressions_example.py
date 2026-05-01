"""Smoke test for tables_and_expressions_example.

Uses the Flask test client (no browser, no live server). Spins up the
BOFS app, walks Consent -> Instructions -> Task, posts synthetic
payloads to ``/table/clicks`` (bulk list) and ``/table/scores`` (one
row per round), then renders the Results questionnaire and confirms
each ``{{ expression }}`` placeholder was substituted with the right
value.

Run with ``pytest test_tables_and_expressions_example.py`` from the
repo root.
"""

import json
import os

import pytest

from BOFS.create_app import create_app


_HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(_HERE, "tables_and_expressions_example")
CONFIG_NAME = "tables_and_expressions.toml"


@pytest.fixture
def app():
    original_cwd = os.getcwd()
    a = create_app(PROJECT_DIR, CONFIG_NAME, False, False)
    # Force an in-memory database for the test, regardless of the toml.
    a.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    ctx = a.app_context()
    ctx.push()
    a.db.create_all()
    try:
        yield a
    finally:
        a.db.drop_all()
        ctx.pop()
        os.chdir(original_cwd)


def _consent(client):
    """Walk the consent gate so the rest of the PAGE_LIST opens up."""
    client.get('/')
    client.get('/consent')
    # Follow the consent redirect chain through to the next legal page.
    response = client.post('/consent', data={'consent': '1'},
                           follow_redirects=True)
    assert response.status_code == 200


def _advance_through_task(client):
    """Walk past Instructions and the Task page so the test client can
    reach the Results instructions page (and after that, the Reflection
    questionnaire)."""
    # After consent we land on Instructions; advance past it.
    response = client.post('/instructions/task_instructions',
                           follow_redirects=False)
    assert response.status_code in (302, 303)
    # /redirect_from_page/instructions/task_instructions follows up.
    follow = client.get(response.headers['Location'],
                        follow_redirects=False)
    assert follow.status_code in (302, 303)
    # That lands at the Task page. Advance to the Results instructions page.
    client.get('/redirect_next_page', follow_redirects=False)


def _advance_past_results_instructions(client):
    """Move past the /instructions/results table page to land on the
    /questionnaire/results Reflection questionnaire."""
    response = client.post('/instructions/results', follow_redirects=False)
    assert response.status_code in (302, 303)
    follow = client.get(response.headers['Location'],
                        follow_redirects=False)
    assert follow.status_code in (302, 303)


def _post_clicks(client, round_num, count):
    """Simulate one round of click-capture: send a list payload."""
    payload = [
        {"round": round_num, "index": i + 1, "t_ms": 100 * (i + 1),
         "x": 100 + i, "y": 200 + i}
        for i in range(count)
    ]
    response = client.post(
        '/table/clicks',
        data=json.dumps(payload),
        content_type='application/json',
    )
    assert response.status_code == 204, response.data


def _post_score(client, round_num, score):
    response = client.post(
        '/table/scores',
        data=json.dumps({"round": round_num, "score": score}),
        content_type='application/json',
    )
    assert response.status_code == 204, response.data


def test_results_questionnaire_substitutes_placeholders(app):
    client = app.test_client()
    _consent(client)

    # Three rounds, increasing score.
    rounds = [(1, 5), (2, 8), (3, 11)]
    for r, n in rounds:
        _post_clicks(client, r, n)
        _post_score(client, r, n)

    _advance_through_task(client)

    # First the table-format instructions page renders against the
    # accessor (server-side Jinja with participant in scope).
    response = client.get('/instructions/results', follow_redirects=True)
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "<th" in html and "Round 1" in html and ">5<" in html
    assert "Round 2" in html and ">8<" in html
    assert "Round 3" in html and ">11<" in html
    assert "Total" in html and ">24<" in html
    assert "8.0" in html
    assert "24 individual clicks" in html

    _advance_past_results_instructions(client)

    # Then the Reflection questionnaire renders the same data via the
    # new {{ }} substitution layer.
    response = client.get('/questionnaire/results', follow_redirects=True)
    assert response.status_code == 200
    html = response.get_data(as_text=True)

    # Top-level scalar exports.
    assert "High score: 11" in html
    assert "Total across rounds: 24" in html
    assert "Mean per round: 8.0" in html

    # group_by bracket subscripts.
    assert "Round 1: 5" in html
    assert "Round 2: 8" in html
    assert "Round 3: 11" in html

    # Cross-table reference.
    assert "Detail table recorded 24 individual clicks" in html
    assert "scored 24 clicks across 24 captured events" in html

    # No raw placeholder should leak through.
    assert "{{" not in html


def test_clicks_table_accepts_bulk_payload(app):
    client = app.test_client()
    _consent(client)

    # A single bulk request inserts many rows.
    _post_clicks(client, round_num=1, count=42)

    table = app.tables['clicks'].db_class
    n = app.db.session.query(table).count()
    assert n == 42


def test_scores_table_accepts_single_row(app):
    client = app.test_client()
    _consent(client)

    _post_score(client, round_num=1, score=7)

    table = app.tables['scores'].db_class
    rows = app.db.session.query(table).all()
    assert len(rows) == 1
    assert rows[0].round == 1
    assert rows[0].score == 7
