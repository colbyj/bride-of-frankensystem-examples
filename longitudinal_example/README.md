# Longitudinal Example — Menu Learning Study

A worked example of a **two-session BOFS study**, where participants
come back the next day and need to land in the same experimental
condition they were assigned the day before. Each section names the
BOFS feature being demonstrated and links to the relevant
[BOFS docs](https://bride-of-frankensystem.readthedocs.io/en/latest/)
page so you can dig deeper.

This README assumes you have already done the
[Quickstart](https://bride-of-frankensystem.readthedocs.io/en/latest/examples/quickstart.html)
and know your way around a `.toml` config file and `PAGE_LIST`.

## What the study does

A small HCI experiment comparing two menu techniques: a traditional
**linear** drop-down menu, and a **marking menu** — a radial
press-and-drag menu first described by Kurtenbach & Buxton (1991).

- **Day 1 (learning)** — each participant is assigned to one of the
  two conditions and completes 12 practice trials with that interface,
  with correctness feedback after every trial.
- **Day 2 (recall)** — the same participants come back, are placed
  back into the same condition, and complete 6 unlabeled trials. Their
  selections are scored to measure retention.

The interactive task itself is a small custom blueprint built on
[D3.js](https://d3js.org/) — see
[Adding a custom interactive task](#adding-a-custom-interactive-task)
below. Everything else is stock BOFS.

## BOFS features demonstrated

| Feature | Where it shows up |
|---|---|
| Two `.toml` files sharing a working directory | `day1.toml`, `day2.toml` |
| Balanced condition assignment via `CONDITIONS` | `day1.toml` randomizes participants |
| `EXTERNAL_ID_LABEL` and the `external_id` route | Both days |
| `CONDITIONS_FROM_DB` (the headline feature) | `day2.toml` reuses day-1 assignments |
| `CONDITIONS_FROM_CSV` (alternative) | `conditions.csv` plus a commented-out config |
| `consent_nc` + explicit `assign_condition` | `day2.toml`'s page list |
| `conditional_routing` in `PAGE_LIST` | Per-condition branches on both days |
| Per-condition instruction templates | `menu_task/templates/instructions/*.html` |
| A self-contained custom blueprint | `menu_task/` (routes, templates, instructions, static, table) |
| JSON questionnaires | `questionnaires/demographics.json`, `recall.json` |
| Project-local static files (JS, CSS) | `menu_task/static/` |
| Per-trial logging via `JSONTable` | `menu_task/tables/menu_trials.json` |
| `JSONTable` `json` column type | `trajectory` column (raw mouse samples) |
| Calculated export fields (accuracy, mean RT) | `exports` block in `menu_trials.json` |
| Static completion codes | `STATIC_COMPLETION_CODE` on both days |

The rest of the README walks through these in roughly the order you'll
meet them.

## Carrying conditions across sessions

Linking a day-2 participant back to their day-1 condition is the
central problem in any longitudinal BOFS study, and it's the main
thing this example exists to teach. The full treatment is in
[Longitudinal Experiments](https://bride-of-frankensystem.readthedocs.io/en/latest/examples/longitudinal.html);
the short version follows.

**Day 1** uses BOFS's standard balanced condition assignment. The
participant lands on `/consent`, gets randomly assigned to condition 1
or 2 the first time they submit consent, and the next page
(`/external_id`) captures their Participant ID. That ID is stored on
their participant row in `longitudinal_day1.db`.

**Day 2** sets:

```toml
CONDITIONS_FROM_DB = 'sqlite:///longitudinal_day1.db'
```

When the participant submits their Participant ID and reaches
`/assign_condition`, BOFS opens day 1's database read-only, looks up
that ID, and assigns the same condition. The
[`conditional_routing`](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/project_configuration.html)
block in the page list then sends them to the matching recall test.

If a participant tries to start day 2 with an ID that day 1's database
has never seen, they get an "ID Not Recognized" page and **cannot
proceed**. That's deliberate: in a real study, an unknown ID means
the person didn't finish day 1 and shouldn't be in day 2.

### Why the page list ordering matters on day 2

`day2.toml`'s `PAGE_LIST` does two things differently from a typical
single-day study:

1. The first page is **`consent_nc`** ("no condition") instead of
   plain `consent`. Plain `consent` runs condition assignment at
   submission time, which would burn a random condition *before* the
   Participant ID has even been collected. `consent_nc` skips that,
   leaving the slot open for the lookup.
2. **`assign_condition`** is an explicit step in the page list, placed
   *after* `external_id`. That's the route that actually performs the
   CSV/DB lookup — and it needs an ID to look up.

Forget either of these and the participant gets randomized at consent
and the lookup silently never fires. Worth knowing about.

### CSV instead of (or in addition to) the DB

`conditions.csv` is included as a sample. To use it, edit `day2.toml`:

```toml
CONDITIONS_FROM_CSV = 'conditions.csv'
#CONDITIONS_FROM_DB = 'sqlite:///longitudinal_day1.db'
```

If both keys are set, the **CSV wins on hits** and the DB is the
fallback. Useful when you want to override a handful of pre-decided
assignments on top of an otherwise DB-driven lookup — for example,
pinning a few pilot participants to a fixed condition while everyone
else inherits from day 1.

## A note on the recall task

Day 2's recall menu is **unlabeled** on purpose: with labels visible,
the test would measure label-reading rather than retention. This
favours marking menus (which were designed for eyes-free expert use)
over linear menus, but that asymmetry is the point — it
operationalises the hypothesis that marking menus support spatial
retention better.

This isn't a BOFS feature, just commentary on the study design.

## Adding a custom interactive task

The `menu_task/` folder is a complete worked example of a
[custom Flask blueprint](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_custom_pages.html)
inside a BOFS project. If you've only ever used BOFS for
questionnaires, this is the part to read closely.

### Anatomy of the blueprint

```
menu_task/
├── views.py                          # 4 Flask routes, one per (phase × technique)
├── templates/
│   ├── task.html                     # Shared task template extending BOFS's base layout
│   └── instructions/
│       ├── learn_linear.html         # Day-1 linear instructions
│       ├── learn_marking.html        # Day-1 marking instructions
│       ├── recall_linear.html        # Day-2 linear reminder
│       └── recall_marking.html       # Day-2 marking reminder
├── tables/menu_trials.json           # JSONTable schema — auto-creates the DB table
└── static/
    ├── d3.v7.min.js                  # D3 v7, bundled for offline use
    ├── linear_menu.js                # Drop-down menu component
    ├── marking_menu.js               # Radial press-and-drag menu component
    ├── task_runner.js                # Trial loop, trajectory capture, batch POST
    └── menu_task.css                 # Task styling
```

Three things make this a normal BOFS blueprint and not something
exotic:

- **The folder name is the blueprint name.** BOFS auto-discovers any
  folder in your working directory that contains a `views.py`
  declaring a Flask `Blueprint` of the same name. No registration.
- **`templates/` and `static/` are wired up automatically.** The
  template extends `template.html` (BOFS's base layout) so it
  inherits the breadcrumb bar, page title, and styling. Static
  assets are served at `/menu_task/<filename>` — see the `url_for`
  calls in `task.html`.
- **The four routes are listed in `PAGE_LIST` and guarded with
  `@verify_session_valid` and `@verify_correct_page`** so participants
  can't skip ahead or revisit a finished page.

The instruction templates live inside the blueprint too. BOFS searches
every blueprint's template folder when resolving `instructions/<name>`,
so a `PAGE_LIST` entry like `path='instructions/learn_linear'`
resolves to `menu_task/templates/instructions/learn_linear.html`
without any extra wiring. The whole task — Python routes, instruction
copy, task UI, schema, JS, CSS — sits in one self-contained folder
that you can copy into another project as a unit. The
`ab_experiment/` example in this repo does exactly that: same
`menu_task/` folder, different `PAGE_LIST` and conditions.

If you've never built a custom page before, the
[Simple Custom Pages](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/simple_custom_pages.html)
guide is a gentler starting point; this example then shows how to
grow that pattern into a full interactive task.

### Per-trial logging with `JSONTable`

Every interactive task needs a place to put its trial data, and
[`JSONTable`](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html)
is the BOFS mechanism for that. Drop a JSON file in
`menu_task/tables/` and BOFS will:

1. create a database table matching the schema at startup;
2. expose a `POST /table/<table_name>` endpoint that accepts row data;
3. include the table in CSV exports from the admin panel.

`menu_trials.json` declares one row per trial:

| Column | Type | Notes |
|---|---|---|
| `phase` | string | `"learning"` or `"recall"` |
| `technique` | string | `"linear"` or `"marking"` |
| `trial_index` | integer | 0-based |
| `prompted_command` | string | Which command we asked them to select |
| `selected_command` | string | What they actually selected |
| `correct` | boolean | True iff `selected == prompted` |
| `response_time_ms` | integer | From prompt display to selection |
| `trajectory` | json | Array of `{t, x, y}` mouse samples for the trial |

Two things worth flagging:

- **`trajectory` has type `json`.** That column type lets you store
  arbitrary structured data per row without flattening it into
  separate columns. Here it stores the raw mouse-trajectory samples
  captured during each trial, preserved as-is on export.
- **All trials are batch-POSTed in a single request.**
  `task_runner.js` accumulates trial rows in memory and sends them at
  the end:

  ```js
  fetch('/table/menu_trials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
  })
  ```

  The endpoint accepts a single row or an array, so you can choose
  between writing each trial as it finishes or batching at the end.
  Batching is friendlier on the server and easier to recover from on
  the client (one retry vs. N).

### Calculated export fields

The `exports` block in `menu_trials.json` adds per-participant summary
columns to the admin "Export" page — no SQL or post-processing needed
for first-pass analysis. Each block is a SQL filter plus a set of
aggregate expressions:

```json
"exports": [
  { "filter": "phase = 'learning'",
    "fields": {
      "learning_trials_completed": "count(trial_index)",
      "learning_accuracy": "avg(correct)",
      "learning_avg_response_ms": "avg(response_time_ms)"
    }
  },
  { "filter": "phase = 'recall'",
    "fields": {
      "recall_trials_completed": "count(trial_index)",
      "recall_correct_count": "sum(correct)",
      "recall_accuracy": "avg(correct)",
      "recall_avg_response_ms": "avg(response_time_ms)"
    }
  }
]
```

`avg(correct)` gives you a proportion correct between 0 and 1, since
the boolean column stores 0/1 in SQLite. Full syntax (including
`group_by`, `order_by`, `having`) is on the
[Database Tables](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html)
page.

Day 1's rows land in `longitudinal_day1.db`; day 2's rows land in
`longitudinal_day2.db`. The `phase` column lets analysis split them
when you join the two databases offline.

## Questionnaires

Two short questionnaires demonstrate the
[JSON questionnaire system](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/basic_questionnaires.html):

- `questionnaires/demographics.json` (day 1, before the task) uses
  `num_field`, `drop_down`, and `radiolist` question types.
- `questionnaires/recall.json` (day 2, after the task) uses `slider`,
  `radiolist`, and `multi_field`.

Each one is exposed at `/questionnaire/<name>` and wired into the page
list by name. Full reference for the question types is in
[Question Types](https://bride-of-frankensystem.readthedocs.io/en/latest/reference/question_types.html).

## Running the example

Run **day 1 first** so that `longitudinal_day1.db` exists for day 2 to
read. Both commands assume your working directory is this folder.

1. **Run day 1** (debug mode):
   ```
   BOFS run day1.toml -d
   ```
   Open <http://localhost:5003/>, complete the flow as a fake
   participant, and note the Participant ID you enter. Repeat with a
   few different IDs so you cover both conditions. The admin panel at
   <http://localhost:5003/admin> (password: `example`) lets you inspect
   each participant's progress and download `menu_trials` as CSV.

2. **Stop day 1**, then **run day 2**:
   ```
   BOFS run day2.toml -d
   ```
   Open <http://localhost:5004/>. When asked for your Participant ID,
   enter the same one you used on day 1. You should see the "welcome
   back" reminder for whichever menu technique you were assigned,
   followed by the recall test and the self-report questionnaire.

3. **Try a fresh ID on day 2** to see the miss behaviour. Enter an ID
   that was never used on day 1 and you should see the "ID Not
   Recognized" page instead of advancing.

## File reference

| Path | Purpose |
|------|---------|
| `day1.toml` | Day 1 config: condition assignment + Participant ID + practice task. |
| `day2.toml` | Day 2 config: condition lookup from day 1 + recall task + self-report. |
| `consent.html` | Shared consent text for both days. |
| `conditions.csv` | Sample CSV for the `CONDITIONS_FROM_CSV` alternative. |
| `questionnaires/demographics.json` | Day 1 background questions. |
| `questionnaires/recall.json` | Day 2 self-report after the recall test. |
| `menu_task/views.py` | Blueprint with 4 routes for the four (phase × technique) task pages. |
| `menu_task/templates/task.html` | Shared task template extending BOFS's base layout. |
| `menu_task/templates/instructions/learn_*.html` | Day 1 instructions, per condition. |
| `menu_task/templates/instructions/recall_*.html` | Day 2 instructions, per condition. |
| `menu_task/static/d3.v7.min.js` | D3.js v7 (bundled for offline use). |
| `menu_task/static/linear_menu.js` | Drop-down menu component. |
| `menu_task/static/marking_menu.js` | Radial press-and-drag menu component. |
| `menu_task/static/task_runner.js` | Trial loop + trajectory capture + batch POST. |
| `menu_task/static/menu_task.css` | Task styling. |
| `menu_task/tables/menu_trials.json` | Per-trial logging schema. |

## Out of scope

Real longitudinal studies also need to schedule day-N invitations
(emails, re-invitations on the recruitment platform) and join per-day
databases for analysis. BOFS doesn't handle either; the framework's
job ends at making sure each day's session uses the right condition
for the right participant. This is called out as a known gap in the
[Longitudinal Experiments](https://bride-of-frankensystem.readthedocs.io/en/latest/examples/longitudinal.html)
docs.
