# lab.js Example — Stroop Task

The same Stroop study as `jspsych_example/`, built with
[lab.js](https://lab.js.org/) instead. Identical `PAGE_LIST` and
questionnaires; what differs is the JS framework and the per-trial row
shape posted to `/table/labjs_trials`.

```
labjs_example/
├── labjs_example.toml               # PAGE_LIST + port (5008)
├── tables/labjs_trials.json
├── static/
│   ├── labjs_stroop.js              # lab.flow.Sequence of fixation+stimulus screens
│   └── labjs/                       # vendored 20.2.4 — see VENDORED.md
└── templates/custom/labjs_stroop.html
```

Each stimulus screen sets `correctResponse`, so lab.js auto-tags
`correct` on the data row. The `'end'` handler filters
`study.options.datastore.data` by `trial_kind === 'stroop'`, maps each
row into typed columns plus a `raw` JSON blob, and batch-POSTs to
`/table/labjs_trials`. Then `/redirect_next_page`.
