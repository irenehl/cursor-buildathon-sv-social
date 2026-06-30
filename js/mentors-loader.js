import { setMentorsData } from "./mentors.js";

const MANIFEST_URL = "data/mentors/manifest.json";
const PHOTO_EXTENSIONS = ["jpeg", "jpg", "png", "webp"];
const PHOTO_DIRS = ["mentors/photos", "mentors"];

const photoCache = new Map();

/** Strip optional assets/ prefix, photo dirs, and a known extension → bare slug. */
function photoStem(raw) {
  if (!raw) return null;
  let key = raw.trim().replace(/^\/+/, "").replace(/^assets\//, "");
  key = key.replace(/^(?:mentors\/photos|mentors)\//, "");
  key = key.replace(/\.(png|jpe?g|webp)$/i, "");
  return key || null;
}

function isPhotoPath(value) {
  return /\.(png|jpe?g|webp)$/i.test(value);
}

async function assetExists(relPath) {
  const url = `assets/${relPath}`;
  let res = await fetch(url, { method: "HEAD", cache: "no-store" }).catch(() => null);
  if (res?.ok) return true;
  // Some static hosts reject HEAD; a 1-byte range GET is widely supported.
  res = await fetch(url, {
    method: "GET",
    headers: { Range: "bytes=0-0" },
    cache: "no-store",
  }).catch(() => null);
  return Boolean(res?.ok);
}

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

  const trimmed = photoKey.trim().replace(/^assets\//, "");
  if (isPhotoPath(trimmed) && (await assetExists(trimmed))) {
    photoCache.set(photoKey, trimmed);
    return trimmed;
  }

  const stem = photoStem(photoKey);
  if (!stem) {
    photoCache.set(photoKey, null);
    return null;
  }

  for (const dir of PHOTO_DIRS) {
    for (const ext of PHOTO_EXTENSIONS) {
      const rel = `${dir}/${stem}.${ext}`;
      if (await assetExists(rel)) {
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
