// lib/db/client.ts
// Real Postgres access (Neon serverless) for the Ensayo demo. The schema is
// isolated under the "ensayo" Postgres schema so sibling projects can share
// the same database without table collisions.

import { neon } from "@neondatabase/serverless";

export const DB_SCHEMA = "ensayo";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
