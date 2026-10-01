import type { Task } from "../types/task.js";

export function parseSeedTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) throw new Error("Seed must contain a task array.");
  const ids = new Set<number>();
  return value.map((item: unknown) => {
    if (typeof item !== "object" || item === null) throw new Error("Invalid seed task.");
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "number" || !Number.isSafeInteger(row.id) || row.id <= 0 || ids.has(row.id) ||
        typeof row.title !== "string" || !row.title.trim() ||
        typeof row.description !== "string" ||
        (row.status !== "todo" && row.status !== "in_progress" && row.status !== "done") ||
        (row.priority !== "low" && row.priority !== "medium" && row.priority !== "high") ||
        typeof row.createdAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(row.createdAt) ||
        Number.isNaN(Date.parse(row.createdAt))) {
      throw new Error("Seed contains invalid fields or duplicate ids.");
    }
    ids.add(row.id);
    return {
      id: row.id, title: row.title, description: row.description,
      status: row.status, priority: row.priority, createdAt: row.createdAt,
    };
  });
}
