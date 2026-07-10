// Usage: set -a && source .env.local && set +a && node db/apply-schema.mjs [file.sql]
import { readFileSync } from 'node:fs';
import pg from 'pg';

const sql = readFileSync(process.argv[2] ?? 'db/schema.sql', 'utf8');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(sql);
const check = await client.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by 1"
);
console.log('Tables:', check.rows.map((r) => r.table_name).join(', '));
await client.end();
