# Vendored lab.js files

These files were downloaded from unpkg on 2026-05-02. They are pinned here so the
example runs offline and stays reproducible. To upgrade, replace each file with
the matching version from a newer release and update the hashes below.

| File | Source | Version | SHA256 |
| --- | --- | --- | --- |
| `lab.js` | `https://unpkg.com/lab.js@20.2.4/dist/lab.js` | 20.2.4 | `3783475193af029a13b94b10db9e9a4339edd189439704d8d612966a86153903` |
| `lab.css` | `https://unpkg.com/lab.js@20.2.4/dist/lab.css` | 20.2.4 | `9523a52a71558d8126b3c40f1b130aafad9374733c579cf36d70f7a6e2d21790` |

Re-download command (run from this folder):

```bash
curl -sSL -o lab.js https://unpkg.com/lab.js@20.2.4/dist/lab.js
curl -sSL -o lab.css https://unpkg.com/lab.js@20.2.4/dist/lab.css
```

The lab.js 20.2.4 distribution is a UMD bundle that exposes a global `lab`
object with sub-namespaces (`lab.flow.Sequence`, `lab.html.Screen`, etc.) when
loaded via a `<script>` tag. See https://lab.js.org/ for component documentation.
