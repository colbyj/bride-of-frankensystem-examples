# Unity Example — Unity 2021.1

A Unity WebGL build hosted inside a BOFS project, in three layouts:
inside BOFS chrome (`game_embed.html`), at viewport size
(`game_fullscreen.html`), and on a fully custom HTML page
(`game_custom.html`). The directory contains both the BOFS project
(`bofs_project/`) and the Unity source (`unity_project/`), so you can
run as-is or open the source in Unity 2021.1 and rebuild.

> A parallel copy built against Unity 2023.2 lives in
> `../unity_example_2023.2/`. They are functionally identical; pick
> whichever matches your local install.

```
bofs_project/
├── unity_example.toml                # PAGE_LIST + port (5006)
└── unity_example/                    # auto-discovered blueprint
    ├── views.py                      # game routes + /fetch_condition
    ├── models.py                     # GameLog table for posted inputs
    ├── templates/
    │   ├── game_embed.html           # extends BOFS's unity_webgl.html
    │   ├── game_fullscreen.html      # extends unity_webgl_fullscreen.html
    │   └── game_custom.html          # calls createUnityInstance() directly
    └── static/                       # the four Unity build outputs (gzipped)
unity_project/Assets/
├── example.cs                        # the four integration points
├── scene.unity
└── Plugins/BOF.jslib                 # JS plugin exposing RedirectBOF() to C#
```

## Four integration points

**Hosting the build.** The four output files (`unity_example.loader.js`,
`.data.gz`, `.framework.js.gz`, `.wasm.gz`) sit under
`unity_example/static/`, served at e.g.
`/unity_example/unity_example.loader.js` because the blueprint declares
`static_url_path='/unity_example'`. Builds compressed with **Brotli**
require HTTPS; this example uses **gzip** so it works over plain HTTP
during local development.

**Pushing the participant ID into Unity.** Once the build has loaded,
each template calls:

```js
gameInstance.SendMessage('Canvas', 'SetParticipantID', {{ session['participantID'] }})
```

`SetParticipantID` is a public method on the `example` MonoBehaviour
attached to the `Canvas` GameObject. Wrapped in `setTimeout(..., 5000)`
because `SendMessage` requires the build to be fully loaded; for a
tighter handoff, poll `gameInstance` and fire as soon as it's non-null.

**Reading the condition from inside Unity.** `example.cs` issues a
`UnityWebRequest.Get("/fetch_condition")` on `Start()`. The Flask route
in `views.py` is guarded with `@verify_session_valid` and returns the
participant's condition number as plain text.

**Posting data back, and advancing the page flow.** `PostInput()` builds
a `WWWForm` and POSTs to `"#"`; each game route handles the POST in
`handle_game_post()` and writes a row to `game_log`. When the build
finishes, it advances BOFS via `RedirectBOF()` from
`Plugins/BOF.jslib`, which runs in the host page's JS context and
navigates to `/redirect_next_page`. The older `Application.ExternalEval`
approach is preserved as `RedirectBOFDeprecated()`.

## Rebuilding

Open `unity_project/` in Unity 2021.1, edit, build for **WebGL** with
compression set to **Gzip**, and copy the four output files into
`bofs_project/unity_example/static/` — same filenames, or update the URLs
in the three game templates to match your build.

`unity_example.toml`'s `PAGE_LIST` shows all three embedding patterns in
one run. Comment out the `Instructions` / `Game ...` pairs you don't
want; the routes still exist but participants won't be sent to them.
