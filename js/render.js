import { COPY, FORMATS, LANDMARKS, DEFAULT_LANDMARK, sponsorDisplayName, SPONSORS } from "./sponsors.js";
import {
  MENTOR_COPY,
  MENTOR_FOOTER_SPONSOR_IDS,
  mentorDisplayName,
  mentorInitials,
  mentorPhotoFile,
  mentorPubLead,
  resolveMentorBackdrop,
} from "./mentors.js";
import { cardBackdrop, landmarkLayer } from "./sv-backdrop.js";

const HOST_LOGO = "sponsors/cursor-dark.svg";
const AILABS_LOGO = "sponsors/ailabs.svg";

export const TIER1_SPONSOR_IDS = [
  "codex",
  "elevenlabs",
  "n8n",
  "zavu",
  "firecrawl",
];

export const TIER2_SPONSOR_IDS = [
  "datamcp",
  "exa",
  "fal",
  "netlify",
  "wispr",
];

export const PLATFORM_SPONSOR_IDS = TIER1_SPONSOR_IDS;

const LOGO_AR = {
  n8n: 3.63,
  codex: 2.6,
  yonjob: 1.44,
  nubiwork: 1.55,
  abaco: 3.54,
  elevenlabs: 7.71,
  simov: 6.0,
  kreali: 3.46,
  weris: 3.64,
  boxful: 4.25,
  drop: 3.18,
  gamesquad: 1.05,
  searchyou: 6.45,
  dma: 2.52,
  netlify: 2.45,
  wispr: 3.57,
  fal: 2.5,
  exa: 3.2,
  zavu: 4.19,
  cursor: 4.21,
  firecrawl: 4.31,
  esrobotica: 6.92,
  rcns: 4.15,
  svnet: 4.34,
  from021: 2.63,
  datamcp: 0.89,
  ailabs: 4.01,
  ufg: 1.76,
};

const WALL_PAD_X = {
  story: 64,
  post: 56,
  linkedin: 64,
  x: 64,
  banner: 56,
  "linkedin-banner": 48,
};

/** Tier-1 gaps per format — must match card.css --wall-tier1-*-gap. */
const WALL_TIER1_COL_GAP = {
  story: 40,
  post: 38,
  linkedin: 40,
  x: 40,
  banner: 28,
  "linkedin-banner": 22,
};
const WALL_TIER1_ROW_GAP = {
  story: 28,
  post: 22,
  linkedin: 22,
  x: 22,
  banner: 12,
  "linkedin-banner": 8,
};

/** Tier-2 gaps per format — must match card.css --wall-tier2-*-gap. */
const WALL_TIER2_COL_GAP = {
  story: 36,
  post: 32,
  linkedin: 34,
  x: 34,
  banner: 24,
  "linkedin-banner": 18,
};
const WALL_TIER2_ROW_GAP = {
  story: 24,
  post: 18,
  linkedin: 18,
  x: 18,
  banner: 10,
  "linkedin-banner": 8,
};

/** Tier-3 gaps per format — must match card.css --wall-tier3-*-gap. */
const WALL_TIER3_COL_GAP = {
  story: 30,
  post: 26,
  linkedin: 26,
  x: 26,
  banner: 18,
  "linkedin-banner": 14,
};
const WALL_TIER3_ROW_GAP = {
  story: 20,
  post: 14,
  linkedin: 14,
  x: 14,
  banner: 8,
  "linkedin-banner": 6,
};

const WALL_TIER1_HEIGHT_BUDGET = {
  story: 520,
  post: 320,
  linkedin: 320,
  x: 320,
  banner: 180,
  "linkedin-banner": 84,
};

const WALL_TIER3_HEIGHT_BUDGET = {
  story: 980,
  post: 380,
  linkedin: 380,
  x: 380,
  banner: 185,
  "linkedin-banner": 90,
};

