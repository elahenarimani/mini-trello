import type { CreateTaskInput } from "../types/task";

export type TaskFormField = keyof CreateTaskInput;
export type TaskValidationErrors = Partial<Record<TaskFormField, string>>;

const validStatuses = ["todo", "in_progress", "done"];
const validPriorities = ["low", "medium", "high"];

export function validateTaskField(field: TaskFormField, rawValue: string): string | undefined {
  if (field === "title" || field === "description") {
    const value = rawValue.trim();
    const maxLength = field === "title" ? 100 : 500;
    if (!value) return field === "title" ? "عنوان الزامی است." : "توضیحات الزامی است.";
    if (value.length < 3) return field === "title" ? "عنوان باید حداقل ۳ کاراکتر باشد." : "توضیحات باید حداقل ۳ کاراکتر باشد.";
    if (value.length > maxLength) return field === "title" ? "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد." : "توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.";
    return undefined;
  }
  if (field === "status") {
    return validStatuses.includes(rawValue) ? undefined : "لطفاً یک وضعیت معتبر انتخاب کنید.";
  }
  return validPriorities.includes(rawValue) ? undefined : "لطفاً یک اولویت معتبر انتخاب کنید.";
}

export function validateTaskInput(input: Record<TaskFormField, string>): TaskValidationErrors {
  const fields: TaskFormField[] = ["title", "description", "status", "priority"];
  return fields.reduce<TaskValidationErrors>((errors, field) => {
    const error = validateTaskField(field, input[field]);
    if (error) errors[field] = error;
    return errors;
  }, {});
}
