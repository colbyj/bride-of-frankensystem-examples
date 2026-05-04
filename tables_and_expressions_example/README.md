# Tables and Expressions Example

A clicker task that captures every individual click into one custom table and a
per-round summary into a second custom table, then renders a personalized
results page and reflection questionnaire entirely from JSONTable exports
referenced through `{{ ... }}` placeholders.

## Run it

From this directory:

```
BOFS run tables_and_expressions.toml -d
```

then visit http://localhost:5006/. Admin panel: http://localhost:5006/admin
(password: `example`).

## What it covers

| Pattern | Where |
|---|---|
| Bulk insert to a JSONTable — POST a list of rows in a single request | `static/my_task.js` → `/table/clicks` |
| Two custom tables in one task — a detail table and a summary table | `tables/clicks.json`, `tables/scores.json` |
| Scalar exports + `group_by` exports on the same table | `tables/scores.json` (`high_score`, `mean_score`, `total_score`, `round_score`) |
| Reading aggregates in a Jinja instructions template | `templates/instructions/results.html` |
| Inline `{{ ... }}` placeholders in a questionnaire JSON | `questionnaires/results.json` |

## Layout

```
tables_and_expressions_example/
├── tables_and_expressions.toml      # BOFS config (port 5006, PAGE_LIST)
├── consent.html
├── tables/
│   ├── clicks.json                  # per-click detail (bulk POST per round)
│   └── scores.json                  # one row per round; scalar + group_by exports
├── static/
│   ├── my_task.js                   # three-round clicker, two POST endpoints
│   └── p5.min.js
├── questionnaires/
│   └── results.json                 # uses {{ tables.scores.high_score }} etc.
└── templates/
    ├── simple/my_task.html          # task page (loads p5 + my_task.js)
    └── instructions/
        ├── task_instructions.html
        └── results.html
```

## Reference

- Expression DSL and subscript syntax: [Expressions](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/expressions.html)
- Substitution rules for `{{ }}` placeholders: [Advanced Questionnaires](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_questionnaires.html)
- Bulk-insert format for JSONTables: [Database Tables](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html)