const WALL_GEOM = {
  post: {
    tier1: { area: 14500, hMin: 42, hMax: 150, wMax: 340 },
    tier2: { area: 6200, hMin: 40, hMax: 92, wMax: 196 },
    tier3: { area: 3300, hMin: 32, hMax: 60, wMax: 140 },
  },
  linkedin: {
    tier1: { area: 14500, hMin: 42, hMax: 150, wMax: 340 },
    tier2: { area: 6200, hMin: 40, hMax: 92, wMax: 196 },
    tier3: { area: 3300, hMin: 32, hMax: 60, wMax: 140 },
  },
  x: {
    tier1: { area: 14500, hMin: 42, hMax: 150, wMax: 340 },
    tier2: { area: 6200, hMin: 40, hMax: 92, wMax: 196 },
    tier3: { area: 3300, hMin: 32, hMax: 60, wMax: 140 },
  },
  story: {
    tier1: { area: 17200, hMin: 46, hMax: 168, wMax: 350 },
    tier2: { area: 7800, hMin: 44, hMax: 100, wMax: 220 },
    tier3: { area: 4200, hMin: 38, hMax: 72, wMax: 162 },
  },
  banner: {
    tier1: { area: 7600, hMin: 30, hMax: 96, wMax: 245 },
    tier2: { area: 3400, hMin: 30, hMax: 62, wMax: 134 },
    tier3: { area: 1900, hMin: 22, hMax: 40, wMax: 100 },
  },
  "linkedin-banner": {
    tier1: { area: 4200, hMin: 22, hMax: 64, wMax: 182 },
    tier2: { area: 1800, hMin: 22, hMax: 45, wMax: 96 },
    tier3: { area: 1000, hMin: 16, hMax: 28, wMax: 70 },
  },
};

const WALL_EXCLUDE_IDS = new Set(["cursor"]);

const FOOTER_PAD_X = {
  story: 64,
  post: 56,
  linkedin: 64,
  x: 64,
  banner: 56,
  "linkedin-banner": 48,
};

const FOOTER_SPONSOR_GEOM = {
  story: { gap: 12, h: 40, labelReserve: 118 },
  post: { gap: 10, h: 40, labelReserve: 108 },
  linkedin: { gap: 10, h: 40, labelReserve: 112 },
  x: { gap: 10, h: 40, labelReserve: 112 },
  banner: { gap: 10, h: 36, labelReserve: 104 },
  "linkedin-banner": { gap: 8, h: 28, labelReserve: 88 },
};

const FOOTER_MAX_AR = 2.0;

function footerSponsorCells(format, frameW) {
  const geom = FOOTER_SPONSOR_GEOM[format] || FOOTER_SPONSOR_GEOM.post;
  const sponsors = MENTOR_FOOTER_SPONSOR_IDS.map((id) =>
    SPONSORS.find((s) => s.id === id),
  ).filter(Boolean);
  if (sponsors.length === 0) return "";

  const n = sponsors.length;
  const gapsW = geom.gap * Math.max(0, n - 1);
  const padX = FOOTER_PAD_X[format] ?? FOOTER_PAD_X.post;
  const margin = 6;
  const avail = Math.max(
    0,
    (FORMATS[format]?.w ?? frameW) - padX * 2 - geom.labelReserve - margin,
  );

  const baseWidths = sponsors.map((s) => {
    const ar = Math.min(LOGO_AR[s.id] || 3, FOOTER_MAX_AR);
    return Math.max(geom.h, Math.round(geom.h * ar));
  });
  const sumW = baseWidths.reduce((a, b) => a + b, 0);

  const fit = sumW > 0 ? Math.min(1, (avail - gapsW) / sumW) : 1;
  const h = Math.max(14, Math.floor(geom.h * fit));

  return sponsors
    .map((sponsor, i) => {
      const label = sponsorDisplayName(sponsor);
      const w = Math.max(1, Math.floor(baseWidths[i] * fit));
      return `<div class="social-card__foot-sponsor" role="img" aria-label="${escapeHtml(label)}" style="width: ${w}px; height: ${h}px; background-image: url('sponsors/${sponsor.logo}')"></div>`;
    })
    .join("");
}

function splitWallSponsors() {
  const tier1Set = new Set(TIER1_SPONSOR_IDS);
  const tier2Set = new Set(TIER2_SPONSOR_IDS);
  const byId = new Map(SPONSORS.map((s) => [s.id, s]));
  const tier1 = TIER1_SPONSOR_IDS.map((id) => byId.get(id)).filter(Boolean);
  const tier2 = TIER2_SPONSOR_IDS.map((id) => byId.get(id)).filter(Boolean);
  const tier3 = SPONSORS.filter(
    (s) => !tier1Set.has(s.id) && !tier2Set.has(s.id) && !WALL_EXCLUDE_IDS.has(s.id),
  );
  return { tier1, tier2, tier3 };
}

