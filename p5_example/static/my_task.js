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

// Send our score after 5000 milliseconds
setTimeout(function () {
    let dataToSend = {
        score: score
    };

    fetch("/table/my_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dataToSend)
    }).then(function () {
        window.location.href = "/redirect_next_page";
    });
}, 5000);