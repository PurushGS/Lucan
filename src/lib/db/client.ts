import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  throw new Error("Missing Turso configuration. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
}

export const db = createClient({
  url: databaseUrl,
  authToken,
});
