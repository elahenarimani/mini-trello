import type { Task } from "../../types/task";

export const taskFixtures: Task[] = [
  { id: 1, title: "Task one", description: "First task", status: "todo", priority: "high", createdAt: "2026-01-01T10:00:00.000Z" },
  { id: 2, title: "Task two", description: "Second task", status: "in_progress", priority: "medium", createdAt: "2026-03-01T10:00:00.000Z" },
  { id: 3, title: "Task three", description: "Third task", status: "done", priority: "high", createdAt: "2026-02-01T10:00:00.000Z" },
  { id: 4, title: "Task four", description: "Invalid date task", status: "todo", priority: "low", createdAt: "not-a-date" },
];

export const cloneTaskFixtures = (): Task[] => taskFixtures.map((task) => ({ ...task }));
