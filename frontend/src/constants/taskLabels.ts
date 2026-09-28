import type { TaskPriority, TaskStatus } from "../types/task";

export const statusLabels: Record<TaskStatus, string> = {
  todo: "برای انجام",
  in_progress: "در حال انجام",
  done: "انجام‌شده",
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
};

export const formatPersianNumber = (value: number): string =>
  new Intl.NumberFormat("fa-IR").format(value);
