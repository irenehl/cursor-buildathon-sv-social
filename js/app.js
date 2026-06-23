import { SPONSORS, FORMATS, COPY } from "./sponsors.js";
import { MENTORS, MENTOR_COPY, MENTOR_BACKDROPS, MENTOR_PHOTOS } from "./mentors.js";
import { loadMentors } from "./mentors-loader.js";
import { buildCardHtml, buildMentorCardHtml } from "./render.js";

const $ = (sel) => document.querySelector(sel);

const sponsorSelect = $("#sponsor");
const subjectLabel = $("#subject-label");
const modeRadios = document.querySelectorAll('input[name="card-mode"]');
const mentorBackdropSelect = $("#mentor-backdrop");
const mentorPhotoSelect = $("#mentor-photo");
const mentorVoiceSelect = $("#mentor-voice");
const mentorTitleInput = $("#mentor-title");
const mentorCompanyInput = $("#mentor-company");
const mentorBackdropControl = $("#mentor-backdrop-control");
const mentorPhotoControl = $("#mentor-photo-control");
const mentorVoiceControl = $("#mentor-voice-control");
const mentorTitleControl = $("#mentor-title-control");
const mentorCompanyControl = $("#mentor-company-control");
const langRadios = document.querySelectorAll('input[name="lang"]');
const headlineInput = $("#headline");
const previewStage = $("#preview-stage");
const previewScaler = $("#preview-scaler");
const previewLabel = $("#preview-label");
const exportRoot = $("#export-root");
const statusEl = $("#status");
const formatTabs = document.querySelectorAll(".format-tab");
const previewAnimLink = $("#preview-anim");
const exportProgress = $("#export-progress");
const exportProgressBar = $("#export-progress-bar");
const exportButtons = document.querySelectorAll(
  "#export-one, #export-all, .batch-disclosure__actions .btn",
);

const SIDEBAR_STORAGE_KEY = "sv-social-sidebar-open";
const SHELL_THEME_STORAGE_KEY = "sv-social-shell-theme";
const CARD_MODE_STORAGE_KEY = "sv-social-card-mode";
const EXPORT_SCALE_STORAGE_KEY = "sv-social-export-scale";
const DESKTOP_MQ = window.matchMedia("(min-width: 1024px)");

const LANGS = ["en", "es"];
const MENTOR_FORMATS = new Set(["linkedin", "x"]);

/** Sentinel for the "all sponsors" wall — not a member of SPONSORS. */
const ALL_SPONSOR = { id: "all", name: "All sponsors", isAll: true };

const FORMAT_FOLDERS = {
  linkedin: "linkedin",
  "linkedin-banner": "linkedin-banner",
  x: "x",
  banner: "banner",
  post: "instagram-post",
  story: "instagram-story",
};

let currentFormat = "story";
let exportBusy = false;
let cardMode = "sponsors";

function isMentorMode() {
  return cardMode === "mentors";
}

function getSubjects() {
  return isMentorMode() ? MENTORS : SPONSORS;
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("is-error", isError);
}

function setExportProgress({ busy, done = 0, total = 0, indeterminate = false } = {}) {
  if (!exportProgress || !exportProgressBar) return;

  if (!busy) {
    exportProgress.hidden = true;
    exportProgress.classList.remove("is-indeterminate");
    exportProgressBar.style.width = "0%";
    exportProgress.setAttribute("aria-valuenow", "0");
    return;
  }

  exportProgress.hidden = false;

  if (indeterminate || total <= 0) {
    exportProgress.classList.add("is-indeterminate");
    exportProgressBar.style.width = "";
    exportProgress.removeAttribute("aria-valuenow");
    return;
  }

  exportProgress.classList.remove("is-indeterminate");
  const pct = Math.round((done / total) * 100);
  exportProgressBar.style.width = `${pct}%`;
  exportProgress.setAttribute("aria-valuenow", String(pct));
}

function setExportBusy(busy, progress = {}) {
  exportBusy = busy;
  exportButtons.forEach((btn) => {
    btn.disabled = busy;
  });
  setExportProgress({ busy, ...progress });
}

