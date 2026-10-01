import { getDatabase, safeErrorCode } from "../config/database.js";
import type { NeonQueryFunction } from "@neondatabase/serverless";

export async function runDatabaseCommand(
  name: string,
  action: (sql: NeonQueryFunction<false, false>) => Promise<void>,
): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required. Set it in backend/.env before running database commands.");
    process.exitCode = 1;
    return;
  }
  try {
    const sql = getDatabase();
    // Verify connectivity before any schema or seed mutation.
    await sql`SELECT 1 AS connected`;
    console.log("Database connection verified.");
    await action(sql);
  } catch (error: unknown) {
    console.error(`${name} failed. Check DATABASE_URL, database permissions, and schema.`, {
      code: safeErrorCode(error),
    });
    process.exitCode = 1;
  }
}
