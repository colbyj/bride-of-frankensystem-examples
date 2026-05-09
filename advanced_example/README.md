# Advanced Example

A grab-bag project that touches most of BOFS's moving parts in one
flow: every common question type, a custom question type rendered from
the project's own template, a custom blueprint with a POST-handling
task and an admin-only analysis page, a custom `JSONTable`, two
conditions reordered via `conditional_routing`, and an external ID
prompt. Use this as a reference when you want to see how the pieces
fit together — the per-feature examples in this repo are usually a
better starting point if you only need one of them.

## Layout

```
advanced_example/
├── advanced.toml                       # PAGE_LIST, conditions, external_id prompt (port 5002)
├── consent.html
├── questionnaires/
│   ├── example.json                    # showcase of built-in question types
│   ├── grid.json
│   └── variables.json                  # uses the custom question type below
├── tables/example.json                 # JSONTable column types (integer/float/boolean/string)
├── templates/instructions/
│   └── example_instructions.html
└── my_blueprint/                       # auto-discovered Flask blueprint
    ├── views.py                        # /task with retry-on-wrong, /analysis (admin-only)
    ├── tables/answers.json             # one row per submitted answer; export = total_guesses
    ├── templates/
    │   ├── task.html
    │   ├── analysis.html               # rendered at /analysis, gated by @verify_admin
    │   └── questions/custom.html       # the custom question type
    └── static/tux.png
```

## What to look at

**Built-in question types.** `questionnaires/example.json` puts one of
each on the same page: `radiogrid`, `radiolist`, `checklist`, `slider`,
`field`, `num_field`, `drop_down`, `multi_field`, `textview`. The final
`textview` shows that its `text` is rendered as HTML, so you can embed
the blueprint's static asset (`/my_blueprint/tux.png`) right inline.
Full reference: [Question Types](https://bride-of-frankensystem.readthedocs.io/en/latest/reference/question_types.html).

**Custom question type.** `variables.json` declares a question with
`"questiontype": "custom"`. BOFS resolves that to
`my_blueprint/templates/questions/custom.html`, which references a
prior answer via `participant.questionnaire("example").radiolist_1` and
renders its own form inputs with `name="{{ question.id }}"`. That same
input id becomes a column on the `variables` questionnaire table. See
[Custom Question Types](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/custom_question_types.html).

**Custom blueprint.** `my_blueprint/views.py` has two routes:

- `/task` is in `PAGE_LIST` and handles its own POST — wrong answers
  re-render with `incorrect=True`, the right answer (`linux`) writes a
  row to the `answers` table and calls `/redirect_next_page`. Decorated
  with `@verify_correct_page` and `@verify_session_valid` so
  participants can't skip ahead. Note `@page_tables('answers')`, which
  exposes the table as `db.answers`.
- `/analysis` is **not** in `PAGE_LIST`; it's an admin-only page
  (`@verify_admin`) that joins `Participant` against `answers` to count
  guesses per finished participant. Hit it directly at
  <http://localhost:5002/analysis> after logging in to `/admin`.

**Per-question logging.** `tables/answers.json` is a `JSONTable` with a
single `answer` column and an export aggregate (`count(answer) AS
total_guesses`) that surfaces in the admin Export page. See
[Database Tables](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html).

**Conditional routing.** Both conditions answer the same two follow-up
questionnaires (`grid` and `variables`), but in different orders. The
`conditional_routing` block in `PAGE_LIST` is the smallest such pattern
in the repo;
[`ab_experiment/`](../ab_experiment/) shows the more usual
"each condition runs different content" version.

**Other config worth noting.** `advanced.toml` sets
`RETRIEVE_SESSIONS = true` (so a returning participant resumes where
they left off) and `LOG_QUESTIONNAIRE_INTERACTIONS = true` (focus /
blur / change / paste events on inputs are logged for review).