function populateSubjects() {
  const subjects = getSubjects();
  const previous = sponsorSelect.value;
  const sorted = [...subjects].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  sponsorSelect.innerHTML = "";

  if (!isMentorMode()) {
    const allOpt = document.createElement("option");
    allOpt.value = ALL_SPONSOR.id;
    allOpt.textContent = "All sponsors";
    sponsorSelect.appendChild(allOpt);
  }

  for (const subject of sorted) {
    const opt = document.createElement("option");
    opt.value = subject.id;
    opt.textContent = subject.name;
    sponsorSelect.appendChild(opt);
  }

  if (
    previous &&
    [...sponsorSelect.options].some((opt) => opt.value === previous)
  ) {
    sponsorSelect.value = previous;
  } else if (sponsorSelect.options.length > 0) {
    sponsorSelect.selectedIndex = 0;
  }

  if (isMentorMode()) {
    populateMentorPhotoOptions();
    syncMentorControlsToCurrent();
  }
}

function populateMentorPhotoOptions() {
  if (!mentorPhotoSelect) return;

  mentorPhotoSelect.innerHTML = "";
  for (const photo of Object.values(MENTOR_PHOTOS)) {
    const opt = document.createElement("option");
    opt.value = photo.id;
    opt.textContent = photo.label;
    mentorPhotoSelect.appendChild(opt);
  }
}

function populateSponsors() {
  populateSubjects();
}

function updateSponsorCount() {
  const countEl = $("#sponsor-count");
  if (!countEl) return;

  const count = getSubjects().length;
  const noun = isMentorMode() ? "mentor" : "sponsor";
  countEl.textContent = `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function updateSubjectLabel() {
  if (!subjectLabel) return;
  subjectLabel.textContent = isMentorMode() ? "Mentor" : "Sponsor";
}

function updateModeUi() {
  updateSubjectLabel();
  updateSponsorCount();
  updateHeadlinePlaceholder();
  populateSubjects();
  populateMentorControls();
  syncMentorControlsToCurrent();
  toggleMentorControls();
  updateFormatTabsForMode();
  ensureValidFormatForMode();
  if (previewAnimLink) {
    previewAnimLink.hidden = isMentorMode();
  }
  document.title = isMentorMode()
    ? "Cursor Buildathon SV · Mentor Social Cards"
    : "Cursor Buildathon SV · Sponsor Social Cards";
  const titleEl = $(".sidebar__title");
  if (titleEl) {
    titleEl.textContent = isMentorMode() ? "Mentor social cards" : "Sponsor social cards";
  }
  const exportAllBtn = $("#export-all");
  if (exportAllBtn) {
    exportAllBtn.textContent = isMentorMode()
      ? "All mentors — ZIP (this format)"
      : "All sponsors — ZIP (this format)";
  }
}

function populateMentorControls() {
  if (!mentorBackdropSelect || !mentorPhotoSelect) return;

  mentorBackdropSelect.innerHTML = "";
  for (const backdrop of Object.values(MENTOR_BACKDROPS)) {
    const opt = document.createElement("option");
    opt.value = backdrop.id;
    opt.textContent = backdrop.label;
    mentorBackdropSelect.appendChild(opt);
  }

  if (isMentorMode()) populateMentorPhotoOptions();
}

function toggleMentorControls() {
  const show = isMentorMode();
  if (mentorBackdropControl) mentorBackdropControl.hidden = true;
  if (mentorPhotoControl) mentorPhotoControl.hidden = !show;
  if (mentorVoiceControl) mentorVoiceControl.hidden = !show;
  if (mentorTitleControl) mentorTitleControl.hidden = !show;
  if (mentorCompanyControl) mentorCompanyControl.hidden = !show;
}

function updateFormatTabsForMode() {
  formatTabs.forEach((tab) => {
    const visible = !isMentorMode() || MENTOR_FORMATS.has(tab.dataset.format);
    tab.hidden = !visible;
  });
}

function ensureValidFormatForMode() {
  if (!isMentorMode() || MENTOR_FORMATS.has(currentFormat)) return;
  const linkedinTab = [...formatTabs].find((t) => t.dataset.format === "linkedin");
  if (linkedinTab) selectFormatTab(linkedinTab);
}

function defaultPhotoIdForMentor(mentor) {
  if (!mentor?.photo) return "monogram";
  const match = Object.values(MENTOR_PHOTOS).find((p) => p.file === mentor.photo);
  return match?.id ?? "monogram";
}

function syncMentorControlsToCurrent() {
  if (!isMentorMode() || !mentorBackdropSelect || !mentorPhotoSelect) return;
  const mentor = getCurrent();
  mentorBackdropSelect.value = mentor.backdrop ?? "surf";
  mentorPhotoSelect.value = defaultPhotoIdForMentor(mentor);
  if (mentorVoiceSelect) {
    mentorVoiceSelect.value = mentor.voice === "joining" ? "joining" : "mentoring";
  }
  if (mentorTitleInput) mentorTitleInput.value = mentor.title ?? "";
  if (mentorCompanyInput) mentorCompanyInput.value = mentor.company ?? "";
}

function getMentorVoice() {
  if (mentorVoiceSelect?.value === "joining") return "joining";
  return "mentoring";
}

function getMentorPhotoId() {
  return mentorPhotoSelect?.value || defaultPhotoIdForMentor(getCurrent());
}

function preloadLogos() {
  for (const s of SPONSORS) {
    const img = new Image();
    img.src = `sponsors/${s.logo}`;
  }
  for (const m of MENTORS) {
    if (m.photo) {
      const img = new Image();
      img.src = `assets/${m.photo}`;
    }
  }
  for (const photo of Object.values(MENTOR_PHOTOS)) {
    if (photo.file) {
      const img = new Image();
      img.src = `assets/${photo.file}`;
    }
  }
}

function getCurrent() {
  if (isMentorMode()) {
    return MENTORS.find((m) => m.id === sponsorSelect.value) ?? MENTORS[0];
  }
  if (sponsorSelect.value === ALL_SPONSOR.id) return ALL_SPONSOR;
  return SPONSORS.find((s) => s.id === sponsorSelect.value) ?? SPONSORS[0];
}

function getSponsor() {
  return getCurrent();
}

function getLang() {
  const checked = document.querySelector('input[name="lang"]:checked');
  return checked?.value === "es" ? "es" : "en";
}

function getLandmark() {
  return "volcano";
}

function getExportScale() {
  const checked = document.querySelector('input[name="export-scale"]:checked');
  return Number(checked?.value) === 3 ? 3 : 2;
}

function exportDimensions(format, scale = getExportScale()) {
  const { w, h } = FORMATS[format];
  return { w: w * scale, h: h * scale };
}

function exportSupportsZoom() {
  return "zoom" in document.documentElement.style;
}

function updateExportScaleLabels() {
  const { w, h } = FORMATS[currentFormat];
  for (const scale of [2, 3]) {
    const text = document.querySelector(`#scale-${scale}x + .lang-radio__text`);
    if (text) text.textContent = `${scale}× · ${w * scale}×${h * scale}`;
  }
}

