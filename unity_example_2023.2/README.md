# Unity Example — Unity 2023.2

The Unity 2023.2 sibling of `../unity_example_2021.1/`. Functionally
identical: same blueprint, same scene, same four integration points, same
three embedding layouts (BOFS chrome / viewport / fully custom). The
difference is the Unity version the source project targets and the
loader/build output produced from it. Pick whichever matches your local
install.

For the integration walkthrough — hosting the build, pushing the
participant ID into Unity, reading the condition from inside Unity, and
posting data back / advancing the page flow — see
[`../unity_example_2021.1/README.md`](../unity_example_2021.1/README.md).
The substantive content is the same.

**Note:** This same approach should work with later versions of Unity as well.

## Layout

```
bofs_project/
├── unity_example.toml                # PAGE_LIST + port (5006)
└── unity_example/                    # auto-discovered blueprint
    ├── views.py                      # game routes + /fetch_condition
    ├── models.py                     # GameLog table for posted inputs
    ├── templates/                    # game_embed / game_fullscreen / game_custom
    └── static/                       # four Unity build outputs (gzipped)
unity_project/Assets/                 # Unity 2023.2 source
├── example.cs
├── scene.unity
└── Plugins/BOF.jslib
```

## Rebuilding

Open `unity_project/` in Unity 2023.2, edit, build for **WebGL** with
compression set to **Gzip**, copy the four output files into
`bofs_project/unity_example/static/`. Brotli compression requires HTTPS;
gzip is what the templates assume so plain-HTTP local development works.
