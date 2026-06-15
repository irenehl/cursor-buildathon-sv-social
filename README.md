# Cursor Buildathon SV — Sponsor Social Cards

Standalone HTML/CSS tool for sponsor thank-you graphics. **Not part of the main site repo.**

Sponsor-first social graphics for Cursor Buildathon SV: dark site palette, massive partner logo, and a volcanic coast / añil night atmosphere inspired by Salvadoran terrain, Pacific energy, coffee highlands, and tile motifs.

## Formats

| Format | Size | Ratio | Use |
|--------|------|-------|-----|
| Instagram Story | 1080 × 1920 | 9:16 | Stories / Reels cover |
| Instagram Post | 1080 × 1080 | 1:1 | Feed square (logo hero) |
| LinkedIn | 1080 × 1080 | 1:1 | Feed publication (typographic) |
| X | 1080 × 1080 | 1:1 | Feed publication (typographic) |
| Banner | 1200 × 627 | 1.91:1 | Horizontal link preview only |

## Quick start

```bash
cd cursor-buildathon-sv-social
python3 -m http.server 8787
```

Open **http://localhost:8787**

1. Choose sponsor + language
2. Pick format tab
3. **Download PNG** (one card) or **Download all sponsors — ZIP** (current format tab)
4. Or use **Download by folder** for LinkedIn / X / Banner / Instagram Post / Story / Everything — each is **one ZIP file**

### Folder on disk (no unzip)

With the local server running:

```bash
node scripts/export-pngs.mjs
```

Writes everything to `out/social-pngs/`:

```
out/social-pngs/
  linkedin/
  x/
  banner/
  instagram-post/
  instagram-story/
```

Flags: `--format linkedin|x|banner|post|story|all`, `--lang en|es|all`, `--landmark`, `--out`.

### Folder ZIP structure (browser)

Each pack downloads a single ZIP. Inside:

```
linkedin/
  buildathon-sv-codex-linkedin-en.png   ← all sponsors (EN + ES)
  en/
  es/
x/
  …
banner/
  …
instagram-post/
  …
instagram-story/
  …
```

Use **Everything** for one ZIP with all format folders.

> A local server is required so logos load correctly for PNG export.

## Animated Story video (.mp4)

The Instagram Story can be exported as a short animated video (staggered reveal,
glow pulse, floating logo, rising volcano).

**Preview** (loops in the browser): click **"Preview animated story"** in the tool,
or open `story-anim.html?sponsor=n8n&lang=es&landmark=volcano`.

**Render an .mp4** (needs the local server running + Chrome + ffmpeg):

```bash
# one sponsor
node scripts/record-story.mjs --sponsor n8n --lang es

# every sponsor (default lang)
node scripts/record-story.mjs --all

# both languages for one sponsor, sharper 2x
node scripts/record-story.mjs --sponsor codex --all-langs --scale 2
```

Output goes to `out/story-<sponsor>-<lang>.mp4` — 1080×1920, H.264, ready for Instagram.
No npm install required (uses Node's built-in Chrome DevTools driver). Flags: `--fps`,
`--loop` (ms), `--scale`, `--landmark`, `--out`.

## Logos

Logos symlink to the main project:

```
logos/ → ../cursor-buildathon-sv/public/sponsors/
```

If the symlink breaks, recreate it:

```bash
ln -sf ../cursor-buildathon-sv/public/sponsors logos
```

## Customize copy

Edit `js/sponsors.js`:

- `COPY.en` / `COPY.es` — role labels, cultural cue line, footer
- `SPONSORS` — add/remove partners, logo filenames, and `displayName` (verbatim brand typography on cards; never auto-uppercased)

## Design notes

- **Sponsor-first:** the partner logo fills a large hero stage (fixed box + `object-fit: contain`, so even small SVGs scale up).
- **El Salvador:** halftone backdrop of a real national symbol, selectable in the UI:
  - **Volcán Santa Ana** (`assets/sv-volcano.png`) — default, non-religious.
  - **Divino Salvador del Mundo** (`assets/sv-landmark.png`).
- **Our colors only:** `#080808`, `#ff4b00`, off-white, Chakra Petch + JetBrains Mono.

### Swapping the backdrop art

Replace the PNGs in `assets/` (keep the filenames) or add entries to `LANDMARKS` in `js/sponsors.js`
and an `<option>` in `index.html`. Per-image cropping lives in `css/card.css` under `[data-landmark="…"]`.
