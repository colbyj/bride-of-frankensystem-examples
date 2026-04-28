# Unity Example — Unity 2023.2

A worked example of integrating a **Unity WebGL build** with a Bride of
Frankensystem (BOFS) project. This directory contains both the **BOFS
project** that hosts the build (`bofs_project/`) and the **source Unity
project** that produced it (`unity_project/`), so you can either run the
example as-is or open it in Unity, modify the scene/script, and rebuild.

This README assumes you have already done the
[Quickstart](https://bride-of-frankensystem.readthedocs.io/en/latest/examples/quickstart.html)
and know your way around a `.toml` config file and `PAGE_LIST`.

> A second copy of this example built against **Unity 2021.1** lives in
> `../unity_example_2021.1/` if you are on an older Unity install. The two
> are functionally identical; pick whichever matches your local Unity.

## What the example covers

| Topic | Where it shows up |
|---|---|
| Custom Flask blueprint with auto-discovered templates and static files | `bofs_project/unity_example/views.py` |
| Custom database table for task data | `bofs_project/unity_example/models.py` (`GameLog`) |
| Embedding Unity inside BOFS chrome (extends `unity_webgl.html`) | `templates/game_embed.html` |
| Embedding Unity at viewport size (extends `unity_webgl_fullscreen.html`) | `templates/game_fullscreen.html` |
| Embedding Unity on a fully custom HTML page | `templates/game_custom.html` |
| Pushing the participant ID into the running build | `gameInstance.SendMessage(...)` calls in each template; `SetParticipantID` in `example.cs` |
| Reading the assigned condition from inside Unity | `/fetch_condition` route in `views.py`; `LoadCondition()` in `example.cs` |
| Posting data from Unity back to BOFS | `PostInput()` in `example.cs`; `handle_game_post()` in `views.py` |
| Advancing the BOFS page flow from inside Unity | `Plugins/BOF.jslib` plugin; `RedirectBOF()` / `RedirectBOFClicked()` in `example.cs` |

## Layout

```
unity_example_2023.2/
├── README.md
├── bofs_project/                        # The BOFS project served to participants
│   ├── consent.html                     # Placeholder consent page
│   ├── unity_example.toml               # BOFS configuration (port, page list, conditions, ...)
│   └── unity_example/                   # Auto-discovered blueprint
│       ├── views.py                     # Routes for the three game pages + /fetch_condition
│       ├── models.py                    # GameLog table for inputs posted from Unity
│       ├── templates/
│       │   ├── game_embed.html          # Unity inside BOFS chrome
│       │   ├── game_fullscreen.html     # Unity at viewport size
│       │   ├── game_custom.html         # Unity on a fully custom page
│       │   └── instructions/            # Per-page instruction snippets
│       └── static/
│           ├── unity_example.loader.js
│           ├── unity_example.data.gz
│           ├── unity_example.framework.js.gz
│           └── unity_example.wasm.gz
└── unity_project/                       # The Unity 2023.2 source project
    └── Assets/
        ├── example.cs                   # Demonstrates all four integration points
        ├── scene.unity                  # Single scene with input fields and buttons
        └── Plugins/
            └── BOF.jslib                # JS plugin exposing RedirectBOF() to C#
```

## Running the example

From this directory:

```
cd bofs_project
BOFS run unity_example.toml -d
```

then visit <http://localhost:5007/>.

The default admin credentials are at <http://localhost:5007/admin>
(password: `example`). You can inspect each participant's progress and
download the `game_log` table as CSV from there.

## How the integration works

There are four moving parts; each one is small in isolation.

### 1. Hosting the build

The Unity build outputs four files (`unity_example.loader.js`,
`.data.gz`, `.framework.js.gz`, `.wasm.gz`) which are committed under
`bofs_project/unity_example/static/`. The blueprint declares
`static_url_path='/unity_example'`, so those files are served at e.g.
`/unity_example/unity_example.loader.js`.

Each game page is a small Jinja template that hands those URLs to BOFS's
Unity base templates (`unity_webgl.html` / `unity_webgl_fullscreen.html`)
or, in the "custom" case, calls `createUnityInstance()` directly.

> Builds compressed with **Brotli** require HTTPS. This example uses
> **gzip** so it works over plain HTTP during local development.

### 2. Pushing the participant ID into Unity

Once the build has loaded, BOFS calls into it from JavaScript:

```js
gameInstance.SendMessage('Canvas', 'SetParticipantID', {{ session['participantID'] }})
```

`SetParticipantID` is a public method on the `example` MonoBehaviour
attached to the `Canvas` GameObject in the scene. The call is wrapped in
a `setTimeout(..., 5000)` because `SendMessage` requires the build to be
fully loaded; if you need a tighter handoff, poll `gameInstance` and
fire the message as soon as it becomes non-null.

### 3. Reading the condition from inside Unity

`example.cs` issues a `UnityWebRequest.Get("/fetch_condition")` on
`Start()`. That request hits the matching Flask route in `views.py`,
which is guarded with `@verify_session_valid` and returns the current
participant's condition number as plain text.

### 4. Posting data back, and advancing the page flow

`PostInput()` in `example.cs` builds a `WWWForm` and posts it to `"#"`
(i.e. the current page URL). Each game route handles the POST in
`handle_game_post()`, which writes a row to the `game_log` table.

When the build is finished, it advances BOFS via the `RedirectBOF()`
function declared in `Plugins/BOF.jslib`. The plugin runs in the host
page's JavaScript context and simply navigates to
`/redirect_next_page`, which is BOFS's standard "advance to next page"
route. The older `Application.ExternalEval` approach is preserved as
`RedirectBOFDeprecated()` for reference.

## Modifying and rebuilding the Unity project

1. Open `unity_project/` in Unity 2023.2.
2. Make changes to `Assets/scene.unity` or `Assets/example.cs`.
3. Build for **WebGL**. In Player Settings, leave compression on
   **Gzip** (the templates assume `.gz` extensions for the build files).
4. Copy the four output files into
   `bofs_project/unity_example/static/`, replacing the bundled ones.
   Keep the filenames as `unity_example.loader.js`,
   `unity_example.data.gz`, `unity_example.framework.js.gz`, and
   `unity_example.wasm.gz`, or update the URLs in the three game
   templates to match your build's output names.

## Customising the page list

`bofs_project/unity_example.toml` shows all three embedding patterns in a
single run. If you only want one, comment out the corresponding pair of
`Instructions` / `Game ...` entries in `PAGE_LIST` — the routes will
still exist, but participants won't be sent to them.
