/** Sponsor backdrop — subtle grid + warm glow only. The El Salvador identity
 *  is carried by the halftone landmark photo (Monumento al Divino Salvador del Mundo),
 *  injected separately. No flags, no abstract clip-art. */

export function cardBackdrop() {
  return `
<div class="social-card__atmos" aria-hidden="true">
  <div class="social-card__atmos-grid"></div>
  <div class="social-card__atmos-glow"></div>
</div>`;
}

/** Full-bleed halftone landmark anchoring the country at the base of the card. */
export function landmarkLayer(file = "sv-volcano.png") {
  return `
<div class="social-card__landmark" aria-hidden="true">
  <img src="assets/${file}" alt="" crossorigin="anonymous" />
  <div class="social-card__landmark-fade"></div>
</div>`;
}
