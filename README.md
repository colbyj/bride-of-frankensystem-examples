# bride-of-frankensystem-examples

Example projects for [Bride of Frankensystem](https://bride-of-frankensystem.readthedocs.io/).
Each subdirectory is a runnable BOFS project with its own `README.md`
covering what it shows; this file is the index.

## Setup

Install BOFS into a virtual environment:

```
python -m venv bofs_venv
# activate it:
#   Windows (cmd):        .\bofs_venv\Scripts\activate.bat
#   Windows (PowerShell): .\bofs_venv\Scripts\Activate.ps1
#   macOS / Linux:        source bofs_venv/bin/activate
pip install bride-of-frankensystem
```

Verify by running `BOFS` with no arguments — you should see the help
message.

## Running an example

`cd` into the example's directory (the working directory must be the
same as the `.toml` file), then:

```
BOFS run <project>.toml -d
```

`-d` is debug mode. Drop the flag for production. Each example prints
its URL on startup; the admin panel is at `/admin` with password
`example`.

For PyCharm: run BOFS as a module, set the working directory to the
example, and pass the `.toml` file as the argument.

![Screenshot of PyCharm](pycharm_run.png)

## Examples

| Example | What it shows | Port |
|---|---|---|
| [`minimal_example/`](minimal_example/) | Smallest possible BOFS project — just questionnaires. | 5001 |
| [`advanced_example/`](advanced_example/) | Most BOFS features in one project: custom blueprint, custom DB tables, conditions, the lot. | 5002 |
| [`branching_example/`](branching_example/) | Question-level `show_if` and page-level `conditional_routing`. | 5007 |
| [`embedding_media_example/`](embedding_media_example/) | Every place images, audio, and video can sit in a study, with telemetry. | 5005 |
| [`tables_and_expressions_example/`](tables_and_expressions_example/) | Custom `JSONTable`s, scalar + `group_by` exports, `{{ }}` placeholders in instructions and questionnaires. | 5012 |
| [`ab_experiment/`](ab_experiment/) | Smallest example using `CONDITIONS` and `conditional_routing`. | 5010 |
| [`longitudinal_example/`](longitudinal_example/) | Two-session study; day 2 carries day 1's conditions forward via `CONDITIONS_FROM_DB`. | 5003 / 5004 |
| [`p5_example/`](p5_example/) | A custom interactive page driven by [p5.js](https://p5js.org/). | 5005 |
| [`jspsych_example/`](jspsych_example/) | [jsPsych](https://www.jspsych.org/) Stroop task on a single `custom/` page; trial data POSTed to a BOFS table. | 5009 |
| [`labjs_example/`](labjs_example/) | Same Stroop study as `jspsych_example`, built with [lab.js](https://lab.js.org/). | 5008 |
| [`psychojs_example/`](psychojs_example/) | A PsychoPy Builder export adapted to post trials to BOFS instead of Pavlovia. | 5011 |
| [`unity_example_2021.1/`](unity_example_2021.1/) | Unity WebGL build embedded in BOFS in three layouts. | 5006 |
| [`unity_example_2023.2/`](unity_example_2023.2/) | Same as above against Unity 2023.2. | 5006 |

Several examples share port numbers — that's fine since you only run one
at a time. See each example's `README.md` for what to look at and any
setup beyond `BOFS run`.
