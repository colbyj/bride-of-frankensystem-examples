# Tables and Expressions Example

A clicker task that records every individual click into one custom table
and a per-round summary into another, then renders a personalised
results page and reflection questionnaire entirely from JSONTable
exports referenced via `{{ ... }}` placeholders.

```
tables_and_expressions_example/
├── tables_and_expressions.toml      # PAGE_LIST + port (5012)
├── tables/
│   ├── clicks.json                  # per-click detail (bulk POST per round)
│   └── scores.json                  # one row per round; scalar + group_by exports
├── static/my_task.js                # three-round clicker — POSTs to both tables
├── questionnaires/results.json      # uses {{ tables.scores.high_score }} etc.
└── templates/
    ├── simple/my_task.html
    └── instructions/results.html    # reads aggregates inline
```

What to look at:

- `static/my_task.js` POSTs an array of rows to `/table/clicks` in one
  request — bulk insert is a built-in feature of `/table/<name>`.
- `tables/scores.json` shows scalar exports (`high_score`, `mean_score`,
  `total_score`) and a `group_by` export (`round_score`) on the same
  table.
- `templates/instructions/results.html` and `questionnaires/results.json`
  both pull the aggregates back out via `{{ }}` placeholders — same
  syntax in instructions HTML and questionnaire JSON.

References:

- [Expressions and the `{{ }}` DSL](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/expressions.html)
- [Substitution rules in questionnaires](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/advanced_questionnaires.html)
- [Database Tables (bulk insert + exports)](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html)
