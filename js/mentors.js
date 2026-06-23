/** Mentor list — photos optional; monogram fallback when missing. */
export const MENTOR_BACKDROPS = {
  coatepeque: {
    id: "coatepeque",
    file: "mentors/backdrops/coatepeque.png",
    label: "Lago de Coatepeque",
  },
  surf: {
    id: "surf",
    file: "mentors/backdrops/surf.png",
    label: "Pacific surf · El Tunco",
  },
  coffee: {
    id: "coffee",
    file: "mentors/backdrops/coffee.png",
    label: "Coffee highlands",
  },
  ceiba: {
    id: "ceiba",
    file: "mentors/backdrops/ceiba.png",
    label: "Ceiba tree",
  },
  milpa: {
    id: "milpa",
    file: "mentors/backdrops/milpa.png",
    label: "Maize milpa",
  },
  izalco: {
    id: "izalco",
    file: "mentors/backdrops/izalco.png",
    label: "Izalco ridge",
  },
};

const MONOGRAM_PHOTO = {
  id: "monogram",
  label: "Monogram (initials)",
  file: null,
};

export let MENTORS = [];

export let MENTOR_PHOTOS = { monogram: MONOGRAM_PHOTO };

export function setMentorsData(mentors) {
  MENTORS = mentors;
  MENTOR_PHOTOS = buildMentorPhotosFromMentors(mentors);
}

export function buildMentorPhotosFromMentors(mentors) {
  const photos = { monogram: MONOGRAM_PHOTO };
  for (const mentor of mentors) {
    if (mentor.photo) {
      photos[mentor.id] = {
        id: mentor.id,
        label: mentorDisplayName(mentor),
        file: mentor.photo,
      };
    }
  }
  return photos;
}

export function mentorDisplayName(mentor) {
  return mentor.displayName ?? mentor.name;
}

export function resolveMentorBackdrop(backdropId) {
  return MENTOR_BACKDROPS[backdropId] ?? MENTOR_BACKDROPS.surf;
}

export function mentorBackdrop(mentor) {
  return resolveMentorBackdrop(mentor.backdrop);
}

export function resolveMentorPhoto(photoId) {
  if (!photoId || photoId === "monogram") return null;
  const entry = MENTOR_PHOTOS[photoId];
  return entry?.file ?? null;
}

export function mentorPhotoFile(mentor, photoId) {
  if (photoId) return resolveMentorPhoto(photoId);
  return mentor.photo ?? null;
}

export function mentorInitials(mentor) {
  const parts = mentorDisplayName(mentor).trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export const MENTOR_FOOTER_SPONSOR_IDS = [
  "codex",
  "elevenlabs",
  "n8n",
  "zavu",
  "firecrawl",
  "datamcp",
  "exa",
  "fal",
  "netlify",
  "wispr",
];

export const MENTOR_COPY = {
  en: {
    eyebrow: "Buildathon mentor",
    role: "Mentor",
    context: "24 hours building with AI in San Salvador. Jul 4–5 at UFG.",
    date: "Jul 4–5, 2026",
    venue: "UFG · San Salvador",
    poweredBy: "Powered by",
    sponsorsLabel: "Sponsors",
    pubBadge: "MENTOR",
    pubContext: "24 hours building with AI · Jul 4–5 · UFG, San Salvador.",
  },
  es: {
    eyebrow: "Mentor del buildathon",
    role: "Mentor",
    context: "24 horas construyendo con IA en San Salvador. 4–5 jul en la UFG.",
    date: "4–5 jul 2026",
    venue: "UFG · San Salvador",
    poweredBy: "Powered by",
    sponsorsLabel: "Sponsors",
    pubBadge: "MENTOR",
    pubContext: "24 horas construyendo con IA · 4–5 jul · UFG, San Salvador.",
  },
};