function wallLogoHtml(sponsor, geom, scale = 1, uniform = false) {
  const label = sponsorDisplayName(sponsor);
  let { w, h } = wallLogoSize(LOGO_AR[sponsor.id], geom, uniform);
  if (scale !== 1) {
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }
  return `<div class="social-card__wall-logo" data-sponsor="${escapeHtml(sponsor.id)}" role="listitem" aria-label="${escapeHtml(label)}" style="width: ${w}px; height: ${h}px; background-image: url('sponsors/${sponsor.logo}')"></div>`;
}

function wallRowScale(format, frameW, sponsorIds, geom, colGapKey = "tier1", uniform = false) {
  const padX = WALL_PAD_X[format] ?? WALL_PAD_X.post;
  const colGapMap = colGapKey === "tier2" ? WALL_TIER2_COL_GAP : WALL_TIER1_COL_GAP;
  const colGap = colGapMap[format] ?? colGapMap.post;
  const avail = frameW - padX * 2;
  const n = sponsorIds.length;
  if (n === 0) return 1;

  let logosW = 0;
  for (const id of sponsorIds) {
    logosW += wallLogoSize(LOGO_AR[id], geom, uniform).w;
  }
  const gapsW = colGap * (n - 1);
  const totalW = logosW + gapsW;

  const margin = 8;
  if (totalW <= avail - margin) return 1;

  const targetLogosW = avail - margin - gapsW;
  if (targetLogosW <= 0) return 0.3;
  return Math.max(0.3, targetLogosW / logosW);
}

function wallWrapTierScale(format, frameW, sponsorIds, geom, tierKey = "tier3", uniform = false) {
  const isTier1 = tierKey === "tier1";
  const colGapMap = isTier1 ? WALL_TIER1_COL_GAP : WALL_TIER3_COL_GAP;
  const rowGapMap = isTier1 ? WALL_TIER1_ROW_GAP : WALL_TIER3_ROW_GAP;
  const budgetMap = isTier1 ? WALL_TIER1_HEIGHT_BUDGET : WALL_TIER3_HEIGHT_BUDGET;
  const padX = WALL_PAD_X[format] ?? WALL_PAD_X.post;
  const colGap = colGapMap[format] ?? colGapMap.post;
  const rowGap = rowGapMap[format] ?? rowGapMap.post;
  const heightBudget = budgetMap[format] ?? budgetMap.post;
  const availW = frameW - padX * 2 - 8;
  if (sponsorIds.length === 0 || availW <= 0) return 1;

  function packedHeight(scale) {
    let rowW = 0;
    let rowMaxH = 0;
    let rows = 1;
    for (const id of sponsorIds) {
      const { w, h } = wallLogoSize(LOGO_AR[id], geom, uniform);
      const lw = Math.max(1, Math.round(w * scale));
      const lh = Math.max(1, Math.round(h * scale));
      const addW = rowW === 0 ? lw : colGap + lw;
      if (rowW > 0 && rowW + addW > availW) {
        rows += 1;
        rowW = lw;
      } else {
        rowW += addW;
      }
      rowMaxH = Math.max(rowMaxH, lh);
    }
    return rows * rowMaxH + Math.max(0, rows - 1) * rowGap;
  }

  if (packedHeight(1) <= heightBudget) return 1;

  let lo = 0.25;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (packedHeight(mid) <= heightBudget) lo = mid;
    else hi = mid;
  }
  return lo;
}

const UNIFORM_REF_AR = 3.4;

function wallLogoSize(ar, geom, uniform = false) {
  const r = ar || 3;
  if (uniform) {
    const h = Math.min(geom.hMax, Math.max(geom.hMin, Math.sqrt(geom.area / UNIFORM_REF_AR)));
    return { w: Math.max(1, Math.round(h * r)), h: Math.round(h) };
  }
  let h = Math.sqrt(geom.area / r);
  let w = h * r;
  if (w > geom.wMax) {
    w = geom.wMax;
    h = w / r;
  }
  h = Math.min(geom.hMax, Math.max(geom.hMin, h));
  w = Math.round(h * r);
  if (w > geom.wMax) w = geom.wMax;
  return { w, h: Math.round(h) };
}

