"""
Flask blueprint backing the Unity example project.

The blueprint exposes three pages that each embed the same Unity WebGL build
in a different way (`game_embed`, `game_fullscreen`, `game_custom`) and one
helper route (`/fetch_condition`) that the running Unity build calls to
discover the participant's assigned condition.

Each game route accepts POSTs from inside the Unity build and writes the
submitted payload as a row in the `game_log` table (see ``models.py``).
"""

from flask import Blueprint, render_template, request, session
from BOFS.util import verify_correct_page, verify_session_valid
from BOFS.globals import db

# The blueprint variable name must match this folder's name so BOFS auto-discovers it.
unity_example = Blueprint('unity_example', __name__,
                          static_url_path='/unity_example',
                          template_folder='templates',
                          static_folder='static')


def handle_game_post():
    """Persist a single payload posted from the Unity build to the ``game_log`` table.

    The Unity build sends `WWWForm` fields via `UnityWebRequest.Post`; this
    handler reads the ``input`` field and stores it alongside the current
    participant's ID. Returns an empty body so Unity's request completes
    cleanly without expecting a response.
    """
    log = db.GameLog()
    log.participantID = session['participantID']
    log.input = request.form['input']

    db.session.add(log)
    db.session.commit()
    return ""


@unity_example.route("/game_embed", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game_embed():
    """Render the Unity build embedded inside BOFS's standard page chrome."""
    if request.method == 'POST':
        return handle_game_post()
    return render_template("game_embed.html")


@unity_example.route("/game_fullscreen", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game_fullscreen():
    """Render the Unity build in a layout that fills the browser viewport."""
    if request.method == 'POST':
        return handle_game_post()
    return render_template("game_fullscreen.html")


@unity_example.route("/game_custom", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game_custom():
    """Render the Unity build on a fully custom HTML page (no BOFS chrome)."""
    if request.method == 'POST':
        return handle_game_post()
    return render_template("game_custom.html")


@unity_example.route("/fetch_condition")
@verify_session_valid
def fetch_condition():
    """Return the current participant's condition number as plain text.

    Called from inside the Unity build (see ``LoadCondition`` in
    ``unity_project/Assets/example.cs``) so the build can branch on the
    BOFS-assigned condition.
    """
    return str(session['condition'])
