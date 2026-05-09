# A/B Experiment Example

The smallest example in the repo that uses
[`CONDITIONS`](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/project_configuration.html)
and `conditional_routing`. Each participant is randomly assigned to a
Linear Menu or a Marking Menu condition and only ever sees the
instructions and task for that one.

The custom task is a self-contained Flask blueprint at `menu_task/` —
routes, instructions, task template, JS, CSS, and the `JSONTable` schema
all in one folder. The same blueprint is dropped, unchanged, into
`longitudinal_example/` — see that example's README for a deeper
walkthrough of the per-trial logging and `JSONTable` exports.

## Where the routing lives

`ab_experiment.toml` declares the two conditions and a `PAGE_LIST` with
a `conditional_routing` block:

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

BOFS picks the underused condition at consent submission. The two task
routes (`/linear`, `/marking`) are separate Flask views in
`menu_task/views.py`; routing decides which one the participant
reaches. If your conditions only differ in page *content* (e.g.,
question wording), branching inside a single template with
`{% if session.condition == 1 %}` is lighter — see
[Accessing Participant Data](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/accessing_participant_data.html).
