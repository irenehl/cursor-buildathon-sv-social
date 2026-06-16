#!/usr/bin/env node
/**
 * Export sponsor social PNGs into a single folder tree on disk.
 * Requires the local server + Chrome (same setup as record-story.mjs).
 *
 * Usage:
 *   python3 -m http.server 8787   # in another terminal
 *   node scripts/export-pngs.mjs
 *   node scripts/export-pngs.mjs --format banner
 *   node scripts/export-pngs.mjs --out ./exports/my-pack
 *
 * Output layout:
 *   out/social-pngs/
 *     banner/
 *       buildathon-sv-codex-banner-en.png
 *       en/
 *       es/
 *     linkedin-banner/
 *       buildathon-sv-codex-linkedin-banner-en.png
 *       en/
 *       es/
 *     instagram-post/
 *     instagram-story/
 */

import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..");

const CHROME =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const FORMAT_FOLDERS = {
  linkedin: "linkedin",
  "linkedin-banner": "linkedin-banner",
  x: "x",
  banner: "banner",
  post: "instagram-post",
  story: "instagram-story",
};

const FORMATS = {
  linkedin: { w: 1080, h: 1080 },
  "linkedin-banner": { w: 1584, h: 396 },
  x: { w: 1080, h: 1080 },
  banner: { w: 1200, h: 627 },
  post: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
};

function parseArgs(argv) {
  const a = {
    base: "http://127.0.0.1:8787",
    out: join(ROOT, "out", "social-pngs"),
    landmark: "volcano",
    format: "all",
    lang: "all",
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    switch (k) {
      case "--base": a.base = v; i++; break;
      case "--out": a.out = v; i++; break;
      case "--landmark": a.landmark = v; i++; break;
      case "--format": a.format = v; i++; break;
      case "--lang": a.lang = v; i++; break;
      default: break;
    }
  }
  return a;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getSponsors() {
  const mod = await import(join(ROOT, "js", "sponsors.js"));
  return mod.SPONSORS;
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }
}

async function launchChrome(port) {
  const userDataDir = await mkdtemp(join(tmpdir(), "sv-png-"));
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome not found at: ${CHROME}\nSet CHROME_BIN env var.`);
  }
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  return { proc, userDataDir };
}

async function getWsUrl(port) {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  throw new Error("Chrome DevTools endpoint did not come up");
}

function openWs(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws));
    ws.addEventListener("error", (e) =>
      reject(new Error("WS error: " + (e.message || "open failed"))),
    );
  });
}

function pngFilename(sponsorId, format, lang) {
  return `buildathon-sv-${sponsorId}-${format}-${lang}.png`;
}

async function exportOne(cdp, sessionId, opts, sponsor, format, lang) {
  const { base, landmark } = opts;
  const url =
    `${base}/export-frame.html?` +
    new URLSearchParams({
      sponsor,
      format,
      lang,
      landmark,
    }).toString();

  const { w, h } = FORMATS[format];
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width: w, height: h, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );

  await cdp.send("Page.navigate", { url }, sessionId);

  let ready = false;
  for (let i = 0; i < 120; i++) {
    const r = await cdp.send(
      "Runtime.evaluate",
      { expression: "window.__ready === true", returnByValue: true },
      sessionId,
    );
    if (r?.result?.value === true) {
      ready = true;
      break;
    }
    await sleep(150);
  }
  if (!ready) {
    throw new Error(`Page not ready: ${url} (is the server running on ${base}?)`);
  }

  const r = await cdp.send(
    "Runtime.evaluate",
    { expression: "window.__exportPng()", awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (r?.exceptionDetails) {
    throw new Error(`Export failed for ${sponsor}/${format}/${lang}`);
  }
  return Buffer.from(r.result.value, "base64");
}

async function main() {
  const opts = parseArgs(process.argv);
  const sponsors = await getSponsors();
  const formats =
    opts.format === "all"
      ? Object.keys(FORMAT_FOLDERS)
      : opts.format.split(",").map((f) => f.trim());
  const langs = opts.lang === "all" ? ["en", "es"] : [opts.lang];

  await mkdir(opts.out, { recursive: true });

  const port = 9334;
  const { proc, userDataDir } = await launchChrome(port);
  let ws;

  const total = formats.length * sponsors.length * langs.length;
  let done = 0;

  try {
    const wsUrl = await getWsUrl(port);
    ws = await openWs(wsUrl);
    const cdp = new CDP(ws);

    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);

    console.log(`Exporting ${total} PNGs → ${opts.out}\n`);

    for (const format of formats) {
      const folderName = FORMAT_FOLDERS[format];
      const formatDir = join(opts.out, folderName);
      const enDir = join(formatDir, "en");
      const esDir = join(formatDir, "es");
      await mkdir(enDir, { recursive: true });
      await mkdir(esDir, { recursive: true });

      for (const sponsor of sponsors) {
        for (const lang of langs) {
          const filename = pngFilename(sponsor.id, format, lang);
          const buf = await exportOne(cdp, sessionId, opts, sponsor.id, format, lang);

          await writeFile(join(formatDir, filename), buf);
          await writeFile(join(lang === "en" ? enDir : esDir, filename), buf);

          done += 1;
          process.stdout.write(`  ${done}/${total}  ${folderName}/${filename}\n`);
        }
      }
    }
  } finally {
    try {
      ws?.close();
    } catch {}
    proc.kill("SIGKILL");
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }

  console.log(`\nDone. Folder: ${opts.out}`);
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
