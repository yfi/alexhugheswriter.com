# Alex Hughes — Portfolio

A static portfolio site built with [Astro](https://astro.build), with content managed by [Pages CMS](https://pagescms.org) — a git-based CMS that edits files directly in this repo.

## Pages

| Page            | Route               |
| --------------- | -------------------- |
| Homepage feed   | `/`                   |
| Project detail  | `/projects/:slug`     |
| About           | `/about`               |
| RSS             | `/rss.xml`             |
| 404             | fallback                |

## Infrastructure

- **Framework:** Astro (`output: "static"`)
- **Content:** Astro Content Collections reading YAML/Markdown files in `src/content/`
- **CMS:** Pages CMS (`.pages.yml`), edits committed via a GitHub App
- **Media:** committed image files under `public/media/`

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:4321 for the site. There is no local admin UI — content is edited directly in `src/content/` or through the hosted Pages CMS app once the GitHub App is installed on this repo (see `app.pagescms.org`).

## Deploying

```bash
npm run build
npm run deploy   # wrangler pages deploy dist
```

## See Also

- [AGENTS.md](./AGENTS.md) — architecture notes for coding agents (schema, key files, conventions)
- [Pages CMS documentation](https://pagescms.org/docs)
