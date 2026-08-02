This is an EmDash site -- a CMS built on Astro with a full admin UI.

## Commands

```bash
npx emdash dev        # Start dev server (runs migrations, seeds, generates types)
npx emdash types      # Regenerate TypeScript types from schema
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

## Key Files

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `astro.config.mjs`       | Astro config with `emdash()` integration, database, and storage                    |
| `src/live.config.ts`     | EmDash loader registration (boilerplate -- don't modify)                           |
| `seed/seed.json`         | Schema definition + demo content (collections, fields, taxonomies, menus, widgets) |
| `emdash-env.d.ts`        | Generated types for collections (auto-regenerated on dev server start)             |
| `src/layouts/Base.astro` | Base layout with EmDash wiring (menus, search, page contributions)                 |
| `src/pages/`             | Astro pages -- all server-rendered                                                 |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** -- Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** -- Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** -- CLI commands for content management, seeding, type generation, and visual editing flow.

## Documentation

The EmDash docs are available as an MCP server at `https://docs.emdashcms.com/mcp`. When you need to verify an API, hook, config option, field type, or pattern, call `search_docs` against the live documentation rather than relying on training-data recall. The docs reflect current behaviour; assumptions may not.

This template ships with `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` so Claude Code, Cursor, and VS Code auto-discover the docs server. Other tools (OpenCode, Windsurf, etc.) need a manual one-time setup -- see [docs.emdashcms.com/docs-mcp](https://docs.emdashcms.com/docs-mcp).

## Rules

- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- Always call `Astro.cache.set(cacheHint)` on pages that query content.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"category"` not `"categories"`).

## This Template

A portfolio for showcasing creative work. Editorial, near-monochrome, with photography as the main visual interest. Designed for designers, photographers, illustrators, studios, and other people whose work speaks for itself when laid out with generous whitespace.

The design is intentionally restrained. Don't pile on colour, gradients, or decoration -- the work is the decoration.

## Pages

| Page           | Path               | What it shows                                                                          |
| -------------- | ------------------ | ---------------------------------------------------------------------------------------|
| Home           | `/`                | Split hero ("Hi, I'm Alex Hughes." + bio), 3-column project grid                       |
| Project detail | `/projects/[slug]` | Year, huge uppercase title, excerpt, key-value details list, stacked images, next link |
| About          | `/about`           | Portrait + bio, F.A.Q, contact email (static page, not CMS-driven)                     |

## Schema

- `projects` collection: `title` (string), `thumbnail` (image), `images` (repeater with a single `image` sub-field -- the project gallery), `excerpt` (text), `year` (string), `details` (json -- flexible array of `{ key, value }` records rendered as the label/value list on the detail page).
- Single `primary` menu (Home, About).

Site settings have `title` and `tagline`; the title renders as the header wordmark.

The `images` repeater stores rows shaped `[{ image: <media value> }]`. Repeater rows are stored verbatim -- the content API does NOT expand bare media IDs inside them (unlike top-level image fields), so scripts must write full media objects (`{ provider, id, filename, mimeType, width, height, meta: { storageKey } }`). `scripts/push-content.mjs` handles this; the admin repeater widget does it natively. The `details` field stays a plain json field by design (arbitrary keys per project).

The runtime auto-seed applies schema/menus/settings only, never content entries. Push content to a running instance with `node scripts/push-content.mjs <url>` (idempotent by slug; needs `npx emdash login --url <url>` for non-localhost targets).

## Visual character

Typography is the design. The display face is **Playfair Display** (serif) on the `--font-heading` CSS variable; the body face is the system sans stack on `--font-body`. The serif is used for the site title, hero titles, project titles, page titles, and contact column labels. Everything else is the sans. Serif weight is calm on purpose (`--font-weight-heading` and `--font-weight-display` both default to 500).

The brand colour is barely visible by design -- the only saturated colour on the page should be inside images. The default `--color-brand` (`#7c3aed`) is used sparingly for link hover and focus states.

Whitespace is generous. Sections breathe. Don't fight that.

## Customisation

Design tokens live in `src/styles/tokens.css` with their default values. To restyle the site, override tokens in `src/styles/theme.css` -- declarations there are unlayered, so they always beat the `@layer base` defaults. Don't edit `tokens.css` or `Base.astro` for visual changes.

Colours are defined with `light-dark(<light>, <dark>)`, so each token carries both modes. Overriding with a plain colour changes light and dark at once; use `light-dark()` in the override to keep them distinct. There is no separate dark palette to maintain.

The display face is configured in `astro.config.mjs` under `fonts:` (the Astro Fonts API). To change it, swap the `name:` for any Google Fonts serif and keep `cssVariable: "--font-heading"`. Good pairings: Cormorant Garamond, Fraunces, EB Garamond, DM Serif Display. The body face (`--font-body`) is a plain token in `tokens.css` -- system sans, deliberately quiet; override it in `theme.css` only if you have a reason.

CSS variables worth knowing (see `tokens.css` for the full list):

- `--color-brand`, `--color-on-brand`, `--color-brand-ring` -- the single accent, used very sparingly
- `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border` -- neutral palette
- `--color-danger` -- form errors
- `--font-heading` (Fonts API entry in `astro.config.mjs`), `--font-body` (token)
- `--font-weight-heading` / `--font-weight-display` (both 500) -- raise for a heavier serif voice
- `--font-size-4xl` -- the size of the homepage title and project titles
- `--max-width` (720px), `--wide-width` (1200px) -- column widths

## What not to do

- Don't introduce gradients, drop shadows on cards, or coloured section backgrounds. The template's voice is calm and editorial; those break it.
- Don't change `--font-body` to a display font. Two display faces fight each other.
- Don't add more than one accent colour.
- Don't write generic copy like "Welcome to my portfolio" or "Crafting beautiful experiences". The work should speak; the words should be specific (a client name, a discipline, a year).
- Don't pack the home page with every project. The "Selected Work" framing is intentional -- 3-6 is plenty.
- Don't add a `gallery` of small thumbnails on the home page. Use one strong image per project; the gallery field renders on the project detail page only.
