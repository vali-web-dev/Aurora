import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/schema.ts',
  out: './src/lib/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/aurora',
  },
  verbose: true,
  strict: true,
} satisfies Config;
