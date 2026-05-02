# jsPsych Example — Stroop Task with BOFS Backend

A worked example of integrating [jsPsych](https://www.jspsych.org/) with Bride
of Frankensystem (BOFS). jsPsych runs the trial-by-trial Stroop task in the
browser; BOFS handles consent, demographics and post-task questionnaires,
condition assignment, page flow, and data storage.

## Layout

```
jspsych_example/
├── jspsych_example.toml                 # BOFS config (port 5006, PAGE_LIST)
├── consent.html
├── questionnaires/
│   ├── demographics.json
│   └── post_task.json
└── jspsych_stroop/                      # auto-discovered blueprint
    ├── views.py                         # one route: /jspsych_stroop
    ├── templates/
    │   ├── jspsych_stroop.html
    │   └── instructions/task_instructions.html
    ├── static/
    │   ├── jspsych_stroop.js            # Stroop timeline + POST + redirect
    │   └── jspsych/                     # vendored 8.2.3 (see VENDORED.md)
    └── tables/jspsych_trials.json       # per-trial column schema
```

## Running

```
BOFS run jspsych_example.toml -d
```

Visit <http://127.0.0.1:5006/>. Admin panel: <http://127.0.0.1:5006/admin>
(password: `example`).

## How it works

The PAGE_LIST routes the participant through built-in BOFS pages (consent,
two questionnaires, an instructions snippet, end) and one custom blueprint
route, `/jspsych_stroop`, which is the only page that runs jsPsych.

The blueprint serves a stand-alone HTML page that loads vendored jsPsych +
the `html-keyboard-response` plugin and runs `static/jspsych_stroop.js`.
That script builds a 24-trial timeline (12 congruent + 12 incongruent), and
in its `on_finish` handler maps each trial to typed columns plus a `raw`
JSON blob and POSTs the array to `/table/jspsych_trials`. `/table/<name>`
is a built-in BOFS endpoint backed by `tables/jspsych_trials.json`; it
auto-stamps `participantID` and `timeSubmitted`. After the POST resolves,
the script navigates to `/redirect_next_page` to advance BOFS to the
post-task questionnaire.

## Upgrading jsPsych

Versions, sources, and SHA256 hashes live in
`jspsych_stroop/static/jspsych/VENDORED.md`.
