#!/usr/bin/env node
/**
 * Records the animated Instagram Story to a real .mp4 — zero npm dependencies.
 * Uses Chrome via the DevTools Protocol (built-in WebSocket/fetch in Node 18+)
 * to seek each frame deterministically, then ffmpeg to encode.
 *
 * Usage:
 *   node scripts/record-story.mjs --sponsor n8n --lang es --landmark volcano
 *   node scripts/record-story.mjs --sponsor codex --all-langs
 *   node scripts/record-story.mjs --all                # every sponsor, default lang
 *
 * Flags:
 *   --sponsor <id>     sponsor id (default n8n)
 *   --lang <en|es>     language (default es)
 *   --landmark <id>    volcano | monument (default volcano)
 *   --fps <n>          frames per second (default 30)
 *   --loop <ms>        clip length in ms (default 6000)
 *   --scale <n>        pixel scale, 1 = 1080x1920, 2 = 2160x3840 (default 1)
 *   --base <url>       server base (default http://127.0.0.1:8787)
 *   --out <dir>        output dir (default ./out)
 *   --all              record every sponsor
 *   --all-langs        record both en and es for the chosen sponsor(s)
 */

import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..");

const CHROME =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function parseArgs(argv) {
  const a = { fps: 30, loop: 6000, scale: 1, lang: "es", landmark: "volcano", sponsor: "n8n", base: "http://127.0.0.1:8787", out: join(ROOT, "out") };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    switch (k) {
      case "--sponsor": a.sponsor = v; i++; break;
      case "--lang": a.lang = v; i++; break;
      case "--landmark": a.landmark = v; i++; break;
      case "--fps": a.fps = Number(v); i++; break;
      case "--loop": a.loop = Number(v); i++; break;
      case "--scale": a.scale = Number(v); i++; break;
      case "--base": a.base = v; i++; break;
      case "--out": a.out = v; i++; break;
      case "--all": a.all = true; break;
      case "--all-langs": a.allLangs = true; break;
      default: break;
    }
  }
  return a;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getSponsorIds() {
  const mod = await import(join(ROOT, "js", "sponsors.js"));
  return mod.SPONSORS.map((s) => s.id);
}

/** Minimal CDP client over a single WebSocket. */
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
  const userDataDir = await mkdtemp(join(tmpdir(), "sv-rec-"));
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome not found at: ${CHROME}\nSet CHROME_BIN env var.`);
  }
  const proc = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--window-size=1080,1920",
    "about:blank",
  ], { stdio: "ignore" });
  return { proc, userDataDir };
}

async function getWsUrl(port) {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(150);
  }
  throw new Error("Chrome DevTools endpoint did not come up");
}

function openWs(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws));
    ws.addEventListener("error", (e) => reject(new Error("WS error: " + (e.message || "open failed"))));
  });
}

async function recordOne(cdp, sessionId, opts, framesDir) {
  const { base, sponsor, lang, landmark, fps, loop } = opts;
  const url = `${base}/story-anim.html?record=1&sponsor=${encodeURIComponent(sponsor)}&lang=${lang}&landmark=${landmark}&loop=${loop}`;

  await cdp.send("Page.navigate", { url }, sessionId);

  // Wait for window.__ready
  let ready = false;
  for (let i = 0; i < 120; i++) {
    const r = await cdp.send("Runtime.evaluate", { expression: "window.__ready === true", returnByValue: true }, sessionId);
    if (r?.result?.value === true) { ready = true; break; }
    await sleep(150);
  }
  if (!ready) throw new Error(`Page not ready: ${url} (is the server running on ${base}?)`);

  const frameCount = Math.round((loop / 1000) * fps);
  for (let f = 0; f < frameCount; f++) {
    const t = (f / fps) * 1000;
    await cdp.send("Runtime.evaluate", { expression: `window.__seek(${t})`, returnByValue: true }, sessionId);
    const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
    const buf = Buffer.from(shot.data, "base64");
    const name = "f_" + String(f).padStart(4, "0") + ".png";
    await writeFile(join(framesDir, name), buf);
    if (f % 30 === 0) process.stdout.write(`  frame ${f}/${frameCount}\r`);
  }
  process.stdout.write(`  frames: ${frameCount}/${frameCount}    \n`);
  return frameCount;
}

function encode(framesDir, fps, outFile) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-framerate", String(fps),
      "-i", join(framesDir, "f_%04d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "18",
      "-preset", "slow",
      "-movflags", "+faststart",
      outFile,
    ];
    const ff = spawn("ffmpeg", args, { stdio: "ignore" });
    ff.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("ffmpeg exited " + code))));
    ff.on("error", reject);
  });
}

async function main() {
  const opts = parseArgs(process.argv);
  await mkdir(opts.out, { recursive: true });

  let sponsors = [opts.sponsor];
  if (opts.all) sponsors = await getSponsorIds();
  const langs = opts.allLangs ? ["es", "en"] : [opts.lang];

  const port = 9333;
  const { proc, userDataDir } = await launchChrome(port);
  let ws;
  try {
    const wsUrl = await getWsUrl(port);
    ws = await openWs(wsUrl);
    const cdp = new CDP(ws);

    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1080, height: 1920, deviceScaleFactor: opts.scale, mobile: false,
    }, sessionId);

    for (const sponsor of sponsors) {
      for (const lang of langs) {
        const framesDir = await mkdtemp(join(tmpdir(), "sv-frames-"));
        const jobOpts = { ...opts, sponsor, lang };
        const outFile = join(opts.out, `story-${sponsor}-${lang}.mp4`);
        console.log(`\n● ${sponsor} · ${lang} → ${outFile}`);
        try {
          await recordOne(cdp, sessionId, jobOpts, framesDir);
          await encode(framesDir, opts.fps, outFile);
          console.log(`  done: ${outFile}`);
        } finally {
          await rm(framesDir, { recursive: true, force: true });
        }
      }
    }
  } finally {
    try { ws?.close(); } catch {}
    proc.kill("SIGKILL");
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
  console.log("\nAll done.");
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
