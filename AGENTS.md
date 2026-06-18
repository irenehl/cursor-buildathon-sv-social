# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **standalone static HTML/CSS/JS tool** (sponsor social-card generator). There is no package manager, no lockfile, and no build step — nothing to install.

### Services

- **Web tool (the whole app):** serve the repo root statically and open it in a browser. See README "Quick start": `python3 -m http.server 8787`, then open `http://localhost:8787`. Any static server works; `8787` is the convention the Node export scripts default to.
- There is no backend, database, lint config, or automated test suite in this repo.

### Non-obvious caveats

- **In-browser PNG/ZIP export needs internet access.** `index.html` loads `html-to-image` and `jszip` from the jsdelivr CDN (and fonts from Google Fonts). With no network, the preview still renders but Download PNG / ZIP will fail with "library not loaded".
- **The Node export/record scripts default `CHROME_BIN` to a macOS Chrome path.** On Linux (including this VM) you must set it: `CHROME_BIN=/usr/local/bin/google-chrome node scripts/export-pngs.mjs`. The script drives headless Chrome over the DevTools protocol; `record-story.mjs` additionally needs `ffmpeg` (already installed).
- Generated output goes to `out/` (git-ignored).
