import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | undefined;

export function getDatabase(): NeonQueryFunction<false, false> {
  if (sql) return sql;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) {
    throw new Error("DATABASE_URL is required. Set it in backend/.env or the deployment environment.");
  }
  try {
    sql = neon(databaseUrl);
  } catch {
    // Driver configuration errors may contain the supplied connection string.
    throw new Error("DATABASE_URL is invalid. Check the database connection settings.");
  }
  return sql;
}

export type QueryParameter = string | number | boolean | null;

export async function query<Row extends object>(
  statement: string,
  parameters: QueryParameter[] = [],
): Promise<Row[]> {
  // The driver does not infer schema types; keep the assertion at this boundary.
  return await getDatabase().query(statement, parameters) as Row[];
}

export function safeErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error &&
      typeof error.code === "string" && /^[0-9A-Z]{5}$/.test(error.code)) {
    return error.code;
  }
  return "UNKNOWN";
}
