# jsPsych Example — Stroop Task

[jsPsych](https://www.jspsych.org/) running a 24-trial Stroop on a single
`custom/` page; everything else (consent, demographics, post-task
questionnaire, page flow, storage) is stock BOFS.

```
jspsych_example/
├── jspsych_example.toml             # PAGE_LIST + port (5009)
├── tables/jspsych_trials.json       # per-trial column schema for /table/jspsych_trials
├── static/
│   ├── jspsych_stroop.js            # builds the timeline; on_finish POSTs and redirects
│   └── jspsych/                     # vendored 8.2.3 — see VENDORED.md to upgrade
└── templates/custom/jspsych_stroop.html  # full HTML, no BOFS chrome
```

The custom page bypasses BOFS's template wrapping so jsPsych owns the
viewport. After the timeline ends, the script batch-POSTs trial rows to
`/table/jspsych_trials` (built-in endpoint, schema in
`tables/jspsych_trials.json`, auto-stamps `participantID` /
`timeSubmitted`), then navigates to `/redirect_next_page`.
