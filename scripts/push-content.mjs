/**
 * Push every content entry from seed/seed.json to a running EmDash instance.
 *
 * The runtime auto-seed only applies schema/menus/settings — never content
 * entries (applySeed defaults to includeContent: false). This script fills
 * that gap for remote deployments where `npx emdash seed` (local-only, works
 * on a SQLite file) can't reach the database.
 *
 * Usage:
 *   node scripts/push-content.mjs http://localhost:4642
 *   node scripts/push-content.mjs https://alexhugheswriter.<subdomain>.workers.dev
 *
 * Remote targets need auth first: `npx emdash login --url <target>`.
 * Existing slugs are skipped, so the script is safe to re-run.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const target = process.argv[2];
if (!target) {
	console.error("Usage: node scripts/push-content.mjs <emdash-url>");
	process.exit(1);
}

const seed = JSON.parse(readFileSync("seed/seed.json", "utf8"));
const tmp = mkdtempSync(join(tmpdir(), "emdash-push-"));

function cli(args, opts = {}) {
	return execFileSync("npx", ["emdash", ...args, "--url", target, "--json"], {
		encoding: "utf8",
		...opts,
	});
}

// Returns a full media value object (the shape image fields store).
// Repeater rows are stored verbatim — bare media IDs are not expanded
// there, so every image reference gets the explicit object form.
async function uploadMedia(media) {
	const file = join(tmp, media.filename);
	const res = await fetch(media.url);
	if (!res.ok) throw new Error(`Download failed (${res.status}): ${media.url}`);
	writeFileSync(file, Buffer.from(await res.arrayBuffer()));
	const u = JSON.parse(cli(["media", "upload", file, "--alt", media.alt ?? ""]));
	console.log(`uploaded ${media.filename} -> ${u.id}`);
	return {
		provider: "local",
		id: u.id,
		alt: media.alt ?? "",
		filename: u.filename,
		mimeType: u.mimeType,
		width: u.width,
		height: u.height,
		meta: { storageKey: u.storageKey },
	};
}

// Recursively replace every { $media: {...} } reference with an uploaded
// media value, wherever it sits (top-level fields, repeater rows, json).
async function resolveMedia(value) {
	if (Array.isArray(value)) {
		const out = [];
		for (const item of value) out.push(await resolveMedia(item));
		return out;
	}
	if (value && typeof value === "object") {
		if (value.$media) return uploadMedia(value.$media);
		const out = {};
		for (const [k, v] of Object.entries(value)) out[k] = await resolveMedia(v);
		return out;
	}
	return value;
}

for (const [collection, entries] of Object.entries(seed.content ?? {})) {
	const existing = new Set(
		JSON.parse(cli(["content", "list", collection, "--limit", "100"])).items.map(
			(i) => i.slug,
		),
	);

	for (const entry of entries) {
		if (existing.has(entry.slug)) {
			console.log(`skip ${collection}/${entry.slug} (already exists)`);
			continue;
		}

		const data = await resolveMedia(entry.data);
		const createArgs = [
			"content",
			"create",
			collection,
			"--slug",
			entry.slug,
			"--data",
			JSON.stringify(data),
		];
		if (entry.status === "draft") createArgs.push("--draft");
		cli(createArgs);
		console.log(`created ${collection}/${entry.slug}${entry.status === "draft" ? " (draft)" : ""}`);
	}
}

console.log("done");
