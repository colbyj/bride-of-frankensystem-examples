// Generic trial-loop driver for the menu-learning study.
//
// Drives N prompted trials of menu use, captures mouse trajectory during
// each trial, shows feedback in the learning phase, and batch-POSTs all
// rows to /table/menu_trials at the end. Then advances to the next page.
//
// Usage from a template:
//   MenuTaskRunner.start({
//       phase: 'learning' | 'recall',
//       technique: 'linear' | 'marking',
//       commands: ['Save', 'Undo', ...],
//       trialCount: 12,
//       mountSelector: '#menu-mount',
//       promptSelector: '#prompt',
//       feedbackSelector: '#feedback',
//       progressSelector: '#progress',
//       continueSelector: '#continue-btn',
//   });

window.MenuTaskRunner = (function () {

    const FEEDBACK_DURATION_MS = 1500;
    const POST_FEEDBACK_PAUSE_MS = 400;
    const TRAJECTORY_LOG_URL = '/table/menu_trials';

    function shuffle(arr) {
        // Fisher–Yates in place; returns the same array for chaining.
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function buildPromptOrder(commands, trialCount) {
        // Repeat the command list as many times as needed to reach trialCount,
        // then trim and shuffle. Guarantees an even per-command count when
        // trialCount is a multiple of commands.length.
        const reps = Math.ceil(trialCount / commands.length);
        const order = [];
        for (let i = 0; i < reps; i += 1) order.push(...commands);
        return shuffle(order).slice(0, trialCount);
    }

    function mountMenu(technique, mountEl, commands, opts) {
        if (technique === 'linear') return window.LinearMenu(mountEl, commands, opts);
        if (technique === 'marking') return window.MarkingMenu(mountEl, commands, opts);
        throw new Error(`Unknown technique: ${technique}`);
    }

    function start(config) {
        const phase = config.phase;
        const technique = config.technique;
        const commands = config.commands;
        const trialCount = config.trialCount;
        const showFeedback = phase === 'learning';
        // Recall phase hides labels — the menu structure is still shown so
        // the participant has targets, but command names are blanked. This
        // tests spatial/directional memory rather than label recognition.
        const blind = phase === 'recall';

        const mountEl = document.querySelector(config.mountSelector);
        const promptEl = document.querySelector(config.promptSelector);
        const feedbackEl = document.querySelector(config.feedbackSelector);
        const progressEl = document.querySelector(config.progressSelector);
        const continueEl = document.querySelector(config.continueSelector);

        const menu = mountMenu(technique, mountEl, commands, { blind: blind });
        const promptOrder = buildPromptOrder(commands, trialCount);
        const rows = [];

        let trialIndex = 0;
        let trialStart = 0;
        let trajectory = [];

        function captureMove(event) {
            // Coordinates relative to the mount element so analyses are
            // independent of viewport size and scroll.
            const rect = mountEl.getBoundingClientRect();
            trajectory.push({
                t: Math.round(performance.now() - trialStart),
                x: Math.round(event.clientX - rect.left),
                y: Math.round(event.clientY - rect.top),
            });
        }

        function setProgress() {
            progressEl.textContent =
                `Trial ${Math.min(trialIndex + 1, trialCount)} of ${trialCount}`;
        }

        function setPrompt(command) {
            promptEl.innerHTML = `Select <strong>${command}</strong>`;
        }

        function clearFeedback() {
            feedbackEl.textContent = '';
            feedbackEl.className = 'feedback';
        }

        function startTrial() {
            if (trialIndex >= trialCount) return finishAll();

            const prompted = promptOrder[trialIndex];
            setProgress();
            setPrompt(prompted);
            clearFeedback();
            menu.clearHighlight();

            trajectory = [];
            trialStart = performance.now();
            document.addEventListener('mousemove', captureMove);

            menu.enable();
            menu.onSelect = (selected) => onSelection(prompted, selected);
        }

        function onSelection(prompted, selected) {
            const responseTime = Math.round(performance.now() - trialStart);
            document.removeEventListener('mousemove', captureMove);
            menu.disable();

            const correct = selected === prompted;
            rows.push({
                phase: phase,
                technique: technique,
                trial_index: trialIndex,
                prompted_command: prompted,
                selected_command: selected || '',
                correct: correct,
                response_time_ms: responseTime,
                trajectory: trajectory,
            });

            trialIndex += 1;

            if (!showFeedback) {
                setTimeout(startTrial, POST_FEEDBACK_PAUSE_MS);
                return;
            }

            if (correct) {
                feedbackEl.textContent = 'Correct ✓';
                feedbackEl.className = 'feedback feedback-correct';
                setTimeout(startTrial, FEEDBACK_DURATION_MS);
            } else {
                feedbackEl.textContent = `Not quite — ${prompted} is here:`;
                feedbackEl.className = 'feedback feedback-incorrect';
                menu.highlight(prompted);
                setTimeout(startTrial, FEEDBACK_DURATION_MS);
            }
        }

        function finishAll() {
            promptEl.textContent = '';
            progressEl.textContent = `Done — sending data…`;
            feedbackEl.textContent = '';
            menu.destroy();

            fetch(TRAJECTORY_LOG_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rows),
            }).then((r) => {
                if (!r.ok) throw new Error(`POST failed: ${r.status}`);
                progressEl.textContent = 'Saved.';
                continueEl.style.display = 'inline-block';
                continueEl.addEventListener('click', () => {
                    window.location.href = '/redirect_next_page';
                });
            }).catch((err) => {
                progressEl.textContent =
                    `Error saving data: ${err.message}. Please contact the researcher.`;
            });
        }

        startTrial();
    }

    return { start };
})();
