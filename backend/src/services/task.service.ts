import { query } from "../config/database.js";
import type { CreateTaskInput, ReplaceTaskInput, Task, UpdateTaskInput } from "../types/task.js";
import { mapTaskRow, type TaskRow } from "./task.mapper.js";

export async function getTasks(): Promise<Task[]> {
  const rows = await query<TaskRow>(`
    SELECT id, title, description, status, priority, created_at
    FROM tasks ORDER BY id ASC
  `);
  return rows.map(mapTaskRow);
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  if (!Number.isSafeInteger(id)) return undefined;
  const [row] = await query<TaskRow>(`
    SELECT id, title, description, status, priority, created_at
    FROM tasks WHERE id = $1
  `, [id]);
  return row ? mapTaskRow(row) : undefined;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const [row] = await query<TaskRow>(`
    INSERT INTO tasks (title, description, status, priority)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, status, priority, created_at
  `, [input.title.trim(), input.description?.trim() ?? "", input.status ?? "todo", input.priority ?? "medium"]);
  if (!row) throw new Error("Task insert returned no row.");
  return mapTaskRow(row);
}

export async function replaceTask(id: number, input: ReplaceTaskInput): Promise<Task | undefined> {
  if (!Number.isSafeInteger(id)) return undefined;
  // createdAt is still validated by the controller, but the stored timestamp is immutable.
  const [row] = await query<TaskRow>(`
    UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4
    WHERE id = $5
    RETURNING id, title, description, status, priority, created_at
  `, [input.title.trim(), input.description.trim(), input.status, input.priority, id]);
  return row ? mapTaskRow(row) : undefined;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task | undefined> {
  if (!Number.isSafeInteger(id)) return undefined;
  // Validation rejects null; null parameters represent omitted fields only.
  // One atomic UPDATE preserves unrelated fields, including concurrent changes.
  const [row] = await query<TaskRow>(`
    UPDATE tasks SET
      title = COALESCE($1::text, title),
      description = COALESCE($2::text, description),
      status = COALESCE($3::text, status),
      priority = COALESCE($4::text, priority)
    WHERE id = $5
    RETURNING id, title, description, status, priority, created_at
  `, [input.title?.trim() ?? null, input.description?.trim() ?? null, input.status ?? null, input.priority ?? null, id]);
  return row ? mapTaskRow(row) : undefined;
}

export async function deleteTask(id: number): Promise<boolean> {
  if (!Number.isSafeInteger(id)) return false;
  const rows = await query<{ id: string | number }>(
    "DELETE FROM tasks WHERE id = $1 RETURNING id", [id],
  );
  return rows.length > 0;
}