function pngFilename(subject, format, lang, scale = getExportScale()) {
  const scaleTag = `@${scale}x`;
  if (isMentorMode()) {
    return `buildathon-sv-mentor-${subject.id}-${format}-${lang}${scaleTag}.png`;
  }
  return `buildathon-sv-${subject.id}-${format}-${lang}${scaleTag}.png`;
}

function mentorForCard(subject, { forPreview = false } = {}) {
  const isCurrentPreview = forPreview && subject.id === getCurrent()?.id;
  if (!isCurrentPreview) {
    return {
      ...subject,
      voice: subject.voice === "joining" ? "joining" : "mentoring",
    };
  }

  return {
    ...subject,
    voice: getMentorVoice(),
    title: mentorTitleInput?.value.trim() || subject.title,
    company: mentorCompanyInput?.value.trim() || subject.company,
  };
}

function buildCardForSubject({ subject, format, lang, forPreview = false }) {
  if (isMentorMode()) {
    const mentor = mentorForCard(subject, { forPreview });
    const isCurrentPreview = forPreview && subject.id === getCurrent()?.id;
    return buildMentorCardHtml({
      mentor,
      format,
      lang,
      headlineOverride: isCurrentPreview ? headlineInput.value : "",
      photoId: isCurrentPreview ? getMentorPhotoId() : undefined,
    });
  }
  return buildCardHtml({
    sponsor: subject,
    format,
    lang,
    headlineOverride: headlineInput.value,
    landmark: getLandmark(),
    isAll: subject?.isAll === true,
  });
}

