# Longitudinal Example — Menu Learning Study

A two-session HCI study that demonstrates how to carry a participant's
day-1 condition forward to day 2 using
[`CONDITIONS_FROM_DB`](https://bride-of-frankensystem.readthedocs.io/en/latest/examples/longitudinal.html).
Day 1 randomises participants between a linear drop-down menu and a
marking menu (Kurtenbach & Buxton 1991) and runs 12 practice trials.
Day 2 looks them up by Participant ID, places them back in the same
condition, and runs 6 unlabeled recall trials.

`day1.toml` runs on port 5003; `day2.toml` on 5004. **Run day 1 first**
so `longitudinal_day1.db` exists for day 2 to read from.

## Carrying conditions across sessions

`day2.toml` sets:

```toml
CONDITIONS_FROM_DB = 'sqlite:///longitudinal_day1.db'
```

When the participant submits their ID and reaches `/assign_condition`,
BOFS opens day 1's database read-only, looks up that ID, and assigns the
same condition. Unknown IDs hit the "ID Not Recognized" page and cannot
proceed — deliberate, since an unknown ID means the participant never
finished day 1.

Two things about day 2's `PAGE_LIST` are easy to get wrong:

1. The first page is **`consent_nc`** ("no condition") instead of plain
   `consent`. Plain `consent` runs condition assignment at submit time,
   which would burn a random condition before the ID has been collected.
2. **`assign_condition`** is an explicit page in the list, *after*
   `external_id`. That route performs the lookup and needs the ID to
   already be on the session.

Forget either and the participant gets randomised at consent and the
lookup silently never fires.

### CSV alternative

`conditions.csv` is bundled as a sample. Swap to it by editing
`day2.toml`:

```toml
CONDITIONS_FROM_CSV = 'conditions.csv'
#CONDITIONS_FROM_DB = 'sqlite:///longitudinal_day1.db'
```

If both keys are set, **CSV wins on hits** and the DB is the fallback —
useful for pinning a few pilot participants to a fixed condition while
everyone else inherits from day 1.

## The custom task (`menu_task/`)

A complete worked example of a
[custom Flask blueprint](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_custom_pages.html)
inside a BOFS project. Four routes, one per (phase × technique). The
folder is also reused, unchanged, by `ab_experiment/`.

```
menu_task/
├── views.py                          # 4 Flask routes
├── templates/
│   ├── task.html                     # extends BOFS's base layout
│   └── instructions/{learn,recall}_{linear,marking}.html
├── tables/menu_trials.json           # per-trial schema (auto-creates the table)
└── static/
    ├── d3.v7.min.js
    ├── linear_menu.js                # drop-down menu component
    ├── marking_menu.js               # radial press-and-drag menu
    ├── task_runner.js                # trial loop + trajectory capture + batch POST
    └── menu_task.css
```

Three things make this a normal blueprint, not an exotic one:

- The folder name *is* the blueprint name. BOFS auto-discovers any
  folder in the working directory that contains a `views.py` declaring a
  Flask `Blueprint` of the same name.
- `templates/` and `static/` are wired up automatically. BOFS searches
  every blueprint's template folder when resolving `instructions/<name>`,
  so `path='instructions/learn_linear'` in `PAGE_LIST` resolves to
  `menu_task/templates/instructions/learn_linear.html` with no extra
  wiring. Static files are served at `/menu_task/<filename>`.
- The four routes are guarded with `@verify_session_valid` and
  `@verify_correct_page` so participants can't skip ahead.

If you've never built a custom page before,
[Simple Custom Pages](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/simple_custom_pages.html)
is a gentler starting point.

## Per-trial logging

`menu_trials.json` is a [`JSONTable`](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html)
schema. BOFS creates the table at startup, exposes
`POST /table/menu_trials`, and includes the table in admin CSV exports.

Two columns worth flagging:

- `correct` is a boolean; it stores 0/1 in SQLite, so `avg(correct)` in
  an export gives a proportion correct between 0 and 1.
- `trajectory` has type `json` — the raw `{t, x, y}` mouse-sample array
  per trial, preserved as-is on export. The `json` column type lets you
  store arbitrary structured data without flattening to extra columns.

`task_runner.js` accumulates trial rows in memory and batch-POSTs them
when the round ends. The endpoint accepts a single row or an array, so
you can also write each trial as it finishes; batching is friendlier on
the server and easier to recover from on the client.

The `exports` block in `menu_trials.json` adds per-participant summary
columns (accuracy, mean RT) to the admin Export page — split by phase
via SQL filters. No post-processing needed for first-pass analysis.

## Recall task design note

Day 2's recall menu is **unlabeled** on purpose: with labels visible, the
test would measure label-reading rather than retention. That asymmetry
favours marking menus (designed for eyes-free expert use), but the
asymmetry is the point — it operationalises the hypothesis that marking
menus support spatial retention better. Not a BOFS feature, just study
design.

## What this example doesn't cover

Real longitudinal studies also need to schedule day-N invitations
(emails, re-invitations on the recruitment platform) and join per-day
databases for analysis. BOFS doesn't handle either; the framework's job
ends at making sure each day's session uses the right condition for the
right participant. Same gap is called out in the
[Longitudinal Experiments](https://bride-of-frankensystem.readthedocs.io/en/latest/examples/longitudinal.html)
docs.
