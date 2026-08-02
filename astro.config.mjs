import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { sqlite } from "emdash/db";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { local } from "emdash/astro";

// Two tracks off one codebase:
//
//   Preview / CMS (default): SSR on Cloudflare Workers with the admin UI. Reads
//   the live production D1/R2 via remote bindings (`"remote": true` in
//   wrangler.jsonc), so `astro dev` shows real production content.
//
//   Static production (PUBLIC_STATIC_BUILD=true): prerenders content to flat
//   HTML for Cloudflare Pages. Prerendering runs under the Node adapter (not
//   workerd) so EmDash's build-time queries behave like normal SSR, reading a
//   local data.db snapshot synced from production (see `npm run sync-content`).
const STATIC = process.env.PUBLIC_STATIC_BUILD === "true";

export default defineConfig({
	// Output stays "server" for both tracks: EmDash injects dynamic admin/API
	// routes that assume SSR, so `output: "static"` can't prerender the app.
	// The static track instead runs under the Node adapter and prerenders only
	// the pages marked `prerender` (gated by PUBLIC_STATIC_BUILD); EmDash's
	// server routes build into dist/server, which the static deploy discards.
	output: "server",
	adapter: STATIC ? node({ mode: "standalone" }) : cloudflare({ remoteBindings: true }),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: STATIC
				? sqlite({ url: "file:./data.db" })
				: d1({ binding: "DB" }),
			// The static track resolves media to absolute public R2 URLs
			// (R2_PUBLIC_URL/<key>) via the Node-safe local adapter, so the
			// prerendered pages need no Worker to serve images. The server track
			// uses the R2 binding directly.
			storage: STATIC
				? local({ baseUrl: process.env.R2_PUBLIC_URL ?? "" })
				: r2({ binding: "MEDIA", publicUrl: process.env.R2_PUBLIC_URL }),
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Archivo Black",
			cssVariable: "--font-heading",
			weights: [400],
			fallbacks: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
		},
	],
	devToolbar: { enabled: false },
});
