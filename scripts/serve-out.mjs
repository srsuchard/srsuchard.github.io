#!/usr/bin/env node
// Serves the static export (out/) the way GitHub Pages does, for local preview and e2e tests:
//   /dir/        -> dir/index.html
//   /dir         -> 301 to /dir/ when dir/ exists
//   /name        -> name.html when it exists
//   anything else -> 404.html with status 404
// Only GET and HEAD. Never serves a file outside the root.
import { createServer } from "node:http";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webmanifest": "application/manifest+json",
};

const isFileAt = (p) => existsSync(p) && statSync(p).isFile();
const isDirAt = (p) => existsSync(p) && statSync(p).isDirectory();

/** @param {string} rootDir */
export function createPagesServer(rootDir) {
  const root = resolve(rootDir);
  const realRoot = realpathSync(root);
  /** True if the path, after resolving symlinks, is still inside the root. */
  const contained = (p) => {
    try {
      const real = realpathSync(p);
      return real === realRoot || real.startsWith(realRoot + sep);
    } catch {
      return false;
    }
  };

  /** Resolve a URL path to an absolute path inside root, or null if it escapes root. */
  const inside = (urlPath) => {
    let decoded;
    try {
      decoded = decodeURIComponent(urlPath);
    } catch {
      return null;
    }
    if (decoded.includes("\0")) return null;
    const full = resolve(root, "." + decoded);
    return full === root || full.startsWith(root + sep) ? full : null;
  };

  // Only files and directories that resolve inside the root count; symlinks out of it are ignored.
  const isFile = (p) => isFileAt(p) && contained(p);
  const isDir = (p) => isDirAt(p) && contained(p);

  return createServer((req, res) => {
    const send = (status, file, headers = {}) => {
      const body = file ? readFileSync(file) : Buffer.alloc(0);
      const type = file ? TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" : "text/plain; charset=utf-8";
      res.writeHead(status, { "content-type": type, "content-length": body.length, ...headers });
      res.end(req.method === "HEAD" ? undefined : body);
    };
    const notFound = () => {
      const page = join(root, "404.html");
      send(404, isFile(page) ? page : null);
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { allow: "GET, HEAD" });
      return res.end();
    }

    const url = new URL(req.url ?? "/", "http://localhost");
    const target = inside(url.pathname);
    if (!target) return notFound();

    if (url.pathname.endsWith("/")) {
      const index = join(target, "index.html");
      return isFile(index) ? send(200, index) : notFound();
    }
    if (isFile(target)) return send(200, target);
    if (isDir(target) && isFile(join(target, "index.html"))) {
      return send(301, null, { location: `${url.pathname}/${url.search}` });
    }
    if (isFile(`${target}.html`)) return send(200, `${target}.html`);
    return notFound();
  });
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
  };
  const port = Number(arg("port", "3200"));
  const host = arg("host", "127.0.0.1");
  const dir = arg("dir", "out");
  if (!isFileAt(join(dir, "index.html"))) {
    console.error(`serve-out: ${dir}/index.html not found. Run \`pnpm build\` first.`);
    process.exit(1);
  }
  createPagesServer(dir).listen(port, host, () => {
    console.log(`serve-out: http://${host}:${port}/ (serving ${dir}/ like GitHub Pages)`);
  });
}
