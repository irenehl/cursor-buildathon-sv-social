# Cursor Buildathon SV — Sponsor Social Cards

Standalone static HTML/CSS/JS tool that generates sponsor "thank you" social graphics. No build step, no package manager, no npm dependencies. See `README.md` for full usage.

## Cursor Cloud specific instructions

### Services / how to run
- This is a **static site**. Run it with `python3 -m http.server 8787` from the repo root, then open `http://localhost:8787` (see `README.md` "Quick start"). There is no backend, database, or `package.json`.
- A local HTTP server is required (not `file://`) so ES modules and logo/asset fetches work, and so PNG export can load images.
- Optional helper scripts (`scripts/export-pngs.mjs`, `scripts/record-story.mjs`) use **Node's built-in** Chrome DevTools driver + `ffmpeg` — they need the local server running. There is nothing to `npm install`.

### Logos are an external dependency (non-obvious gotcha)
- `logos/` is a **symlink to a sibling repo** (`../cursor-buildathon-sv/public/sponsors`) that is **not present** in this standalone checkout, so the symlink is broken and all `logos/*.svg` return 404.
- The card **preview still renders** (text, backdrop, layout) without logos, but **PNG export fails** because the cards include a host-logo `<img>` (`logos/cursor-dark.svg`) and `waitForImages()` rejects on its `onerror`.
- To run/export end-to-end in this standalone repo you must populate `logos/` (replace the broken symlink with a directory) with the SVGs named in `js/sponsors.js` plus `cursor-dark.svg` and `ailabs.svg`. Get them from the main `cursor-buildathon-sv` repo, or generate quick text placeholders for dev. Do **not** commit placeholder logos.

### Node export/record scripts: set CHROME_BIN
- Both scripts default `CHROME_BIN` to a macOS Chrome path. On this Linux VM, Chrome is at `/usr/local/bin/google-chrome`, so run e.g.:
  `CHROME_BIN=/usr/local/bin/google-chrome node scripts/export-pngs.mjs --format post --lang en`
- Output goes to `out/` (gitignored).

### Lint / test / build
- There is no linter, no test suite, and no build configured in this repo. "Building/running" means serving the static files and exporting cards.