/**
 * @param {object} opts
 * @param {import('./sponsors.js').SPONSORS[number]} opts.sponsor
 * @param {'story'|'post'|'linkedin'|'linkedin-banner'|'x'|'banner'} opts.format
 * @param {'en'|'es'} opts.lang
 * @param {string} [opts.headlineOverride]
 * @param {'volcano'|'monument'} [opts.landmark]
 * @param {boolean} [opts.isAll] Render the all-sponsors wall instead of one sponsor.
 */
export function buildCardHtml({ sponsor, format, lang, headlineOverride, landmark, isAll }) {
  if (isAll || sponsor?.id === "all") {
    return buildAllCardHtml({ format, lang, headlineOverride, landmark });
  }

  const copy = COPY[lang];
  const { w, h } = FORMATS[format];
  const context = headlineOverride?.trim() || copy.context;
  const logoSrc = `sponsors/${sponsor.logo}`;
  const sponsorLabel = sponsorDisplayName(sponsor);
  const land = LANDMARKS[landmark] || LANDMARKS[DEFAULT_LANDMARK];

  const meta = `
    <div class="social-card__meta">
      <span>${escapeHtml(copy.date)}</span>
      <span class="social-card__meta-sep">·</span>
      <span class="social-card__meta-hot">24H</span>
      <span class="social-card__meta-sep">·</span>
      <span>${escapeHtml(copy.venue)}</span>
    </div>`;

  const footer = `
    <footer class="social-card__foot">
      <span class="social-card__foot-label">${escapeHtml(copy.poweredBy)}</span>
      <div class="social-card__foot-logo" role="img" aria-label="Ai /abs" style="background-image: url('${AILABS_LOGO}')"></div>
    </footer>`;

  let inner = "";

  if (format === "banner" || format === "linkedin-banner") {
    inner = buildBannerInner({ copy, sponsorLabel, context, logoSrc, meta, footer });
  } else if (format === "linkedin" || format === "x") {
    inner = buildPublicationInner({ copy, sponsorLabel, logoSrc, meta, footer });
  } else {
    inner = buildFeedInner({ copy, sponsorLabel, context, logoSrc, meta, footer });
  }

  return `
<article
  class="social-card"
  data-format="${format}"
  data-sponsor="${escapeHtml(sponsor.id)}"
  data-landmark="${escapeHtml(land.id)}"
  style="--frame-w: ${w}px; --frame-h: ${h}px;"
  aria-label="Thank you ${escapeHtml(sponsor.name)} — Cursor Buildathon, El Salvador"
>
  ${cardBackdrop()}
  ${landmarkLayer(land.file)}
  <div class="social-card__inner">
    ${inner}
  </div>
</article>`;
}

