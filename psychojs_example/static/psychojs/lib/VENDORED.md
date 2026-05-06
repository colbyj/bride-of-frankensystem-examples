# Vendored PsychoJS files

These files were downloaded from the Pavlovia CDN on 2026-05-06. They are
pinned here so the example runs offline and stays reproducible. To upgrade,
replace each file with the matching version from a newer PsychoPy release
and update the hashes below.

| File | Source | Version | SHA256 |
| --- | --- | --- | --- |
| `psychojs-2026.1.3.js` | `https://lib.pavlovia.org/psychojs-2026.1.3.js` | 2026.1.3 | `72540bdd4232befa9a95cb26e7646c0d8dbb6f95499ab820b6a4b9437204f60b` |
| `psychojs-2026.1.3.css` | `https://lib.pavlovia.org/psychojs-2026.1.3.css` | 2026.1.3 | `e08d00bcd1562c1628678ef896fc2a926f7f0763990ad61dfce0cc2d77de5c85` |
| `psychojs-2026.1.3.iife.js` | `https://lib.pavlovia.org/psychojs-2026.1.3.iife.js` | 2026.1.3 | `663802c88a16f7365b996008d99fe30e38d9af6bbc2884a79a1b4268b0923a5d` |

The `.iife.js` file is the non-module fallback that PsychoPy Builder includes
for legacy browsers. This example uses ES modules (the `.js` build) and does
not load the IIFE bundle, but the file is kept so re-exports from Builder
that reference it still work without extra steps.

Re-download command (run from this folder):

```bash
curl -sSL -o psychojs-2026.1.3.js https://lib.pavlovia.org/psychojs-2026.1.3.js
curl -sSL -o psychojs-2026.1.3.css https://lib.pavlovia.org/psychojs-2026.1.3.css
curl -sSL -o psychojs-2026.1.3.iife.js https://lib.pavlovia.org/psychojs-2026.1.3.iife.js
```
