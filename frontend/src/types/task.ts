export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type StatusFilter = "all" | TaskStatus;
export type PriorityFilter = "all" | TaskPriority;
export type SortOrder = "asc" | "desc";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface ReplaceTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}