function updateHeadlinePlaceholder() {
  const copy = isMentorMode() ? MENTOR_COPY[getLang()] : COPY[getLang()];
  headlineInput.placeholder = copy.context;
}

function scalePreview() {
  const card = previewScaler.querySelector(".social-card");
  if (!card) return;

  const { w, h } = FORMATS[currentFormat];
  const stageWidth = previewStage.clientWidth - 48;
  const scale = Math.min(1, stageWidth / w);
  previewScaler.style.transform = `scale(${scale})`;
  previewScaler.style.width = `${w}px`;
  previewScaler.style.height = `${h * scale}px`;
}

function renderPreview() {
  const subject = getCurrent();
  const lang = getLang();
  const html = buildCardForSubject({
    subject,
    format: currentFormat,
    lang,
    forPreview: true,
  });

  previewScaler.innerHTML = html;
  previewLabel.textContent = FORMATS[currentFormat].label;

  updateExportScaleLabels();
  updateAnimLink();
  requestAnimationFrame(scalePreview);
}

function updateAnimLink() {
  if (isMentorMode()) return;
  const params = new URLSearchParams({
    sponsor: getCurrent().id,
    lang: getLang(),
    landmark: getLandmark(),
  });
  previewAnimLink.href = `story-anim.html?${params.toString()}`;
}

