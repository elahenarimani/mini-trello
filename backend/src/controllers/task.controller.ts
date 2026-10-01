import type { Request, Response } from "express";
import { createTask, deleteTask, getTaskById, getTasks, replaceTask, updateTask } from "../services/task.service.js";
import type { CreateTaskInput, ReplaceTaskInput, TaskPriority, TaskStatus, UpdateTaskInput } from "../types/task.js";
import { AppError } from "../middleware/errorHandler.js";

const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
const priorities: TaskPriority[] = ["low", "medium", "high"];
const editableFields = ["title", "description", "status", "priority"];
const replaceFields = [...editableFields, "createdAt"];

function parseId(value: string | string[]): number {
  if (Array.isArray(value)) throw new AppError(400, "Invalid task id");
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "Invalid task id");
  return id;
}

function assertObject(body: unknown): asserts body is Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "Request body must be an object");
  }
}

function validateInput(body: unknown, partial = false, requireAll = false): CreateTaskInput | ReplaceTaskInput | UpdateTaskInput {
  assertObject(body);
  const allowedFields = requireAll ? replaceFields : editableFields;
  const unknownField = Object.keys(body).find((key) => !allowedFields.includes(key));
  if (unknownField) throw new AppError(400, `Unknown field: ${unknownField}`);
  if (partial && Object.keys(body).length === 0) throw new AppError(400, "At least one field is required");
  if (requireAll) {
    const missingField = replaceFields.find((field) => body[field] === undefined);
    if (missingField) throw new AppError(400, `Missing required field: ${missingField}`);
  }
  if (!partial && (typeof body.title !== "string" || body.title.trim() === "")) {
    throw new AppError(400, "Title is required");
  }
  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim() === "")) {
    throw new AppError(400, "Title must not be empty");
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    throw new AppError(400, "Description must be a string");
  }
  if (body.status !== undefined && !statuses.includes(body.status as TaskStatus)) {
    throw new AppError(400, "Status must be todo, in_progress, or done");
  }
  if (body.priority !== undefined && !priorities.includes(body.priority as TaskPriority)) {
    throw new AppError(400, "Priority must be low, medium, or high");
  }
  if (
    body.createdAt !== undefined &&
    (typeof body.createdAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(body.createdAt) ||
      Number.isNaN(Date.parse(body.createdAt)))
  ) {
    throw new AppError(400, "CreatedAt must be a valid ISO 8601 date");
  }
  return body as CreateTaskInput | ReplaceTaskInput | UpdateTaskInput;
}

export async function getTasksController(_req: Request, res: Response): Promise<void> {
  res.status(200).json(await getTasks());
}

export async function getTaskController(req: Request, res: Response): Promise<void> {
  const task = await getTaskById(parseId(req.params.id));
  if (!task) throw new AppError(404, "Task not found");
  res.status(200).json(task);
}

export async function createTaskController(req: Request, res: Response): Promise<void> {
  const input = validateInput(req.body) as CreateTaskInput;
  res.status(201).json(await createTask(input));
}

export async function updateTaskController(req: Request, res: Response): Promise<void> {
  const input = validateInput(req.body, true) as UpdateTaskInput;
  const task = await updateTask(parseId(req.params.id), input);
  if (!task) throw new AppError(404, "Task not found");
  res.status(200).json(task);
}

export async function replaceTaskController(req: Request, res: Response): Promise<void> {
  const input = validateInput(req.body, false, true) as ReplaceTaskInput;
  const task = await replaceTask(parseId(req.params.id), input);
  if (!task) throw new AppError(404, "Task not found");
  res.status(200).json(task);
}

export async function deleteTaskController(req: Request, res: Response): Promise<void> {
  const deleted = await deleteTask(parseId(req.params.id));
  if (!deleted) throw new AppError(404, "Task not found");
  res.status(204).send();
}
