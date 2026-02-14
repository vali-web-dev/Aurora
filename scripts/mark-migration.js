const fs = require('fs');
const crypto = require('crypto');
const postgres = require('postgres');

(async () => {
  const sql = postgres(process.env.DATABASE_URL);
  const journal = JSON.parse(
    fs.readFileSync('src/lib/migrations/meta/_journal.json', 'utf8')
  );
  const entry = journal.entries[0];
  const sqlFile = fs.readFileSync(
    `src/lib/migrations/${entry.tag}.sql`,
    'utf8'
  );
  const hash = crypto.createHash('sha256').update(sqlFile).digest('hex');
  const createdAt = entry.when;

  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
  await sql`CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at numeric
  )`;

  const existing = await sql`
    SELECT id FROM "drizzle"."__drizzle_migrations" WHERE hash = ${hash} LIMIT 1
  `;

  if (existing.length === 0) {
    await sql`
      INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
      VALUES (${hash}, ${createdAt})
    `;
  }

  await sql.end();
  console.log(`Marked migration ${entry.tag}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
