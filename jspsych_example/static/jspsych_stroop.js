// Stroop task implemented with jsPsych 7.x. Trial-by-trial data is POSTed to
// /table/jspsych_trials, which is backed by tables/jspsych_trials.json. After the
// last trial we redirect to /redirect_next_page so BOFS advances to the next
// page in PAGE_LIST (the post-task questionnaire).

const COLORS = ["red", "green", "blue", "yellow"];
const KEY_FOR_COLOR = { red: "r", green: "g", blue: "b", yellow: "y" };

function buildStimulus(word, inkColor) {
    return `<div class="stroop-stim" style="color:${inkColor}">${word.toUpperCase()}</div>`;
}

function buildTrials(nPerCondition = 12) {
    const trials = [];
    // Congruent: word == ink color
    for (let i = 0; i < nPerCondition; i++) {
        const c = COLORS[i % COLORS.length];
        trials.push({ word: c, ink_color: c, congruent: true });
    }
    // Incongruent: word != ink color
    for (let i = 0; i < nPerCondition; i++) {
        const word = COLORS[i % COLORS.length];
        const others = COLORS.filter(c => c !== word);
        const ink = others[i % others.length];
        trials.push({ word: word, ink_color: ink, congruent: false });
    }
    // Fisher-Yates shuffle
    for (let i = trials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    return trials;
}

const jsPsych = initJsPsych({
    on_finish: function () {
        const allTrials = jsPsych.data.get().filter({ task: "stroop" }).values();
        const rows = allTrials.map((t, idx) => ({
            trial_index: idx,
            word: t.word,
            ink_color: t.ink_color,
            congruent: t.congruent,
            response: t.response,
            correct: t.correct,
            rt: t.rt,
            raw: t,
        }));

        fetch("/table/jspsych_trials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rows),
        }).then(() => {
            window.location.href = "/redirect_next_page";
        });
    },
});

const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="stroop-stim">+</div>',
    choices: "NO_KEYS",
    trial_duration: 500,
};

const stroopTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable("stimulus"),
    choices: ["r", "g", "b", "y"],
    data: {
        task: "stroop",
        word: jsPsych.timelineVariable("word"),
        ink_color: jsPsych.timelineVariable("ink_color"),
        congruent: jsPsych.timelineVariable("congruent"),
        correct_key: jsPsych.timelineVariable("correct_key"),
    },
    on_finish: function (data) {
        data.correct = data.response === data.correct_key;
    },
};

const stimuli = buildTrials(12).map(t => ({
    word: t.word,
    ink_color: t.ink_color,
    congruent: t.congruent,
    correct_key: KEY_FOR_COLOR[t.ink_color],
    stimulus: buildStimulus(t.word, t.ink_color),
}));

const procedure = {
    timeline: [fixation, stroopTrial],
    timeline_variables: stimuli,
    randomize_order: false,  // already shuffled in buildTrials
};

jsPsych.run([procedure]);
