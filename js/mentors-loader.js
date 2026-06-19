import { setMentorsData } from "./mentors.js";

const MANIFEST_URL = "data/mentors/manifest.json";
const PHOTO_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const PHOTO_DIRS = ["mentors/photos", "mentors"];

const photoCache = new Map();

function parseMentorMarkdown(raw) {
  const trimmed = raw.replace(/^\uFEFF/, "").trim();
  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
  if (!match) {
    return { meta: {}, body: trimmed };
  }

  const meta = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[kv[1]] = value;
  }

  return { meta, body: (match[2] ?? "").trim() };
}

function mentorFromMeta(meta, manifestId, body = "") {
  const id = meta.id?.trim() || manifestId;
  const name = meta.name?.trim();
  if (!name) {
    throw new Error(`Mentor "${manifestId}" is missing required field: name`);
  }

  const title = meta.title?.trim() || "";
  const company = meta.company?.trim() || "";
  const role =
    meta.role?.trim() ||
    [title, company].filter(Boolean).join(title && company ? " · " : "") ||
    "Buildathon mentor";

  const voice = meta.voice?.trim() === "joining" ? "joining" : "mentoring";
  const backdrop = meta.backdrop?.trim() || "surf";
  const photoKey = meta.photo?.trim() || id;

  return {
    id,
    name,
    displayName: meta.displayName?.trim() || undefined,
    title: title || undefined,
    company: company || undefined,
    role,
    handle: meta.handle?.trim() || undefined,
    link: meta.link?.trim() || undefined,
    voice,
    backdrop,
    photoKey,
    photo: null,
    bio: body || undefined,
  };
}

async function resolveMentorPhotoPath(photoKey) {
  if (!photoKey || photoKey === "monogram") return null;
  if (photoCache.has(photoKey)) return photoCache.get(photoKey) ?? null;

  for (const dir of PHOTO_DIRS) {
    for (const ext of PHOTO_EXTENSIONS) {
      const rel = `${dir}/${photoKey}.${ext}`;
      const res = await fetch(`assets/${rel}`, { method: "HEAD" }).catch(() => null);
      if (res?.ok) {
        photoCache.set(photoKey, rel);
        return rel;
      }
    }
  }

  photoCache.set(photoKey, null);
  return null;
}

export async function loadMentors(manifestUrl = MANIFEST_URL) {
  const manifestRes = await fetch(manifestUrl);
  if (!manifestRes.ok) {
    throw new Error(`Could not load mentor manifest (${manifestRes.status})`);
  }

  const manifest = await manifestRes.json();
  const ids = Array.isArray(manifest.mentors) ? manifest.mentors : [];
  if (ids.length === 0) {
    setMentorsData([]);
    return [];
  }

  const mentors = [];

  for (const manifestId of ids) {
    const mdRes = await fetch(`data/mentors/${manifestId}.md`);
    if (!mdRes.ok) {
      throw new Error(`Missing mentor file: data/mentors/${manifestId}.md`);
    }

    const raw = await mdRes.text();
    const { meta, body } = parseMentorMarkdown(raw);
    const mentor = mentorFromMeta(meta, manifestId, body);
    mentor.photo = await resolveMentorPhotoPath(mentor.photoKey);
    mentors.push(mentor);
  }

  setMentorsData(mentors);
  return mentors;
}
