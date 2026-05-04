let score = 0;

function setup() {
    createCanvas(720, 400);
}

function draw() {
    background(230);
    text('score is ' + score, 100, 100);
}

function mousePressed() {
    score += 1;
}

// Send our score after 5000 seconds
setTimeout(function () {
    let dataToSend = {
        score: score
    };

    $.post("/table/my_task", dataToSend, function () {
        window.location.href = "/redirect_next_page"
    });
}, 5000);