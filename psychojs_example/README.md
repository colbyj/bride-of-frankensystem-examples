# PsychoJS Example — Stroop Task

[PsychoJS](https://psychopy.org/online/) running a Stroop task built in
[PsychoPy Builder](https://psychopy.org/), exported as HTML+JS, and
adapted to post trial data to a BOFS table instead of Pavlovia.

```
psychojs_example/
├── psychojs_example.toml             # PAGE_LIST + port (5011)
├── tables/psychojs_trials.json
├── static/
│   ├── psychojs_stroop.js            # adapted Builder export — see edits below
│   └── psychojs/
│       ├── trialTypes.csv            # Stroop conditions (word, letterColor, corrAns)
│       └── lib/                      # vendored 2026.1.3 — see VENDORED.md
└── templates/custom/psychojs_stroop.html  # standalone HTML, no BOFS chrome
```

Trial rows accumulate in a small `bofsTrials` array during
`trialRoutineEnd` and are batch-POSTed to `/table/psychojs_trials` when
the experiment ends, then `/redirect_next_page`.

## Adapting your own Builder export

Four targeted edits, each marked with a `// BOFS:` comment:

1. **Lib path** rewritten to `/static/psychojs/lib/psychojs-2026.1.3.js`.
2. **`DlgFromDict` removed** — `expInfo['participant']` is prefilled
   from `window.BOFS_PARTICIPANT_ID` (set by the BOFS template) and the
   `flowScheduler` is scheduled directly.
3. **Resources passed explicitly** to `psychoJS.start()`, since there is
   no Pavlovia `config.json` to auto-discover from. `trialTypes.csv`
   maps to `/static/psychojs/trialTypes.csv`.
4. **`quitPsychoJS` overridden** to POST `bofsTrials` and redirect
   instead of calling `psychoJS.quit()` (which would try to upload to
   Pavlovia).

Window opens with `fullscr: false` because the user-gesture from BOFS's
"Next" click is consumed by the page navigation. If you need fullscreen,
add a "Click to begin" overlay that calls
`document.documentElement.requestFullscreen()` before scheduling
PsychoJS.

PsychoJS lib bundles are at `https://lib.pavlovia.org/psychojs-VERSION.{js,css,iife.js}`.
