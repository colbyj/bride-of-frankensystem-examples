# PsychoJS Example — Stroop Task with BOFS Backend

A worked example of integrating [PsychoJS](https://psychopy.org/online/) with
Bride of Frankensystem (BOFS). PsychoJS runs the trial-by-trial Stroop task in
the browser; BOFS handles consent, demographics and post-task questionnaires,
condition assignment, page flow, and data storage.

This is the PsychoPy Builder export workflow: the experiment was built in
[PsychoPy Builder](https://psychopy.org/) (the desktop app), exported as
HTML+JS, and adapted to send trial data to a BOFS data table instead of
Pavlovia.

## Layout

```
psychojs_example/
├── psychojs_example.toml             # BOFS config (port 5008, PAGE_LIST)
├── consent.html
├── questionnaires/
│   ├── demographics.json
│   └── post_task.json
├── tables/
│   └── psychojs_trials.json          # per-trial column schema
├── static/
│   ├── psychojs_stroop.js            # adapted Builder export (see "Adapting" below)
│   └── psychojs/
│       ├── trialTypes.csv            # Stroop trial conditions (word, letterColor, corrAns)
│       └── lib/                      # vendored 2026.1.3 (see VENDORED.md)
│           ├── psychojs-2026.1.3.js
│           ├── psychojs-2026.1.3.css
│           ├── psychojs-2026.1.3.iife.js
│           └── VENDORED.md
└── templates/
    ├── custom/psychojs_stroop.html   # standalone HTML, no BOFS chrome
    └── instructions/task_instructions.html
```

## Running

```
BOFS run psychojs_example.toml -d
```

Visit <http://127.0.0.1:5008/>. Admin panel: <http://127.0.0.1:5008/admin>
(password: `example`).

## How it works

The PAGE_LIST routes the participant through built-in BOFS pages (consent,
two questionnaires, an instructions snippet, end) and one `custom/` page,
`/custom/psychojs_stroop`, which is the only page that runs PsychoJS.

The custom page is a complete HTML document — BOFS renders it directly with
no template wrapping, so PsychoJS has full control of the viewport. It loads
the vendored `psychojs-2026.1.3.js` bundle and runs `static/psychojs_stroop.js`,
which initialises a `PsychoJS` instance, opens a windowed PIXI canvas, and
schedules the experiment routines (instructions, trials loop, thanks).

Trial-by-trial data is collected during the trials loop and POSTed in a single
batch to `/table/psychojs_trials` when the experiment ends. `/table/<name>` is
a built-in BOFS endpoint backed by `tables/psychojs_trials.json`; it
auto-stamps `participantID` and `timeSubmitted`. After the POST resolves, the
script navigates to `/redirect_next_page` to advance BOFS to the post-task
questionnaire.

## Adapting your own PsychoPy Builder export

This file is the unmodified Builder export from PsychoPy 2026.1.3 except for
four targeted edits, each marked with a `// BOFS:` comment so you can repeat
them in your own export:

1. **Lib path.** The `import` at the top of the script is rewritten to the
   absolute path `/static/psychojs/lib/psychojs-2026.1.3.js`.
2. **Skip the participant info dialog.** PsychoJS's default `DlgFromDict`
   prompt is removed; `expInfo['participant']` is prefilled from
   `window.BOFS_PARTICIPANT_ID`, which the BOFS template populates from the
   session. The `flowScheduler` is then scheduled directly.
3. **Register `trialTypes.csv` as a resource.** Pavlovia normally
   auto-discovers resources from a sibling `config.json`. Here `psychoJS.start()`
   takes an explicit `resources` array mapping the resource name
   `trialTypes.csv` to its URL `/static/psychojs/trialTypes.csv`.
   `TrialHandler.trialList` is left as the bare resource name.
4. **Override `quitPsychoJS`.** The Builder version calls `psychoJS.quit()`,
   which (under Pavlovia) uploads results and shows a "thank you" dialog. The
   BOFS version POSTs the per-trial rows to `/table/psychojs_trials` and
   navigates to `/redirect_next_page` instead. A small `bofsTrials` array
   accumulates the rows in `trialRoutineEnd` so we don't have to mine
   `psychoJS.experiment._trialsData` afterwards.

The window is opened with `fullscr: false` because the user-gesture from the
BOFS "Next" click is consumed by the page navigation; a fresh fullscreen
request would be blocked. If you need fullscreen, add a "Click to begin"
overlay on the custom page that calls `document.documentElement.requestFullscreen()`
on click before scheduling PsychoJS.

## Upgrading PsychoJS

Versions, sources, and SHA256 hashes live in `static/psychojs/lib/VENDORED.md`.
The bundled lib files for each PsychoPy release are served from
`https://lib.pavlovia.org/psychojs-VERSION.{js,css,iife.js}`.
