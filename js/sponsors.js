/** Sponsor list — logo paths relative to /logos/ (symlinked from main repo). */
/** `displayName` is verbatim brand typography on cards (never auto-uppercased). */
export const SPONSORS = [
  { id: "n8n", name: "n8n", displayName: "n8n", logo: "n8n-logo-dark.svg" },
  { id: "codex", name: "Codex", displayName: "Codex", logo: "codex.svg" },
  { id: "yonjob", name: "Yonjob", displayName: "Yonjob", logo: "yonjob-dark.svg" },
  { id: "nubiwork", name: "Nub;Work", displayName: "Nub;Work", logo: "nubiwork-dark.svg" },
  { id: "abaco", name: "Abaco", displayName: "Abaco", logo: "abaco-dark.svg" },
  { id: "elevenlabs", name: "ElevenLabs", displayName: "ElevenLabs", logo: "elevenlabs-dark.svg" },
  { id: "simov", name: "Simov", displayName: "Simov", logo: "simov-dark.svg" },
  { id: "kreali", name: "Kreali", displayName: "Kreali", logo: "kreali-dark.svg" },
  { id: "weris", name: "Weris", displayName: "Weris", logo: "weris_dark.svg" },
  { id: "boxful", name: "Boxful", displayName: "Boxful", logo: "boxful-dark.svg" },
  { id: "drop", name: "Drop", displayName: "Drop", logo: "drop-dark.svg" },
  { id: "gamesquad", name: "GameSquad", displayName: "GameSquad", logo: "gamesquad-dark.svg" },
  { id: "searchyou", name: "SearchYou", displayName: "SearchYou", logo: "searchyou-dark.svg" },
  { id: "dma", name: "DMA", displayName: "DMA", logo: "dma-dark.svg" },
  { id: "netlify", name: "Netlify", displayName: "Netlify", logo: "netlify-dark.svg" },
  { id: "wispr", name: "Wispr", displayName: "Wispr", logo: "wispr-dark.svg" },
  { id: "fal", name: "Fal", displayName: "fal", logo: "fal-dark.svg" },
  { id: "exa", name: "Exa", displayName: "Exa", logo: "exa-dark.svg" },
  { id: "zavu", name: "Zavu", displayName: "Zavu", logo: "zavu-dark.svg" },
  { id: "cursor", name: "Cursor", displayName: "Cursor", logo: "cursor-dark.svg" },
];

export function sponsorDisplayName(sponsor) {
  return sponsor.displayName ?? sponsor.name;
}

export const COPY = {
  en: {
    thanks: "Thanks to our sponsor",
    role: "Official sponsor",
    context: "Backing the 24-hour Cursor Buildathon in El Salvador.",
    date: "Jul 4–5, 2026",
    venue: "UFG · San Salvador",
    poweredBy: "Powered by",
  },
  es: {
    thanks: "Gracias a nuestro sponsor",
    role: "Sponsor oficial",
    context: "Apoyando el Buildathon Cursor de 24 horas en El Salvador.",
    date: "4–5 jul 2026",
    venue: "UFG · San Salvador",
    poweredBy: "Powered by",
  },
};

export const FORMATS = {
  story: { w: 1080, h: 1920, label: "Instagram Story · 1080×1920" },
  post: { w: 1080, h: 1080, label: "Instagram Post · 1080×1080" },
  linkedin: { w: 1200, h: 627, label: "LinkedIn · 1200×627" },
};

/** El Salvador backdrop art (halftone). `default` is used on load. */
export const LANDMARKS = {
  volcano: { id: "volcano", file: "sv-volcano.png", label: "Volcán Santa Ana" },
  monument: { id: "monument", file: "sv-landmark.png", label: "Divino Salvador del Mundo" },
};

export const DEFAULT_LANDMARK = "volcano";
