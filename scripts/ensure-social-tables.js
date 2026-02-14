const postgres = require('postgres');

(async () => {
  const sql = postgres(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS social_posts (
      id SERIAL PRIMARY KEY,
      author_user_id INTEGER NOT NULL REFERENCES users(id),
      universe VARCHAR(50) NOT NULL DEFAULT 'social',
      content TEXT NOT NULL,
      visibility VARCHAR(20) NOT NULL DEFAULT 'public',
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS social_reactions (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES social_posts(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      emoji VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS social_comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES social_posts(id),
      parent_comment_id INTEGER REFERENCES social_comments(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE social_comments
    ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES social_comments(id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS social_comment_reactions (
      id SERIAL PRIMARY KEY,
      comment_id INTEGER NOT NULL REFERENCES social_comments(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      emoji VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql.end();
  console.log('Ensured social tables exist.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
