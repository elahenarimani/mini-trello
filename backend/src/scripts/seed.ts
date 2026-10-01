import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { Task } from "../types/task.js";
import { runDatabaseCommand } from "./database-command.js";
import { parseSeedTasks } from "./seed-data.js";

export async function seedTasks(sql: NeonQueryFunction<false, false>, tasks: Task[]): Promise<number> {
  if (tasks.length === 0) return 0;
  const results = await sql.transaction([
    // Serialize seed and API writes so inserts cannot race with sequence alignment.
    sql`LOCK TABLE tasks IN SHARE ROW EXCLUSIVE MODE`,
    sql`
      INSERT INTO tasks (id, title, description, status, priority, created_at)
      SELECT id, title, description, status, priority, "createdAt"
      FROM jsonb_to_recordset(${JSON.stringify(tasks)}::jsonb) AS seed(
        id bigint, title text, description text, status text, priority text, "createdAt" timestamptz
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `,
    // Never rewind a sequence already advanced by previous inserts/deletes.
    sql`
      SELECT setval(
        pg_get_serial_sequence('tasks', 'id'),
        GREATEST(
          COALESCE((SELECT MAX(id) FROM tasks), 1),
          COALESCE(pg_sequence_last_value(pg_get_serial_sequence('tasks', 'id')::regclass), 1)
        ),
        true
      )
    `,
  ]);
  return results[1].length;
}

if (require.main === module) {
  void runDatabaseCommand("Seed", async (sql) => {
    // This preserved file is read only by this explicit command, never by the API.
    const contents = await readFile(path.resolve(__dirname, "../../src/data/tasks.json"), "utf8");
    const tasks = parseSeedTasks(JSON.parse(contents) as unknown);
    const inserted = await seedTasks(sql, tasks);
    console.log(`Seed completed: ${inserted} inserted; ${tasks.length - inserted} existing ids skipped; ${tasks.length} source records.`);
  });
}
