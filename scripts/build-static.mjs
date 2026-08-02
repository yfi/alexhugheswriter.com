/**
 * Static production build.
 *
 * Astro detects `export const prerender` with a literal-only regex, so the
 * value can't be toggled by an env var. This script flips the content routes
 * to `prerender = true`, runs the build with PUBLIC_STATIC_BUILD=true (which
 * switches astro.config to the Node adapter + local SQLite + public-URL media),
 * then restores the sources — even if the build fails.
 *
 * Output: dist/client/ (flat HTML + assets) — deploy that to Cloudflare Pages.
 * The Node server in dist/server/ (EmDash's SSR admin routes) is discarded.
 *
 * Needs R2_PUBLIC_URL set (in .env or the environment) so prerendered pages
 * reference media at https://<r2-public-host>/<key>.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Load .env into process.env so astro.config sees R2_PUBLIC_URL (used as the
// media base URL for the static track). Astro loads .env for import.meta.env
// but not for process.env reads inside the config, so do it here.
try {
	for (const line of readFileSync(".env", "utf8").split("\n")) {
		const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
		if (m && !process.env[m[1]]) {
			process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
		}
	}
} catch {
	/* no .env — fine */
}

// Every route that should become static HTML.
const PAGES = [
	"src/pages/index.astro",
	"src/pages/about.astro",
	"src/pages/404.astro",
	"src/pages/[slug].astro",
	"src/pages/projects/[slug].astro",
	"src/pages/rss.xml.ts",
];

const FROM = "export const prerender = false;";
const TO = "export const prerender = true;";

if (!process.env.R2_PUBLIC_URL) {
	console.warn(
		"⚠ R2_PUBLIC_URL is not set — prerendered images will have an empty base URL.\n" +
			"  Set it (in .env) to your public R2 URL, e.g. https://pub-xxxx.r2.dev\n",
	);
}

const originals = new Map();
for (const path of PAGES) originals.set(path, readFileSync(path, "utf8"));

try {
	for (const [path, src] of originals) {
		if (!src.includes(FROM)) {
			throw new Error(`Expected "${FROM}" in ${path} — did the file change?`);
		}
		writeFileSync(path, src.replace(FROM, TO));
	}

	execSync("astro build", {
		stdio: "inherit",
		env: { ...process.env, PUBLIC_STATIC_BUILD: "true" },
	});
} finally {
	// Always restore the sources so the working tree is left unchanged.
	for (const [path, src] of originals) writeFileSync(path, src);
}

console.log("\n✓ Static site built to dist/client/");
