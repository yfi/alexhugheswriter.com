This is a static Astro portfolio site with content managed by [Pages CMS](https://pagescms.org) — a git-based CMS. Content lives as YAML/Markdown files in `src/content/`, edited either by hand or through the Pages CMS admin UI (which commits directly to this repo via a GitHub App).

## Commands

```bash
npm run dev        # Start the Astro dev server
npm run build       # Static build to dist/
npm run preview     # Preview the built site locally
npm run typecheck   # astro check
```

There is no local admin UI — content is edited by hand, or via the hosted Pages CMS app at `app.pagescms.org` once the GitHub App is installed on this repo.

## Key Files

| File                       | Purpose                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| `.pages.yml`                | Pages CMS config — defines collections/fields for the admin UI          |
| `astro.config.mjs`          | Astro config (`output: "static"`)                                       |
| `src/content.config.ts`     | Astro Content Collections definitions (schema for `projects`, `settings`, `sections`) |
| `src/content/projects/*.yaml` | One file per project (the `projects` collection)                      |
| `src/content/settings/site.yaml` | Site title/tagline                                                 |
| `src/content/sections/*.md` | Rich-text sections (`intro.md`, `footer.md`) rendered on the homepage   |
| `public/media/`             | Committed image files, referenced by content as `/media/<file>` paths  |
| `src/layouts/Base.astro`    | Layout for `/about`, `/404`, and project detail pages (nav + footer)   |
| `src/layouts/AppLayout.astro` | Layout for the homepage feed (floating header, no nav chrome)        |
| `src/components/SeoHead.astro` | Hand-rolled meta/OG/canonical tags (title/description/canonical/image props) |
| `src/pages/`                | Astro pages — all statically prerendered via `getStaticPaths()`        |

## Rules

- All pages are static (`output: "static"`). Project detail pages are prerendered via `getStaticPaths()` reading `getCollection("projects")` — there is no server-rendered/on-demand content path.
- Image fields are plain path strings (e.g. `/media/kraft-dinner-1.webp`), not objects — render with a plain `<img src={...} alt={...} />`. Alt text is a separate sibling field (`thumbnail_alt`, or `alt` alongside `image` in the `images`/gallery list) since Pages CMS image fields don't bundle alt text.
- `entry.id` is the filename-derived slug (used for URLs, e.g. `/projects/<id>`). There is no separate database ID — content collection entries only have `id` and `data`.
- Rich-text sections (`intro`, `footer`) are Markdown files with no frontmatter (`format: raw` in `.pages.yml`) — read them with `getEntry("sections", slug)` + `render(entry)` + `<Content />`.

## This Template

A portfolio for showcasing creative work. Editorial, near-monochrome, with photography as the main visual interest. Designed for designers, photographers, illustrators, studios, and other people whose work speaks for itself when laid out with generous whitespace.

The design is intentionally restrained. Don't pile on colour, gradients, or decoration -- the work is the decoration.

## Pages

| Page           | Path               | What it shows                                                                                      |
| -------------- | ------------------- | ----------------------------------------------------------------------------------------------------|
| Home           | `/`                 | Vertical feed of project cards (Instagram-style): image carousel on top, year/title/client meta row + details list below. Floating avatar/bio header, single centered column. |
| Project detail | `/projects/[slug]`  | Year, title, excerpt, key-value details list (multi-column on wide screens), stacked gallery images, next-project link |
| About          | `/about`           | Portrait + bio, F.A.Q, contact email (static page, not CMS-driven)                                  |

## Schema

- `projects` collection (`src/content/projects/*.yaml`, one file per project): `title` (string), `thumbnail` + `thumbnail_alt` (image path + alt text), `images` (list of `{ image, alt }` — the project gallery, also used as the homepage carousel slides), `excerpt` (text), `year` (string), `date` (used for feed/RSS ordering), `details` (flexible list of `{ key, value }` records — a `Client` entry, if present, is pulled out separately for the homepage's year/title/client meta row; everything else renders as the label/value list).
- `settings` (`src/content/settings/site.yaml`): single `site` entry with `title`/`tagline`. The title renders as the site name in the floating header and page nav.
- `sections` (`src/content/sections/*.md`): `intro` (homepage bio panel) and `footer` (homepage footer), both plain Markdown, no frontmatter.
- Primary nav (Home, About) is hardcoded in `Base.astro` — not CMS-managed, since it's two static links.

## Media

Images are committed files under `public/media/`, referenced by content as `/media/<filename>` path strings. `.pages.yml`'s `media.input`/`media.output` point Pages CMS's upload UI at this same folder, so new uploads through the admin land in the right place automatically.

## Visual character

Typography is the design. The display face is **Playfair Display** (serif) on the `--font-heading` CSS variable; the body face is the system sans stack on `--font-body`. The serif is used for the site title, hero titles, project titles, page titles, and contact column labels. Everything else is the sans. Serif weight is calm on purpose (`--font-weight-heading` and `--font-weight-display` both default to 500).

The brand colour is barely visible by design -- the only saturated colour on the page should be inside images. The default `--color-brand` (`#7c3aed`) is used sparingly for link hover and focus states.

Whitespace is generous. Sections breathe. Don't fight that.

## Customisation

Design tokens live in `src/styles/tokens.css` with their default values. To restyle the site, override tokens in `src/styles/theme.css` -- declarations there are unlayered, so they always beat the `@layer base` defaults. Don't edit `tokens.css` or `Base.astro`/`AppLayout.astro` for visual changes.

Colours are defined with `light-dark(<light>, <dark>)`, so each token carries both modes. Overriding with a plain colour changes light and dark at once; use `light-dark()` in the override to keep them distinct. There is no separate dark palette to maintain.

The display face is configured in `astro.config.mjs` under `fonts:` (the Astro Fonts API). To change it, swap the `name:` for any Google Fonts serif and keep `cssVariable: "--font-heading"`. Good pairings: Cormorant Garamond, Fraunces, EB Garamond, DM Serif Display. The body face (`--font-body`) is a plain token in `tokens.css` -- system sans, deliberately quiet; override it in `theme.css` only if you have a reason.

CSS variables worth knowing (see `tokens.css` for the full list):

- `--color-brand`, `--color-on-brand`, `--color-brand-ring` -- the single accent, used very sparingly
- `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border` -- neutral palette
- `--color-danger` -- form errors
- `--font-heading` (Fonts API entry in `astro.config.mjs`), `--font-body` (token)
- `--font-weight-heading` / `--font-weight-display` (both 500) -- raise for a heavier serif voice
- `--font-size-4xl` -- the size of the project detail title
- `--max-width` (720px), `--wide-width` (1200px) -- column widths

## What not to do

- Don't introduce gradients or coloured section backgrounds. The template's voice is calm and editorial; those break it.
- Don't change `--font-body` to a display font. Two display faces fight each other.
- Don't add more than one accent colour.
- Don't write generic copy like "Welcome to my portfolio" or "Crafting beautiful experiences". The work should speak; the words should be specific (a client name, a discipline, a year).
- Don't pack the home feed with more than a handful of projects unless that's genuinely the intent -- it's a continuous scroll, not a curated grid, so it can hold more than the old "Selected Work" framing, but still shouldn't be padded with filler.
