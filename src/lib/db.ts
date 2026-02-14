import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Single connection for serverless environments
let client: ReturnType<typeof postgres> | null = null;

function getClient() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    client = postgres(connectionString, {
      max: 1, // Minimize connections for serverless
      idle_timeout: 30,
      connect_timeout: 10,
      prepare: false, // Disable prepared statements for better serverless compatibility
    });
  }
  
  return client;
}

export const db = drizzle(getClient(), { schema });

// Health check function
export async function checkDbHealth(): Promise<boolean> {
  try {
    const client = getClient();
    const result = await client`SELECT 1`;
    return !!result;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Shutdown gracefully
export async function closeDb() {
  if (client) {
    await client.end({ timeout: 30 });
    client = null;
  }
}
