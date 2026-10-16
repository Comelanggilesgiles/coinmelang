// Coinmelang API server — zero dependencies (Node 20+)
//   node server/index.mjs            → http://localhost:3000
// Serves the REST API under /api/* and the built frontend from /dist.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createBackend } from "./core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = process.env.DB_FILE || join(__dirname, "data", "db.json");
const DIST = resolve(__dirname, "..", "dist");
const MAX_BODY = 64 * 1024;

// ---- JSON file storage (atomic writes) ----
const storage = {
  load() {
    try {
      return JSON.parse(readFileSync(DATA_FILE, "utf8"));
    } catch {
      return null;
    }
  },
  save(db) {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    const tmp = DATA_FILE + ".tmp";
    writeFileSync(tmp, JSON.stringify(db, null, 2));
    renameSync(tmp, DATA_FILE);
  },
};

const backend = createBackend(storage);

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json" };

function send(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      if (!chunks.length) return resolveBody({});
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const cors = {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (url.pathname.startsWith("/api/")) {
    if (req.method === "OPTIONS") {
      res.writeHead(204, cors);
      return res.end();
    }
    try {
      const body = req.method === "POST" ? await readBody(req) : {};
      const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "") || null;
      const { status, data } = await backend.handle(req.method || "GET", url.pathname, body, token);
      const ms = Date.now();
      send(res, status, data, cors);
      console.log(`${new Date(ms).toISOString()} ${req.method} ${url.pathname} → ${status}`);
    } catch (e) {
      send(res, e.status || 500, { error: e.message || "Server error" }, cors);
    }
    return;
  }

  // ---- static frontend ----
  let file = normalize(join(DIST, url.pathname === "/" ? "index.html" : url.pathname));
  if (!file.startsWith(DIST) || !existsSync(file)) file = join(DIST, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Frontend not built. Run `npm run build` first.");
  }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});

server.listen(PORT, () => {
  console.log(`\n  🪙  Coinmelang API running at http://localhost:${PORT}`);
  console.log(`      Database: ${DATA_FILE}\n`);
});
