# lab.js Example — Stroop Task with BOFS Backend

A worked example of integrating [lab.js](https://lab.js.org/) with Bride of
Frankensystem (BOFS). lab.js runs the trial-by-trial Stroop task in the
browser; BOFS handles consent, demographics and post-task questionnaires,
condition assignment, page flow, and data storage.

## Layout

```
labjs_example/
├── labjs_example.toml               # BOFS config (port 5007, PAGE_LIST)
├── consent.html
├── questionnaires/
│   ├── demographics.json
│   └── post_task.json
├── tables/
│   └── labjs_trials.json            # per-trial column schema
├── static/
│   ├── labjs_stroop.js              # Stroop sequence + POST + redirect
│   └── labjs/                       # vendored 20.2.4 (see VENDORED.md)
└── templates/
    ├── custom/labjs_stroop.html     # standalone HTML, no BOFS chrome
    └── instructions/task_instructions.html
```

## Running

```
BOFS run labjs_example.toml -d
```

Visit <http://127.0.0.1:5007/>. Admin panel: <http://127.0.0.1:5007/admin>
(password: `example`).

## How it works

The PAGE_LIST routes the participant through built-in BOFS pages (consent,
two questionnaires, an instructions snippet, end) and one `custom/` page,
`/custom/labjs_stroop`, which is the only page that runs lab.js.

The custom page is a complete HTML document — BOFS renders it directly with
no template wrapping, so lab.js has full control of the viewport. It loads
vendored lab.js and runs `static/labjs_stroop.js`. That script builds 24
fixation+stimulus pairs as `lab.html.Screen` components inside a
`lab.flow.Sequence`. Each stimulus screen sets `correctResponse` so lab.js
auto-tags `correct` on the data row, and a `data: { trial_kind: 'stroop',
... }` field merges per-trial fields into the row. After the sequence ends,
the `'end'` handler filters `study.options.datastore.data` to
`trial_kind === 'stroop'`, maps each row to typed columns plus a `raw` JSON
blob, and POSTs the array to `/table/labjs_trials`. `/table/<name>` is a
built-in BOFS endpoint backed by `tables/labjs_trials.json`; it auto-stamps
`participantID` and `timeSubmitted`. After the POST resolves, the script
navigates to `/redirect_next_page` to advance BOFS to the post-task
questionnaire.
