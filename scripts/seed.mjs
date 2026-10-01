// scripts/seed.mjs
// Creates the ensayo schema + table and seeds the two committed experiments
// (exp-1: advance, exp-2: hold) so the history is non-empty on first load.
// Values are computed from the committed judge scores with the real Welch test.
// Run: node scripts/seed.mjs  (requires DATABASE_URL in env or .env.local)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

// [delta, p_value, ci_low, ci_high, decision]
const EXPERIMENTS = [
  [0.10916666666666675, 6.564924159846441e-10, 0.08094255014656027, 0.13739078318677322, "advance"],
  [0.01416666666666666, 0.29341372417213973, -0.012685326287176685, 0.041018659620510003, "hold"],
];

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS ensayo`;
  await sql`DROP TABLE IF EXISTS ensayo.experiments`;

  await sql`
    CREATE TABLE ensayo.experiments (
      id serial PRIMARY KEY,
      delta numeric NOT NULL,
      p_value numeric NOT NULL,
      ci_low numeric NOT NULL,
      ci_high numeric NOT NULL,
      decision text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  for (const [delta, pValue, ciLow, ciHigh, decision] of EXPERIMENTS) {
    await sql`INSERT INTO ensayo.experiments (delta, p_value, ci_low, ci_high, decision) VALUES (${delta}, ${pValue}, ${ciLow}, ${ciHigh}, ${decision})`;
  }

  const [{ c }] = await sql`SELECT count(*)::int AS c FROM ensayo.experiments`;
  console.log(`Seeded ensayo schema: ${c} experiments`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
