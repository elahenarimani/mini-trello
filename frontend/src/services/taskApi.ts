import type { CreateTaskInput, ReplaceTaskInput, Task, UpdateTaskStatusInput } from "../types/task";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

async function getResponseError(response: Response, fallback: string): Promise<Error> {
  await response.json().catch(() => null);
  if (response.status === 400) return new Error("اطلاعات ارسال‌شده معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.");
  if (response.status === 404) return new Error("تسک موردنظر پیدا نشد.");
  if (response.status >= 500) return new Error("خطایی در سرور رخ داد. لطفاً دوباره تلاش کنید.");
  return new Error(`${fallback} (کد ${response.status})`);
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${apiBaseUrl}/api/tasks`);
  if (!response.ok) throw await getResponseError(response, "دریافت تسک‌ها انجام نشد.");
  return response.json() as Promise<Task[]>;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(`${apiBaseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getResponseError(response, "ایجاد تسک انجام نشد.");
  }

  return response.json() as Promise<Task>;
}

export async function updateTask(id: number, input: ReplaceTaskInput): Promise<Task> {
  const response = await fetch(`${apiBaseUrl}/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await getResponseError(response, "ویرایش تسک انجام نشد.");
  }
  return response.json() as Promise<Task>;
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/tasks/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw await getResponseError(response, "حذف تسک انجام نشد.");
  }
}

export async function updateTaskStatus(id: number, input: UpdateTaskStatusInput): Promise<Task> {
  const response = await fetch(`${apiBaseUrl}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await getResponseError(response, "تغییر وضعیت تسک انجام نشد.");
  }
  return response.json() as Promise<Task>;
}
