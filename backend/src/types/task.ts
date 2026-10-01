export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

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
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "priority">
>;

export type ReplaceTaskInput = Pick<
  Task,
  "title" | "description" | "status" | "priority" | "createdAt"
>;