/** Sponsor-wall variant — three prominence tiers. */
function buildAllCardHtml({ format, lang, headlineOverride, landmark }) {
  const copy = COPY[lang];
  const { w, h } = FORMATS[format];
  const context = headlineOverride?.trim() || copy.allContext;
  const land = LANDMARKS[landmark] || LANDMARKS[DEFAULT_LANDMARK];

  const topBar = `
    <header class="social-card__top">
      <div class="social-card__top-brand">
        <img class="social-card__host-mark" src="${HOST_LOGO}" alt="Cursor" crossorigin="anonymous" />
        <span class="social-card__brand">Buildathon · 2026</span>
      </div>
      <span class="social-card__top-place">El Salvador</span>
    </header>`;

  const meta = `
    <div class="social-card__meta">
      <span>${escapeHtml(copy.date)}</span>
      <span class="social-card__meta-sep">·</span>
      <span class="social-card__meta-hot">24H</span>
      <span class="social-card__meta-sep">·</span>
      <span>${escapeHtml(copy.venue)}</span>
    </div>`;

  const footer = `
    <footer class="social-card__foot">
      <span class="social-card__foot-label">${escapeHtml(copy.poweredBy)}</span>
      <div class="social-card__foot-logo" role="img" aria-label="Ai /abs" style="background-image: url('${AILABS_LOGO}')"></div>
    </footer>`;

  const tierGeom = WALL_GEOM[format] || WALL_GEOM.post;
  const { tier1, tier2, tier3 } = splitWallSponsors();
  const tier1Ids = tier1.map((s) => s.id);
  const tier2Ids = tier2.map((s) => s.id);
  const tier3Ids = tier3.map((s) => s.id);
  let tier1Scale = wallWrapTierScale(format, w, tier1Ids, tierGeom.tier1, "tier1");
  let tier2Scale = wallRowScale(format, w, tier2Ids, tierGeom.tier2, "tier2");
  let tier3Scale = wallWrapTierScale(format, w, tier3Ids, tierGeom.tier3, "tier3");

  const areaEff = (geom, scale) => geom.area * scale * scale;
  const tier1Area = areaEff(tierGeom.tier1, tier1Scale);
  const tier2Cap = tier1Area * 0.62;
  if (areaEff(tierGeom.tier2, tier2Scale) > tier2Cap) {
    tier2Scale = Math.sqrt(tier2Cap / tierGeom.tier2.area);
  }
  const tier2Area = areaEff(tierGeom.tier2, tier2Scale);
  const tier3Cap = tier2Area * 0.6;
  if (areaEff(tierGeom.tier3, tier3Scale) > tier3Cap) {
    tier3Scale = Math.sqrt(tier3Cap / tierGeom.tier3.area);
  }

  const tier1Logos = tier1
    .map((s) => wallLogoHtml(s, tierGeom.tier1, tier1Scale))
    .join("");
  const tier2Logos = tier2
    .map((s) => wallLogoHtml(s, tierGeom.tier2, tier2Scale))
    .join("");
  const tier3Logos = tier3
    .map((s) => wallLogoHtml(s, tierGeom.tier3, tier3Scale))
    .join("");

  return `
<article
  class="social-card social-card--all"
  data-format="${format}"
  data-sponsor="all"
  data-landmark="${escapeHtml(land.id)}"
  style="--frame-w: ${w}px; --frame-h: ${h}px;"
  aria-label="Thanks to our sponsors — Cursor Buildathon, El Salvador"
>
  ${cardBackdrop()}
  ${landmarkLayer(land.file)}
  <div class="social-card__inner">
    ${topBar}
    <main class="social-card__wall">
      <p class="social-card__eyebrow">
        <span class="social-card__eyebrow-mark"></span>${escapeHtml(copy.allEyebrow)}
      </p>
      <h1 class="social-card__wall-title">${escapeHtml(copy.allTitle)}</h1>
      <p class="social-card__context social-card__wall-context">${escapeHtml(context)}</p>
      <div class="social-card__wall-lockup">
        <div class="social-card__wall-tier social-card__wall-tier--tier1" role="list" aria-label="Featured sponsors">
          ${tier1Logos}
        </div>
        <div class="social-card__wall-tier social-card__wall-tier--tier2" role="list" aria-label="Lead sponsors">
          ${tier2Logos}
        </div>
        <div class="social-card__wall-tier social-card__wall-tier--tier3" role="list" aria-label="Community sponsors">
          ${tier3Logos}
        </div>
      </div>
      ${meta}
    </main>
    ${footer}
  </div>
</article>`;
}

function buildBannerInner({ copy, sponsorLabel, context, logoSrc, meta, footer }) {
  const topBar = `
    <header class="social-card__top">
      <div class="social-card__top-brand">
        <img class="social-card__host-mark" src="${HOST_LOGO}" alt="Cursor" crossorigin="anonymous" />
        <span class="social-card__brand">Buildathon · 2026</span>
      </div>
      <span class="social-card__top-place">El Salvador</span>
    </header>`;

  const thanksLine = `
    <p class="social-card__eyebrow">
      <span class="social-card__eyebrow-mark"></span>${escapeHtml(copy.thanks)}
    </p>`;

  const stage = `
    <div class="social-card__stage">
      <div class="social-card__logo" role="img" aria-label="${escapeHtml(sponsorLabel)}" style="background-image: url('${logoSrc}')"></div>
    </div>`;

  return `
    ${topBar}
    <div class="social-card__body social-card__body--banner">
      <div class="social-card__col-text">
        ${thanksLine}
        <p class="social-card__role">${escapeHtml(copy.role)}</p>
        <p class="social-card__name">${escapeHtml(sponsorLabel)}</p>
        <p class="social-card__context">${escapeHtml(context)}</p>
        ${meta}
      </div>
      <div class="social-card__col-logo">
        ${stage}
      </div>
    </div>
    ${footer}`;
}

