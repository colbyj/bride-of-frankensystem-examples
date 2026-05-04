# A/B Experiment Example

A small between-subjects BOFS study with two conditions. Each
participant is randomly assigned to one of two menu styles — a
traditional drop-down (Linear Menu) or a radial press-and-drag
(Marking Menu) — and only ever sees the instructions and task for
that condition.

This is the smallest example in the repo that uses
[`CONDITIONS`](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/project_configuration.html)
and `conditional_routing`. If you want to see condition assignment
without anything else (no custom blueprints, no JSONTables), this is
the project to read.

## BOFS features demonstrated

| Feature | Where it shows up |
|---|---|
| Balanced condition assignment via `CONDITIONS` | `ab_experiment.toml` |
| `conditional_routing` in `PAGE_LIST` | `ab_experiment.toml` page list |
| Per-condition instruction templates | `menu_task/templates/instructions/{linear,marking}.html` |
| A self-contained custom blueprint | `menu_task/` (routes, templates, instructions, static, table) |
| Project-local static files (JS, CSS) | `menu_task/static/` |
| JSON questionnaires | `questionnaires/demographics.json` |
| Per-trial logging via `JSONTable` | `menu_task/tables/menu_trials.json` |
| `JSONTable` `json` column type | `trajectory` column (raw mouse samples) |
| Calculated export fields | `exports` block in `menu_trials.json` |
| Static completion code | `STATIC_COMPLETION_CODE` |

## How condition routing works here

The two relevant pieces of `ab_experiment.toml`:

```toml
CONDITIONS = [
    {label='Linear Menu', enabled=true},
    {label='Marking Menu', enabled=true},
]

PAGE_LIST = [
    {name='Consent', path='consent'},
    {name='Background', path='questionnaire/demographics'},
    {conditional_routing=[
        {condition=1, page_list=[
            {name='Instructions', path='instructions/linear'},
            {name='Task', path='linear'},
        ]},
        {condition=2, page_list=[
            {name='Instructions', path='instructions/marking'},
            {name='Task', path='marking'},
        ]},
    ]},
    {name='End', path='end'},
]
```

When a participant submits the consent page, BOFS picks whichever
condition currently has the fewest participants and stores that on
their session. The `conditional_routing` block expands to just the
matching branch when the page list is rendered, so the participant
sees one instructions page and one task page — never both.

The custom blueprint exposes the two task routes (`/linear` and
`/marking`) as separate Flask views; routing decides which one a given
participant reaches. This is the pattern to copy when each condition
needs different Python-side logic. If your conditions only differ in
the *content* of one page (e.g., wording of a question), you can
instead branch inside a single template using
`{% if session.condition == 1 %}` — see the
[Accessing Participant Data](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/accessing_participant_data.html)
docs.

## The task itself

Both conditions run the same kind of trial: a prompt names a command,
the participant uses their assigned menu to select it, and the runner
records the selection, response time, and full mouse trajectory. There
are 12 trials, with each of the six commands prompted twice in random
order.

The interactive task is built on [D3.js](https://d3js.org/) and lives
in `menu_task/`. See the [Custom Pages
docs](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_custom_pages.html)
for the blueprint pattern in detail. The same task code is also used
by the longitudinal example in this repo — that example's README has a
more detailed walkthrough of the JS pieces.

### Self-contained blueprint

Everything the menu task needs lives inside `menu_task/`: the Flask
routes (`views.py`), the per-condition instruction pages
(`templates/instructions/`), the shared task template
(`templates/task.html`), the trial log schema (`tables/menu_trials.json`),
and the JS/CSS assets (`static/`). BOFS searches every blueprint's
template folder when resolving `instructions/<name>` and
`questionnaire/<name>` lookups, so instructions placed inside the
blueprint are reachable from `PAGE_LIST` exactly like project-level
ones — `path='instructions/linear'` finds `menu_task/templates/instructions/linear.html`.

The payoff is reuse: the longitudinal example in this repo drops the
same `menu_task/` folder into a different project (with different
`PAGE_LIST` and condition logic) and gets the routes, the task code,
and the matching instructions all together.

## Running the example

From this folder:

```
BOFS run ab_experiment.toml -d
```

Open <http://localhost:5005/> and complete the flow as a fake
participant. Repeat with two or three more sessions to see the
balancer alternate conditions. The admin panel at
<http://localhost:5005/admin> (password: `example`) lets you inspect
each participant's progress and download `menu_trials` as CSV.

## File reference

| Path | Purpose |
|------|---------|
| `ab_experiment.toml` | Project config: conditions, page list, settings. |
| `consent.html` | Placeholder consent page. |
| `questionnaires/demographics.json` | Background questions before the task. |
| `menu_task/views.py` | Blueprint with one route per condition. |
| `menu_task/templates/instructions/linear.html` | Instructions for the Linear Menu condition. |
| `menu_task/templates/instructions/marking.html` | Instructions for the Marking Menu condition. |
| `menu_task/templates/task.html` | Shared task template (extends BOFS's base layout). |
| `menu_task/tables/menu_trials.json` | Per-trial logging schema. |
| `menu_task/static/d3.v7.min.js` | D3.js v7 (bundled for offline use). |
| `menu_task/static/linear_menu.js` | Drop-down menu component. |
| `menu_task/static/marking_menu.js` | Radial press-and-drag menu component. |
| `menu_task/static/task_runner.js` | Trial loop, trajectory capture, batch POST. |
| `menu_task/static/menu_task.css` | Task styling. |
