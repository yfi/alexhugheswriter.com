/**
 * Pull live content from the production D1 into the local ./data.db, which is
 * what the static build (`npm run build:static`) reads.
 *
 * `wrangler d1 export` can't dump the whole DB (it refuses databases with FTS5
 * virtual tables), so this exports the content-bearing tables one at a time
 * (data only) and replaces the local rows. Media binaries stay in prod R2 and
 * are referenced by URL (see R2_PUBLIC_URL in .env), so they don't need syncing.
 *
 * Usage: npm run sync-content
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DB_NAME = "alexhugheswriter-db";
const LOCAL_DB = "data.db";

// Tables the site renders from. Order doesn't matter — each is replaced wholesale.
const TABLES = ["ec_projects", "_emdash_sections", "media", "options"];

function sh(cmd, args) {
	return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
}

for (const table of TABLES) {
	const out = join(tmpdir(), `sync-${table}.sql`);
	console.log(`↓ exporting ${table} from prod…`);
	sh("npx", [
		"wrangler", "d1", "export", DB_NAME,
		"--remote", "--table", table, "--no-schema", "--output", out,
	]);

	const inserts = readFileSync(out, "utf8");
	// Replace the whole table: clear local rows, then load prod's.
	const sql = `PRAGMA defer_foreign_keys=TRUE;\nDELETE FROM ${table};\n${inserts}`;
	execFileSync("sqlite3", [LOCAL_DB], { input: sql, encoding: "utf8", stdio: ["pipe", "inherit", "inherit"] });
	console.log(`✓ ${table} synced`);
}

console.log("\nDone. Run `npm run build:static` to rebuild the static site from fresh data.");