/** 1:1 feed publication — sentence headline, sponsor logo sign-off (LinkedIn / X). */
function buildPublicationInner({ copy, sponsorLabel, logoSrc, meta, footer }) {
  const topBar = `
    <header class="social-card__top">
      <div class="social-card__top-brand">
        <img class="social-card__host-mark" src="${HOST_LOGO}" alt="Cursor" crossorigin="anonymous" />
        <span class="social-card__brand">Buildathon · 2026</span>
      </div>
      <span class="social-card__top-place">El Salvador</span>
    </header>`;

  return `
    ${topBar}
    <main class="social-card__pub">
      <span class="social-card__pub-badge">${escapeHtml(copy.pubBadge)}</span>
      <h1 class="social-card__pub-statement">
        <span class="social-card__pub-statement-brand">${escapeHtml(sponsorLabel)}</span> ${escapeHtml(copy.pubStatement)}
      </h1>
      <p class="social-card__pub-context">${escapeHtml(copy.pubContext)}</p>
      <div class="social-card__pub-grow" aria-hidden="true"></div>
      <div
        class="social-card__pub-logo"
        role="img"
        aria-label="${escapeHtml(sponsorLabel)}"
        style="background-image: url('${logoSrc}')"
      ></div>
      ${meta}
    </main>
    ${footer}`;
}

function buildFeedInner({ copy, sponsorLabel, context, logoSrc, meta, footer }) {
  const topBar = `
    <header class="social-card__top">
      <div class="social-card__top-brand">
        <img class="social-card__host-mark" src="${HOST_LOGO}" alt="Cursor" crossorigin="anonymous" />
        <span class="social-card__brand">Buildathon · 2026</span>
      </div>
      <span class="social-card__top-place">El Salvador</span>
    </header>`;

  const thanksLine = `
    <p class="social-card__eyebrow">
      <span class="social-card__eyebrow-mark"></span>${escapeHtml(copy.thanks)}
    </p>`;

  const stage = `
    <div class="social-card__stage">
      <div class="social-card__logo" role="img" aria-label="${escapeHtml(sponsorLabel)}" style="background-image: url('${logoSrc}')"></div>
    </div>`;

  return `
    ${topBar}
    <main class="social-card__main">
      ${thanksLine}
      <p class="social-card__role">${escapeHtml(copy.role)}</p>
      ${stage}
      <p class="social-card__name">${escapeHtml(sponsorLabel)}</p>
      <p class="social-card__context">${escapeHtml(context)}</p>
      ${meta}
    </main>
    ${footer}`;
}

/**
 * @param {object} opts
 * @param {import('./mentors.js').MENTORS[number]} opts.mentor
 * @param {'story'|'post'|'linkedin'|'linkedin-banner'|'x'|'banner'} opts.format
 * @param {'en'|'es'} opts.lang
 * @param {string} [opts.headlineOverride]
 * @param {string} [opts.photoId]
 */
export function buildMentorCardHtml({
  mentor,
  format,
  lang,
  headlineOverride,
  photoId,
}) {
  const copy = MENTOR_COPY[lang];
  const { w, h } = FORMATS[format];
  const context = headlineOverride?.trim() || copy.context;
  const mentorLabel = mentorDisplayName(mentor);
  const backdrop = resolveMentorBackdrop("surf");
  const photoFile = mentorPhotoFile(mentor, photoId);
  const mentorForRender = photoFile ? { ...mentor, photo: photoFile } : mentor;

  const meta = buildMetaBlock(copy);
  const powered = buildMentorPoweredBlock(copy);
  const footer = buildMentorFooter(copy, format);
  const topBar = buildTopBar();

  let inner = "";

  if (format === "banner" || format === "linkedin-banner") {
    inner = buildMentorBannerInner({
      copy,
      mentor: mentorForRender,
      mentorLabel,
      context,
      meta,
      powered,
      footer,
      topBar,
    });
  } else if (format === "linkedin" || format === "x") {
    inner = buildMentorPublicationInner({
      copy,
      mentor: mentorForRender,
      mentorLabel,
      meta,
      powered,
      footer,
      topBar,
    });
  } else {
    inner = buildMentorFeedInner({
      copy,
      mentor: mentorForRender,
      mentorLabel,
      context,
      meta,
      powered,
      footer,
      topBar,
    });
  }

  return `
<article
  class="social-card social-card--mentor"
  data-format="${format}"
  data-mentor="${escapeHtml(mentor.id)}"
  data-backdrop="${escapeHtml(backdrop.id)}"
  style="--frame-w: ${w}px; --frame-h: ${h}px;"
  aria-label="${escapeHtml(mentorLabel)} — Cursor Buildathon mentor, El Salvador"
>
  ${mentorPrintDefs()}
  ${cardBackdrop()}
  ${landmarkLayer(backdrop.file)}
  <div class="social-card__inner">
    ${inner}
  </div>
</article>`;
}

