import { COPY, FORMATS, LANDMARKS, DEFAULT_LANDMARK, sponsorDisplayName } from "./sponsors.js";
import { cardBackdrop, landmarkLayer } from "./sv-backdrop.js";

const HOST_LOGO = "sponsors/cursor-dark.svg";
const AILABS_LOGO = "sponsors/ailabs.svg";

/**
 * @param {object} opts
 * @param {import('./sponsors.js').SPONSORS[number]} opts.sponsor
 * @param {'story'|'post'|'linkedin'|'x'|'banner'} opts.format
 * @param {'en'|'es'} opts.lang
 * @param {string} [opts.headlineOverride]
 * @param {'volcano'|'monument'} [opts.landmark]
 */
export function buildCardHtml({ sponsor, format, lang, headlineOverride, landmark }) {
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

  if (format === "banner") {
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
  aria-label="Thank you ${escapeHtml(sponsor.name)} — Cursor Buildathon El Salvador"
>
  ${cardBackdrop()}
  ${landmarkLayer(land.file)}
  <div class="social-card__inner">
    ${inner}
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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
