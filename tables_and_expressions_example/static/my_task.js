// 3-round clicker that captures every click into the granular `clicks`
// table and writes a one-row summary to `scores` at the end of each round.
//
// Each round runs for ROUND_DURATION_MS. While the round is running, every
// click is recorded as an in-memory object {round, index, t_ms, x, y}. At
// end of round, the captured array is bulk-POSTed to /table/clicks (one
// HTTP request per round, list payload accepted by JSONTable.handle_post),
// and a separate single-row POST to /table/scores records the round total.

const ROUND_DURATION_MS = 5000;
const NUM_ROUNDS = 3;

let currentRound = 1;
let roundStart = 0;
let roundClicks = [];
let advancing = false;

function setup() {
    createCanvas(720, 400);
    roundStart = millis();
}

function draw() {
    background(230);
    noStroke();
    fill(60);
    textSize(20);
    text(`Round ${currentRound} of ${NUM_ROUNDS}`, 20, 30);
    textSize(16);
    text(`Clicks this round: ${roundClicks.length}`, 20, 60);
    const remaining = Math.max(0, ROUND_DURATION_MS - (millis() - roundStart));
    text(`Time left: ${(remaining / 1000).toFixed(1)}s`, 20, 84);

    if (!advancing && millis() - roundStart >= ROUND_DURATION_MS) {
        advancing = true;
        endRound();
    }
}

function mousePressed() {
    // Only register clicks that landed inside the canvas.
    if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) return;
    if (advancing) return;
    roundClicks.push({
        round: currentRound,
        index: roundClicks.length + 1,
        t_ms: Math.round(millis() - roundStart),
        x: Math.round(mouseX),
        y: Math.round(mouseY),
    });
}

function endRound() {
    const clicksPayload = roundClicks.slice();
    const score = clicksPayload.length;
    const summaryPayload = {round: currentRound, score: score};

    // 1) Bulk-POST every click captured this round (list payload).
    const postClicks = fetch('/table/clicks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(clicksPayload),
    });

    // 2) Single-row POST of the per-round summary.
    const postScore = fetch('/table/scores', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(summaryPayload),
    });

    Promise.all([postClicks, postScore]).then(function () {
        if (currentRound >= NUM_ROUNDS) {
            window.location.href = '/redirect_next_page';
        } else {
            currentRound += 1;
            roundClicks = [];
            roundStart = millis();
            advancing = false;
        }
    });
}
