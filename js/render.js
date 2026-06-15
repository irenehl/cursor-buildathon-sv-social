import { COPY, FORMATS, LANDMARKS, DEFAULT_LANDMARK, sponsorDisplayName } from "./sponsors.js";
import { cardBackdrop, landmarkLayer } from "./sv-backdrop.js";

const HOST_LOGO = "logos/cursor-dark.svg";
const AILABS_LOGO = "logos/ailabs.svg";

/**
 * @param {object} opts
 * @param {import('./sponsors.js').SPONSORS[number]} opts.sponsor
 * @param {'story'|'post'|'linkedin'} opts.format
 * @param {'en'|'es'} opts.lang
 * @param {string} [opts.headlineOverride]
 * @param {'volcano'|'monument'} [opts.landmark]
 */
export function buildCardHtml({ sponsor, format, lang, headlineOverride, landmark }) {
  const copy = COPY[lang];
  const { w, h } = FORMATS[format];
  const context = headlineOverride?.trim() || copy.context;
  const logoSrc = `logos/${sponsor.logo}`;
  const sponsorLabel = sponsorDisplayName(sponsor);
  const land = LANDMARKS[landmark] || LANDMARKS[DEFAULT_LANDMARK];

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

  const role = `<p class="social-card__role">${escapeHtml(copy.role)}</p>`;

  const stage = `
    <div class="social-card__stage">
      <div class="social-card__logo" role="img" aria-label="${escapeHtml(sponsor.name)}" style="background-image: url('${logoSrc}')"></div>
    </div>`;

  const name = `<p class="social-card__name">${escapeHtml(sponsorLabel)}</p>`;
  const contextLine = `<p class="social-card__context">${escapeHtml(context)}</p>`;

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

  if (format === "linkedin") {
    inner = `
      ${topBar}
      <div class="social-card__body social-card__body--linkedin">
        <div class="social-card__col-text">
          ${thanksLine}
          ${role}
          ${name}
          ${contextLine}
          ${meta}
        </div>
        <div class="social-card__col-logo">
          ${stage}
        </div>
      </div>
      ${footer}`;
  } else {
    inner = `
      ${topBar}
      <main class="social-card__main">
        ${thanksLine}
        ${role}
        ${stage}
        ${name}
        ${contextLine}
        ${meta}
      </main>
      ${footer}`;
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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
