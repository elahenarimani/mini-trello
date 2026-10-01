import { readFile } from "node:fs/promises";
import path from "node:path";
import { runDatabaseCommand } from "./database-command.js";

if (require.main === module) {
  void runDatabaseCommand("Migration", async (sql) => {
    const schema = await readFile(path.resolve(__dirname, "../../database/schema.sql"), "utf8");
    // Trusted, versioned SQL only; no user values or connection strings in this file.
    await sql.query(schema);
    console.log("Schema migration completed.");
  });
}
