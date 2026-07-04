# CLAUDE.md

## Project

`concretum-web-modern` — self-contained static site (Concretum Operis) plus a zero-dependency Node server, deployable to a VPS with `node server.js` behind an existing reverse proxy.

## Build & Run

```bash
npm start          # runs server.js
PORT=4000 node server.js   # override port (default 3000)
```

No build step — `public/` is final static output, produced upstream by the `website-crawler` project (crawl + de-reactify), not regenerated here.

## Structure

- `public/` — the static site (HTML per route, hashed assets, service worker)
- `server.js` — HTTP server (`node:http` only), resolves clean URLs to `<path>/index.html`, 404s unresolved paths, sets `Cache-Control: no-cache` on `sw.js`
- `package.json` — no runtime dependencies

## Conventions

- Do not hand-edit files under `public/` unless intentionally changing site content — they are crawler output, and manual edits diverge from the source
- Keep `server.js` dependency-free; if a real feature is needed beyond static serving, evaluate whether this project is still the right place for it before adding a framework
- This repo's git history predates the server/docs additions (it was cloned from the crawler's own git history to preserve the site's edit history)
