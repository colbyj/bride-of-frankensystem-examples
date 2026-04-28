"""Custom blueprint for the A/B experiment's menu task.

Two routes, one per condition. Each renders a thin template that mounts
the JS task runner with the right configuration — the actual trial logic
lives in static/task_runner.js, and the menu interaction lives in
static/linear_menu.js or static/marking_menu.js.

This file is the Python side of a typical BOFS interactive task: a
small Blueprint that picks the right template and hands it the right
parameters. Most of the per-task work happens in JavaScript. See the
example's README for how the pieces fit together, and the BOFS docs
on custom pages:
https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_custom_pages.html

Per-trial data is logged via the /table/menu_trials JSONTable endpoint
(see menu_task/tables/menu_trials.json for the schema).
"""

from flask import Blueprint, render_template

from BOFS.util import verify_correct_page, verify_session_valid, page_tables


# Blueprint name must match the folder name so BOFS auto-discovers it.
menu_task = Blueprint(
    'menu_task',
    __name__,
    static_url_path='/menu_task',
    template_folder='templates',
    static_folder='static',
)


# Six commands shared across both menus, in canonical order. The marking
# menu's wedge positions follow this order clockwise from 12 o'clock.
COMMANDS = ['Save', 'Undo', 'Find', 'Replace', 'Format', 'Export']

# Each command is shown twice across the 12 trials.
TRIAL_COUNT = len(COMMANDS) * 2


def _render_task(technique):
    return render_template(
        "task.html",
        technique=technique,
        commands=COMMANDS,
        trial_count=TRIAL_COUNT,
        crumbs=[]  # Hides the "breadcrumbs" for the task page only.
    )


@menu_task.route('/linear')
@verify_session_valid
@verify_correct_page
@page_tables('menu_trials')
def route_linear():
    return _render_task('linear')


@menu_task.route('/marking')
@verify_session_valid
@verify_correct_page
@page_tables('menu_trials')
def route_marking():
    return _render_task('marking')
