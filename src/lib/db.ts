import { neon } from '@neondatabase/serverless';

// Vercel Postgres usually provides POSTGRES_URL, whereas standard Neon provides DATABASE_URL
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("Neon Database URL is missing. Database operations will fail.");
}

export const sql = neon(dbUrl || "postgres://dummy:dummy@dummy.com/dummy");
