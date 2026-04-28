"""Custom blueprint for the menu-learning study's interactive task.

Four routes, one per (phase, technique) pair. Each one renders a thin
template that mounts the JS task runner with the right configuration —
the actual trial logic lives in static/task_runner.js, and the menu
interaction lives in static/linear_menu.js or static/marking_menu.js.

This file is the Python side of a typical BOFS interactive task: a
small Blueprint that picks the right template and hands it the right
parameters. Most of the per-task work happens in JavaScript. See the
example's README for how the pieces fit together, and the BOFS docs
on custom pages:
https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_custom_pages.html

Per-trial data is logged via the /table/menu_trials JSONTable endpoint
(see menu_task/tables/menu_trials.json for the schema). Both day 1
(learning, 12 trials with feedback) and day 2 (recall, 6 trials no
feedback) write to the same table; the `phase` column lets analysis
split them.
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

# Practice on day 1 sees each command twice; recall on day 2 sees each once.
LEARNING_TRIAL_COUNT = len(COMMANDS) * 2
RECALL_TRIAL_COUNT = len(COMMANDS)


def _render_task(phase, technique):
    trial_count = LEARNING_TRIAL_COUNT if phase == 'learning' else RECALL_TRIAL_COUNT
    return render_template(
        "task.html",
        phase=phase,
        technique=technique,
        commands=COMMANDS,
        trial_count=trial_count,
        crumbs=[]  # Hides the "breadcrumbs" for the task page only.
    )


@menu_task.route('/learn_linear')
@verify_session_valid
@verify_correct_page
@page_tables('menu_trials')
def route_learn_linear():
    return _render_task('learning', 'linear')


@menu_task.route('/learn_marking')
@verify_session_valid
@verify_correct_page
@page_tables('menu_trials')
def route_learn_marking():
    return _render_task('learning', 'marking')


@menu_task.route('/recall_linear')
@verify_session_valid
@verify_correct_page
@page_tables('menu_trials')
def route_recall_linear():
    return _render_task('recall', 'linear')


@menu_task.route('/recall_marking')
@verify_session_valid
@verify_correct_page
@page_tables('menu_trials')
def route_recall_marking():
    return _render_task('recall', 'marking')
