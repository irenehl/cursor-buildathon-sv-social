# Cursor Buildathon SV — Sponsor Social Cards

Standalone HTML/CSS tool for sponsor thank-you graphics. **Not part of the main site repo.**

Sponsor-first social graphics for Cursor Buildathon SV: dark site palette, massive partner logo, and a volcanic coast / añil night atmosphere inspired by Salvadoran terrain, Pacific energy, coffee highlands, and tile motifs.

## Formats

| Format | Size | Ratio | Use |
|--------|------|-------|-----|
| Instagram Story | 1080 × 1920 | 9:16 | Stories / Reels cover |
| Instagram Post | 1080 × 1080 | 1:1 | Feed square (logo hero) |
| LinkedIn | 1080 × 1080 | 1:1 | Feed publication (typographic) |
| LinkedIn Banner | 1584 × 396 | 4:1 | Profile cover banner |
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
4. Or use **Download by folder** for LinkedIn / LinkedIn Banner / X / Banner / Instagram Post / Story / Everything — each is **one ZIP file**

### Folder on disk (no unzip)

With the local server running:

```bash
node scripts/export-pngs.mjs
```

Writes everything to `out/social-pngs/`:

```
out/social-pngs/
  linkedin/
  linkedin-banner/
  x/
  banner/
  instagram-post/
  instagram-story/
```

Flags: `--format linkedin|linkedin-banner|x|banner|post|story|all`, `--lang en|es|all`, `--landmark`, `--out`.

### Folder ZIP structure (browser)

Each pack downloads a single ZIP. Inside:

```
n8n/
  story-en.png
  story-es.png
  instagram-post-en.png
  instagram-post-es.png
  linkedin-en.png
  linkedin-es.png
  x-en.png
  x-es.png
  banner-en.png
  banner-es.png
codex/
  …
all/
  …   ← sponsors wall
```

Use **Everything** for one ZIP with every sponsor folder plus `all/`.

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

Sponsor logos live in `sponsors/` (SVG files referenced by `logo` in `js/sponsors.js`).
Add or replace a file there, then update `SPONSORS` if the filename changes.

## Customize copy

Edit `js/sponsors.js`:

- `COPY.en` / `COPY.es` — role labels, cultural cue line, footer
- `SPONSORS` — add/remove partners, logo filenames, and `displayName` (verbatim brand typography on cards; never auto-uppercased)

## Mentor cards

Toggle **Mentors** in the sidebar to switch to personal first-person cards (LinkedIn / X). Default headline voice: **I'm mentoring at…** or **I'm joining…**.

### Card design (Classic vs Film print)

Use the **Card design** dropdown in the sidebar to choose how the photo is framed:

- **Classic — studio cut-out:** the original layout. Best for clean, transparent-background headshots that float against the backdrop.
- **Film print — candid photos:** frames the photo as a developed instant print (warm paper border, grain, slight tilt) resting on the dark studio surface. Built for **rectangular, full-frame candid event snapshots** that the cut-out layout crops badly. All event chrome (MENTOR badge, dates, 24H, venue, sponsor wall, powered-by) is preserved. Applies to the LinkedIn / X (1:1) mentor formats.

The choice is saved locally and applies to single PNG and ZIP exports.

### Mentor data (Markdown)

Mentors load at runtime from `data/mentors/` — no JS edits needed to add someone new.

1. Copy [`data/mentors/_template.md`](data/mentors/_template.md) → `data/mentors/{slug}.md`
2. Add `{slug}` to [`data/mentors/manifest.json`](data/mentors/manifest.json)
3. Drop a headshot into `assets/mentors/photos/{slug}.png` (or `.jpg` / `.webp`)

Each `.md` file uses YAML frontmatter:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | URL-safe slug (usually matches filename) |
| `name` | yes | Full name on the card |
| `title` | no | Job title (LinkedIn / X publication line) |
| `company` | no | Company name |
| `role` | no | Short role under the name; defaults to `title · company` |
| `handle` | no | e.g. `@walter` |
| `voice` | no | `mentoring` (default) or `joining` |
| `backdrop` | no | `coatepeque`, `surf`, `coffee`, `ceiba`, `milpa`, `izalco` |
| `link` | no | LinkedIn / scheduler URL (reference only) |
| `photo` | no | Filename stem; defaults to `id` |

Text below the `---` closing fence is bio/notes (not rendered on cards).

Card copy and backdrop library still live in [`js/mentors.js`](js/mentors.js) (`MENTOR_COPY`, `MENTOR_BACKDROPS`).

### Assets

- **Headshots:** `assets/mentors/photos/{slug}.png` (preferred). Legacy path `assets/mentors/{slug}.png` still works. Missing photo → monogram initials.
- **Backdrops:** halftone PNGs in `assets/mentors/backdrops/`. Use **El Salvador backdrop** in the sidebar to swap scenes without editing code.

Per-backdrop cropping is tuned in `css/card.css` under `[data-backdrop="…"]`.

> Animated story video (`.mp4`) and CLI export scripts remain sponsor-only for now.

## Design notes

- **Sponsor-first:** the partner logo fills a large hero stage (fixed box + `object-fit: contain`, so even small SVGs scale up).
- **El Salvador:** halftone backdrop of a real national symbol, selectable in the UI:
  - **Volcán Santa Ana** (`assets/sv-volcano.png`) — default, non-religious.
  - **Divino Salvador del Mundo** (`assets/sv-landmark.png`).
- **Our colors only:** `#080808`, `#ff4b00`, off-white.
- **Typography:** **Chakra Petch Bold (700)** on all text — cards, editor, export. Google Fonts + local woff2 fallback.

Applied on every surface: all sponsor + mentor card formats, all-sponsors wall, editor shell (`index.html`), PNG export frame (`export-frame.html`), and story animation (`story-anim.html`).

### Swapping the backdrop art

Replace the PNGs in `assets/` (keep the filenames) or add entries to `LANDMARKS` in `js/sponsors.js`
and an `<option>` in `index.html`. Per-image cropping lives in `css/card.css` under `[data-landmark="…"]`.
