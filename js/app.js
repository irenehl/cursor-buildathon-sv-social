import { SPONSORS, FORMATS, COPY } from "./sponsors.js";
import { buildCardHtml } from "./render.js";

const $ = (sel) => document.querySelector(sel);

const sponsorSelect = $("#sponsor");
const langSelect = $("#lang");
const landmarkSelect = $("#landmark");
const headlineInput = $("#headline");
const previewStage = $("#preview-stage");
const previewScaler = $("#preview-scaler");
const previewLabel = $("#preview-label");
const exportRoot = $("#export-root");
const statusEl = $("#status");
const formatTabs = document.querySelectorAll(".format-tab");
const previewAnimLink = $("#preview-anim");
const exportButtons = document.querySelectorAll(
  "#export-one, #export-all, .batch-export__actions .btn",
);

const LANGS = ["en", "es"];

const FORMAT_FOLDERS = {
  linkedin: "linkedin",
  post: "instagram-post",
  story: "instagram-story",
};

let currentFormat = "story";
let exportBusy = false;

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("is-error", isError);
}

function setExportBusy(busy) {
  exportBusy = busy;
  exportButtons.forEach((btn) => {
    btn.disabled = busy;
  });
}

function populateSponsors() {
  for (const s of SPONSORS) {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    sponsorSelect.appendChild(opt);
  }
}

function preloadLogos() {
  for (const s of SPONSORS) {
    const img = new Image();
    img.src = `logos/${s.logo}`;
  }
}

function getSponsor() {
  return SPONSORS.find((s) => s.id === sponsorSelect.value) ?? SPONSORS[0];
}

function getLang() {
  return langSelect.value === "es" ? "es" : "en";
}

function getLandmark() {
  return landmarkSelect.value;
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

  setExportBusy(true);
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

  setExportBusy(true);
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

function initFormatTabs() {
  formatTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentFormat = tab.dataset.format;
      formatTabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      renderPreview();
    });
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
  preloadLogos();
  updateHeadlinePlaceholder();
  initFormatTabs();
  initZipButtons();
  renderPreview();

  sponsorSelect.addEventListener("change", renderPreview);
  langSelect.addEventListener("change", () => {
    updateHeadlinePlaceholder();
    renderPreview();
  });
  landmarkSelect.addEventListener("change", renderPreview);
  headlineInput.addEventListener("input", renderPreview);
  window.addEventListener("resize", scalePreview);

  $("#export-one").addEventListener("click", () => exportPng({ batch: false }));
  $("#export-all").addEventListener("click", () => exportPng({ batch: true }));
}

init();