async function waitForImages(root) {
  const required = [...root.querySelectorAll("img:not([data-optional])")];
  const optional = [...root.querySelectorAll("img[data-optional]")];

  await Promise.all(
    required.map(
      (img) =>
        new Promise((resolve, reject) => {
          if (img.complete && img.naturalWidth) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load ${img.src}`));
        }),
    ),
  );

  await Promise.all(
    optional.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => {
            img.style.display = "none";
            resolve();
          };
        }),
    ),
  );
}

async function renderCardBlob({ subject, format, lang, forPreview = false, scale = getExportScale() }) {
  exportRoot.innerHTML = buildCardForSubject({
    subject,
    format,
    lang,
    forPreview,
  });

  await waitForImages(exportRoot);

  const card = exportRoot.querySelector(".social-card");
  const { w, h } = FORMATS[format];
  const outW = w * scale;
  const outH = h * scale;
  const useZoom = exportSupportsZoom();

  exportRoot.style.width = `${outW}px`;
  exportRoot.style.height = `${outH}px`;
  if (useZoom) card.style.zoom = String(scale);

  try {
    const blob = await htmlToImage.toBlob(card, {
      width: useZoom ? outW : w,
      height: useZoom ? outH : h,
      pixelRatio: useZoom ? 1 : scale,
      cacheBust: true,
      backgroundColor: "#080808",
    });

    if (!blob) throw new Error("PNG export failed");
    return blob;
  } finally {
    card.style.zoom = "";
    exportRoot.style.width = "";
    exportRoot.style.height = "";
  }
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportPng({ batch = false } = {}) {
  if (batch) {
    return exportZipPack([currentFormat]);
  }

  if (typeof htmlToImage === "undefined") {
    setStatus("Export library not loaded. Check your connection.", true);
    return;
  }
  if (exportBusy) return;

  setExportBusy(true, { indeterminate: true });
  setStatus("Exporting…");

  try {
    await document.fonts.ready;
    const blob = await renderCardBlob({
      subject: getCurrent(),
      format: currentFormat,
      lang: getLang(),
      forPreview: isMentorMode(),
    });
    const scale = getExportScale();
    const { w: outW, h: outH } = exportDimensions(currentFormat, scale);
    downloadBlob(blob, pngFilename(getCurrent(), currentFormat, getLang(), scale));
    setStatus(`PNG downloaded (${scale}× · ${outW}×${outH}).`);
  } catch (err) {
    console.error(err);
    setStatus(`Export failed: ${err.message}`, true);
  } finally {
    exportRoot.innerHTML = "";
    setExportBusy(false);
  }
}

async function exportZipPack(formats) {
  if (typeof htmlToImage === "undefined") {
    setStatus("Export library not loaded. Check your connection.", true);
    return;
  }
  if (typeof JSZip === "undefined") {
    setStatus("ZIP library not loaded. Check your connection.", true);
    return;
  }
  if (exportBusy) return;

  const subjects = getSubjects();
  const total = formats.length * subjects.length * LANGS.length;
  let done = 0;

  setExportBusy(true, { done: 0, total });
  setStatus(`Building ZIP… 0 / ${total}`);

  try {
    await document.fonts.ready;

    const zip = new JSZip();

    for (const format of formats) {
      const folderName = FORMAT_FOLDERS[format];
      const folder = zip.folder(folderName);
      const enFolder = folder.folder("en");
      const esFolder = folder.folder("es");

      for (const subject of subjects) {
        for (const lang of LANGS) {
          const blob = await renderCardBlob({ subject, format, lang });
          const filename = pngFilename(subject, format, lang);

          folder.file(filename, blob);
          if (lang === "en") enFolder.file(filename, blob);
          else esFolder.file(filename, blob);

          done += 1;
          setExportBusy(true, { done, total });
          setStatus(`Building ZIP… ${done} / ${total}`);
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const stamp = new Date().toISOString().slice(0, 10);
    const zipName =
      formats.length === 1
        ? `buildathon-sv-${FORMAT_FOLDERS[formats[0]]}-${stamp}.zip`
        : `buildathon-sv-social-${stamp}.zip`;

    downloadBlob(zipBlob, zipName);
    setStatus(`Done — ${zipName} (${total} PNGs in ${formats.length} folder${formats.length > 1 ? "s" : ""}).`);
  } catch (err) {
    console.error(err);
    setStatus(`ZIP export failed: ${err.message}`, true);
  } finally {
    exportRoot.innerHTML = "";
    setExportBusy(false);
  }
}

function selectFormatTab(tab) {
  currentFormat = tab.dataset.format;
  formatTabs.forEach((t) => {
    const isActive = t === tab;
    t.classList.toggle("is-active", isActive);
    t.setAttribute("aria-selected", isActive ? "true" : "false");
    t.tabIndex = isActive ? 0 : -1;
  });
  renderPreview();
}

function initFormatTabs() {
  const tabs = [...formatTabs];

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectFormatTab(tab));

    tab.addEventListener("keydown", (e) => {
      const idx = tabs.indexOf(tab);
      let next = -1;

      if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;

      e.preventDefault();
      tabs[next].focus();
      selectFormatTab(tabs[next]);
    });
  });
}

function getPreferredShellTheme() {
  const stored = localStorage.getItem(SHELL_THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setShellTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-shell-theme", theme);
  localStorage.setItem(SHELL_THEME_STORAGE_KEY, theme);

  const toggle = $("#theme-toggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

function initShellTheme() {
  setShellTheme(getPreferredShellTheme());

  $("#theme-toggle")?.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-shell-theme") === "light"
        ? "light"
        : "dark";
    setShellTheme(current === "dark" ? "light" : "dark");
  });
}

function isDesktop() {
  return DESKTOP_MQ.matches;
}

function setSidebarOpen(open) {
  const layout = $("#app-layout");
  const toggle = $("#sidebar-toggle");
  const backdrop = $("#sidebar-backdrop");
  if (!layout || !toggle) return;

  layout.classList.toggle("is-sidebar-open", open);
  layout.classList.toggle("is-sidebar-closed", !open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");

  if (!isDesktop()) {
    if (open) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("is-visible"));
      document.body.style.overflow = "hidden";
    } else {
      backdrop.classList.remove("is-visible");
      document.body.style.overflow = "";
      window.setTimeout(() => {
        backdrop.hidden = true;
      }, 280);
    }
  } else {
    backdrop.hidden = true;
    backdrop.classList.remove("is-visible");
    document.body.style.overflow = "";
    localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "1" : "0");
  }

  requestAnimationFrame(scalePreview);
}

function initSidebar() {
  const layout = $("#app-layout");
  const toggle = $("#sidebar-toggle");
  const closeBtn = $("#sidebar-close");
  const backdrop = $("#sidebar-backdrop");
  if (!layout || !toggle) return;

  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  const defaultOpen = isDesktop() ? stored !== "0" : false;
  setSidebarOpen(defaultOpen);

  toggle.addEventListener("click", () => {
    setSidebarOpen(!layout.classList.contains("is-sidebar-open"));
  });

  closeBtn?.addEventListener("click", () => setSidebarOpen(false));
  backdrop?.addEventListener("click", () => setSidebarOpen(false));

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      layout.classList.contains("is-sidebar-open") &&
      !isDesktop()
    ) {
      setSidebarOpen(false);
    }
  });

  DESKTOP_MQ.addEventListener("change", () => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    setSidebarOpen(isDesktop() ? saved !== "0" : false);
  });

  layout.querySelector(".sidebar")?.addEventListener("transitionend", (e) => {
    if (e.propertyName === "width" || e.propertyName === "transform") {
      scalePreview();
    }
  });
}

function initServerBanner() {
  const banner = $("#server-banner");
  const dismiss = $("#server-banner-dismiss");
  if (!banner || !dismiss) return;

  if (sessionStorage.getItem("sv-social-banner-dismissed") === "1") return;

  if (location.protocol === "file:") {
    banner.hidden = false;
  }

  dismiss.addEventListener("click", () => {
    banner.hidden = true;
    sessionStorage.setItem("sv-social-banner-dismissed", "1");
  });
}

function initZipButtons() {
  document.querySelectorAll("[data-zip-formats]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const formats = btn.dataset.zipFormats.split(",").map((f) => f.trim());
      exportZipPack(formats);
    });
  });
}

function initExportScale() {
  const stored = localStorage.getItem(EXPORT_SCALE_STORAGE_KEY);
  const scaleInput = stored === "3" ? $("#scale-3x") : $("#scale-2x");
  if (scaleInput) scaleInput.checked = true;
  updateExportScaleLabels();

  document.querySelectorAll('input[name="export-scale"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      localStorage.setItem(EXPORT_SCALE_STORAGE_KEY, String(getExportScale()));
    });
  });
}

function setCardMode(mode) {
  cardMode = mode === "mentors" ? "mentors" : "sponsors";
  localStorage.setItem(CARD_MODE_STORAGE_KEY, cardMode);
  modeRadios.forEach((radio) => {
    radio.checked = radio.value === cardMode;
  });
  updateModeUi();
  renderPreview();
}

function initCardMode() {
  const stored = localStorage.getItem(CARD_MODE_STORAGE_KEY);
  if (stored === "mentors" || stored === "sponsors") {
    cardMode = stored;
  }
  modeRadios.forEach((radio) => {
    radio.checked = radio.value === cardMode;
    radio.addEventListener("change", () => {
      if (radio.checked) setCardMode(radio.value);
    });
  });
  updateModeUi();
}

function init() {
  initCardMode();
  populateSponsors();
  updateSponsorCount();
  preloadLogos();
  updateHeadlinePlaceholder();
  initServerBanner();
  initShellTheme();
  initSidebar();
  initFormatTabs();
  initZipButtons();
  initExportScale();
  if (isMentorMode() && MENTORS.length === 0) {
    setStatus("No mentors loaded — check data/mentors/", true);
  }
  renderPreview();

  sponsorSelect.addEventListener("change", () => {
    if (isMentorMode()) syncMentorControlsToCurrent();
    renderPreview();
  });
  mentorPhotoSelect?.addEventListener("change", onMentorPhotoChanged);
  mentorVoiceSelect?.addEventListener("change", renderPreview);
  mentorTitleInput?.addEventListener("input", renderPreview);
  mentorCompanyInput?.addEventListener("input", renderPreview);
  langRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      updateHeadlinePlaceholder();
      renderPreview();
    });
  });
  headlineInput.addEventListener("input", renderPreview);
  window.addEventListener("resize", scalePreview);

  $("#export-one").addEventListener("click", () => exportPng({ batch: false }));
  $("#export-all").addEventListener("click", () => exportPng({ batch: true }));
}

function onMentorPhotoChanged() {
  const photoId = mentorPhotoSelect?.value;

  if (photoId && photoId !== "monogram" && isMentorMode()) {
    const mentor = MENTORS.find((m) => m.id === photoId);
    if (mentor && sponsorSelect.value !== photoId) {
      sponsorSelect.value = photoId;
      syncMentorControlsToCurrent();
    }
  }

  renderPreview();
}

async function boot() {
  try {
    await loadMentors();
  } catch (err) {
    console.error(err);
    setStatus(`Mentor data error: ${err.message}`, true);
  }
  init();
}

boot();