function buildMetaBlock(copy) {
  return `
    <div class="social-card__meta">
      <span>${escapeHtml(copy.date)}</span>
      <span class="social-card__meta-sep">·</span>
      <span class="social-card__meta-hot">24H</span>
      <span class="social-card__meta-sep">·</span>
      <span>${escapeHtml(copy.venue)}</span>
    </div>`;
}

function buildMentorPoweredBlock(copy) {
  return `
    <div class="social-card__mentor-powered">
      <span class="social-card__foot-label">${escapeHtml(copy.poweredBy)}</span>
      <div class="social-card__foot-logo" role="img" aria-label="Ai /abs" style="background-image: url('${AILABS_LOGO}')"></div>
    </div>`;
}

function buildMentorFooter(copy, format) {
  const sponsorCells = footerSponsorCells(format, FORMATS[format]?.w);
  if (!sponsorCells) {
    return `<footer class="social-card__foot social-card__foot--mentor" aria-hidden="true"></footer>`;
  }

  return `
    <footer class="social-card__foot social-card__foot--mentor">
      <div class="social-card__foot-sponsors">
        <span class="social-card__foot-sponsors-label">${escapeHtml(copy.sponsorsLabel)}</span>
        <div class="social-card__foot-sponsors-row">${sponsorCells}</div>
      </div>
    </footer>`;
}

function mentorPrintDefs() {
  return `
  <svg class="social-card__print-defs" width="0" height="0" aria-hidden="true" focusable="false">
    <filter id="mentor-print" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0.08" result="mono" />
      <feComponentTransfer in="mono" result="ink">
        <feFuncR type="linear" slope="1.25" intercept="-0.1" />
        <feFuncG type="linear" slope="1.25" intercept="-0.1" />
        <feFuncB type="linear" slope="1.25" intercept="-0.1" />
      </feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
      <feColorMatrix in="noise" type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" result="grainAlpha" />
      <feComposite in="grainAlpha" in2="ink" operator="in" result="grain" />
      <feBlend in="ink" in2="grain" mode="overlay" />
    </filter>
  </svg>`;
}

function buildTopBar() {
  return `
    <header class="social-card__top">
      <div class="social-card__top-brand">
        <img class="social-card__host-mark" src="${HOST_LOGO}" alt="Cursor" crossorigin="anonymous" />
        <span class="social-card__brand">Buildathon · 2026</span>
      </div>
      <span class="social-card__top-place">El Salvador</span>
    </header>`;
}

function mentorPortraitHtml(mentor, variant = "default") {
  const name = mentorDisplayName(mentor);
  const initials = mentorInitials(mentor);
  const hasPhoto = Boolean(mentor.photo);
  const variantClass =
    variant === "pub" ? " social-card__portrait--pub" : "";

  if (hasPhoto) {
    return `
    <div class="social-card__portrait${variantClass}" data-initials="${escapeHtml(initials)}">
      <img
        class="social-card__portrait-img"
        src="assets/${escapeHtml(mentor.photo)}"
        alt="${escapeHtml(name)}"
        crossorigin="anonymous"
        data-optional="true"
      />
      <span class="social-card__portrait-fallback" aria-hidden="true">${escapeHtml(initials)}</span>
    </div>`;
  }

  return `
    <div
      class="social-card__portrait social-card__portrait--monogram${variantClass}"
      role="img"
      aria-label="${escapeHtml(name)}"
      data-initials="${escapeHtml(initials)}"
    >
      <span class="social-card__portrait-fallback">${escapeHtml(initials)}</span>
    </div>`;
}

