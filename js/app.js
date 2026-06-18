import { SPONSORS, FORMATS, COPY } from "./sponsors.js";
import { buildCardHtml } from "./render.js";

const $ = (sel) => document.querySelector(sel);

const sponsorSelect = $("#sponsor");
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
const DESKTOP_MQ = window.matchMedia("(min-width: 1024px)");

const LANGS = ["en", "es"];

/** Sentinel for the "all sponsors" wall — not a member of SPONSORS. */
const ALL_SPONSOR = { id: "all", name: "All sponsors", isAll: true };

const FORMAT_FOLDERS = {
  linkedin: "linkedin",
  x: "x",
  banner: "banner",
  post: "instagram-post",
  story: "instagram-story",
};

let currentFormat = "story";
let exportBusy = false;

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

function populateSponsors() {
  const sorted = [...SPONSORS].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  const allOpt = document.createElement("option");
  allOpt.value = ALL_SPONSOR.id;
  allOpt.textContent = "All sponsors";
  sponsorSelect.appendChild(allOpt);

  for (const s of sorted) {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    sponsorSelect.appendChild(opt);
  }
}

function updateSponsorCount() {
  const countEl = $("#sponsor-count");
  if (!countEl) return;

  const count = SPONSORS.length;
  countEl.textContent = `${count} sponsor${count === 1 ? "" : "s"}`;
}

function preloadLogos() {
  for (const s of SPONSORS) {
    const img = new Image();
    img.src = `sponsors/${s.logo}`;
  }
}

function getSponsor() {
  if (sponsorSelect.value === ALL_SPONSOR.id) return ALL_SPONSOR;
  return SPONSORS.find((s) => s.id === sponsorSelect.value) ?? SPONSORS[0];
}

function getLang() {
  const checked = document.querySelector('input[name="lang"]:checked');
  return checked?.value === "es" ? "es" : "en";
}

function getLandmark() {
  return "volcano";
}

function pngFilename(sponsor, format, lang) {
  return `buildathon-sv-${sponsor.id}-${format}-${lang}.png`;
}

function updateHeadlinePlaceholder() {
  headlineInput.placeholder = COPY[getLang()].context;
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
  const sponsor = getSponsor();
  const lang = getLang();
  const html = buildCardHtml({
    sponsor,
    format: currentFormat,
    lang,
    headlineOverride: headlineInput.value,
    landmark: getLandmark(),
    isAll: sponsor.isAll === true,
  });

  previewScaler.innerHTML = html;
  previewLabel.textContent = FORMATS[currentFormat].label;

  updateAnimLink();
  requestAnimationFrame(scalePreview);
}

function updateAnimLink() {
  const params = new URLSearchParams({
    sponsor: getSponsor().id,
    lang: getLang(),
    landmark: getLandmark(),
  });
  previewAnimLink.href = `story-anim.html?${params.toString()}`;
}

async function waitForImages(root) {
  const imgs = [...root.querySelectorAll("img")];
  await Promise.all(
    imgs.map(
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
}

async function renderCardBlob({ sponsor, format, lang }) {
  exportRoot.innerHTML = buildCardHtml({
    sponsor,
    format,
    lang,
    headlineOverride: headlineInput.value,
    landmark: getLandmark(),
    isAll: sponsor?.isAll === true,
  });

  await waitForImages(exportRoot);

  const card = exportRoot.querySelector(".social-card");
  const { w, h } = FORMATS[format];

  const blob = await htmlToImage.toBlob(card, {
    width: w,
    height: h,
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#080808",
  });

  if (!blob) throw new Error("PNG export failed");
  return blob;
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
      sponsor: getSponsor(),
      format: currentFormat,
      lang: getLang(),
    });
    downloadBlob(blob, pngFilename(getSponsor(), currentFormat, getLang()));
    setStatus("PNG downloaded.");
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

  const total = formats.length * SPONSORS.length * LANGS.length;
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

      for (const sponsor of SPONSORS) {
        for (const lang of LANGS) {
          const blob = await renderCardBlob({ sponsor, format, lang });
          const filename = pngFilename(sponsor, format, lang);

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

function init() {
  populateSponsors();
  updateSponsorCount();
  preloadLogos();
  updateHeadlinePlaceholder();
  initServerBanner();
  initShellTheme();
  initSidebar();
  initFormatTabs();
  initZipButtons();
  renderPreview();

  sponsorSelect.addEventListener("change", renderPreview);
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

init();
