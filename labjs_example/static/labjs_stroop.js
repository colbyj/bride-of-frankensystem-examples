// Stroop task implemented with lab.js 20.x. Trial-by-trial data is POSTed to
// /table/labjs_trials, which is backed by tables/labjs_trials.json. After the
// last trial we redirect to /redirect_next_page so BOFS advances to the next
// page in PAGE_LIST (the post-task questionnaire).

const COLORS = ["red", "green", "blue", "yellow"];
const KEY_FOR_COLOR = { red: "r", green: "g", blue: "b", yellow: "y" };

function buildTrials(nPerCondition) {
    const trials = [];
    for (let i = 0; i < nPerCondition; i++) {
        const c = COLORS[i % COLORS.length];
        trials.push({ word: c, ink_color: c, congruent: true });
    }
    for (let i = 0; i < nPerCondition; i++) {
        const word = COLORS[i % COLORS.length];
        const others = COLORS.filter(x => x !== word);
        const ink = others[i % others.length];
        trials.push({ word, ink_color: ink, congruent: false });
    }
    for (let i = trials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    return trials.map(t => ({ ...t, correct_key: KEY_FOR_COLOR[t.ink_color] }));
}

const trials = buildTrials(12);
const screens = [];
for (const t of trials) {
    screens.push(new lab.html.Screen({
        content: '<div class="stroop-fixation">+</div>',
        timeout: 500,
        data: { trial_kind: "fixation" },
    }));
    screens.push(new lab.html.Screen({
        content: `<div class="stroop-stim" style="color:${t.ink_color}">${t.word.toUpperCase()}</div>`,
        responses: {
            "keypress(r)": "red",
            "keypress(g)": "green",
            "keypress(b)": "blue",
            "keypress(y)": "yellow",
        },
        correctResponse: t.ink_color,
        data: {
            trial_kind: "stroop",
            word: t.word,
            ink_color: t.ink_color,
            congruent: t.congruent,
            correct_key: t.correct_key,
        },
    }));
}

const study = new lab.flow.Sequence({ content: screens, plugins: [] });

study.on("end", () => {
    const rows = study.options.datastore.data
        .filter(d => d.trial_kind === "stroop")
        .map((d, idx) => {
            // lab.js fields vary slightly by component; pull RT defensively.
            const rt = (typeof d.duration === "number")
                ? d.duration
                : (d.time_response != null && d.time_run != null
                    ? d.time_response - d.time_run
                    : null);
            return {
                trial_index: idx,
                word: d.word,
                ink_color: d.ink_color,
                congruent: d.congruent,
                response: d.response,
                correct: d.correct === true,
                rt: rt,
                raw: d,
            };
        });

    fetch("/table/labjs_trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
    }).then(() => {
        window.location.href = "/redirect_next_page";
    });
});

study.run();