function mentorIdentityHtml(mentor, mentorLabel) {
  const companyLine = mentor.company
    ? `<p class="social-card__company">${escapeHtml(mentor.company)}</p>`
    : "";
  const handleLine = mentor.handle
    ? `<p class="social-card__handle">${escapeHtml(mentor.handle)}</p>`
    : "";

  return `
      <p class="social-card__name">${escapeHtml(mentorLabel)}</p>
      <p class="social-card__mentor-role">${escapeHtml(mentor.role)}</p>
      ${companyLine}
      ${handleLine}`;
}

function buildMentorFeedInner({ copy, mentor, mentorLabel, context, meta, powered, footer, topBar }) {
  const eyebrow = `
    <p class="social-card__eyebrow">
      <span class="social-card__eyebrow-mark"></span>${escapeHtml(copy.eyebrow)}
    </p>`;

  const stage = `
    <div class="social-card__stage social-card__stage--portrait">
      ${mentorPortraitHtml(mentor)}
    </div>`;

  return `
    ${topBar}
    <main class="social-card__main">
      ${eyebrow}
      <p class="social-card__role">${escapeHtml(copy.role)}</p>
      ${stage}
      ${mentorIdentityHtml(mentor, mentorLabel)}
      <p class="social-card__context">${escapeHtml(context)}</p>
      ${meta}
      ${powered}
    </main>
    ${footer}`;
}

function buildMentorBannerInner({ copy, mentor, mentorLabel, context, meta, powered, footer, topBar }) {
  const eyebrow = `
    <p class="social-card__eyebrow">
      <span class="social-card__eyebrow-mark"></span>${escapeHtml(copy.eyebrow)}
    </p>`;

  const stage = `
    <div class="social-card__stage social-card__stage--portrait">
      ${mentorPortraitHtml(mentor)}
    </div>`;

  return `
    ${topBar}
    <div class="social-card__body social-card__body--banner">
      <div class="social-card__col-text">
        ${eyebrow}
        <p class="social-card__role">${escapeHtml(copy.role)}</p>
        ${mentorIdentityHtml(mentor, mentorLabel)}
        <p class="social-card__context">${escapeHtml(context)}</p>
        ${meta}
        ${powered}
      </div>
      <div class="social-card__col-logo">
        ${stage}
      </div>
    </div>
    ${footer}`;
}

function buildMentorPublicationInner({ copy, mentor, mentorLabel, meta, powered, footer, topBar }) {
  const pubLead = mentorPubLead(copy, mentor);
  const role = mentor.role?.trim();
  const title = mentor.title?.trim();
  const company = mentor.company?.trim();

  const credLine =
    title || company
      ? `<p class="social-card__mpub-cred">${
          title ? `<span class="social-card__mpub-title">${escapeHtml(title)}</span>` : ""
        }${
          title && company ? `<span class="social-card__mpub-at"> at </span>` : ""
        }${
          company ? `<span class="social-card__mpub-company">${escapeHtml(company)}</span>` : ""
        }</p>`
      : role
        ? `<p class="social-card__mpub-cred"><span class="social-card__mpub-title">${escapeHtml(role)}</span></p>`
        : "";

  const photoSrc = mentor.photo ? `assets/${escapeHtml(mentor.photo)}` : "";
  const photo = mentor.photo
    ? `<div class="social-card__mpub-photo" style="--photo-src: url('${photoSrc}')">
        <img
          class="social-card__mpub-photo-img"
          src="${photoSrc}"
          alt="${escapeHtml(mentorLabel)}"
          crossorigin="anonymous"
          data-optional="true"
        />
        <div class="social-card__mpub-photo-halftone" aria-hidden="true"></div>
      </div>`
    : "";

  return `
    ${topBar}
    <main class="social-card__mpub">
      <div class="social-card__mpub-text">
        <span class="social-card__pub-badge">${escapeHtml(copy.pubBadge)}</span>
        <div class="social-card__mpub-id">
          <p class="social-card__mpub-name">${escapeHtml(mentorLabel)}</p>
          ${credLine}
        </div>
        <h1 class="social-card__mpub-statement">
          ${escapeHtml(pubLead)}<span class="social-card__mpub-event">${escapeHtml(copy.pubEvent)}</span> <span class="social-card__mpub-place">${escapeHtml(copy.pubPlace)}</span>
        </h1>
        <div class="social-card__pub-grow" aria-hidden="true"></div>
        ${meta}
        ${powered}
      </div>
      ${photo}
    </main>
    ${footer}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
