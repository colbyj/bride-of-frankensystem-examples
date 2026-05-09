# p5.js Example

A click-counter sketch built with [p5.js](https://p5js.org/) and dropped
onto a `simple/` template. Five seconds after the page loads, the
sketch POSTs the score to a custom table and advances to the next
BOFS page. The point is to show the smallest possible custom-task
pattern: vendored JS library + one HTML stub + one `JSONTable`.

```
p5_example/
├── p5_example.toml                   # PAGE_LIST + port (5005)
├── consent.html
├── tables/my_task.json               # one column (score); exports avg + max
├── static/
│   ├── p5.min.js                     # vendored
│   └── my_task.js                    # the p5 sketch + POST + redirect
└── templates/
    ├── instructions/task_instructions.html
    └── simple/my_task.html           # 3 lines: load p5, load sketch, <main>
```

`simple/my_task.html` is reached as `simple/my_task` in the page list.
A `simple/` template is wrapped in BOFS chrome (header, breadcrumbs,
footer) — contrast with the `custom/` templates used by the jsPsych /
lab.js / PsychoJS examples, which take over the full viewport. Since
this sketch only needs a canvas and is happy living inside the chrome,
`simple/` is the right fit.

The sketch itself is plain p5: `setup()` creates a 720×400 canvas;
`mousePressed()` increments `score`; `draw()` renders it. After 5000ms
a `setTimeout` POSTs `{ score }` to `/table/my_task` and then navigates
to `/redirect_next_page`. `/table/<name>` is a built-in BOFS endpoint
backed by `tables/my_task.json`, which auto-stamps `participantID` and
`timeSubmitted` and adds two export aggregates (`avg(score)`,
`max(score)`).

References:
[Simple Custom Pages](https://bride-of-frankensystem.readthedocs.io/en/latest/getting_started/simple_custom_pages.html),
[Database Tables](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/database_tables.html).
