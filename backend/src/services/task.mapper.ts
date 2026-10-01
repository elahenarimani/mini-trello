import type { Task, TaskPriority, TaskStatus } from "../types/task.js";

export interface TaskRow {
  id: string | number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: Date | string;
}

export function mapTaskRow(row: TaskRow): Task {
  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Task id cannot be represented safely as a number.");
  }
  return {
    id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
