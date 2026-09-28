import { promises as fs } from "node:fs";
import path from "node:path";
import type { CreateTaskInput, ReplaceTaskInput, Task, UpdateTaskInput } from "../types/task.js";

const tasksFilePath = path.resolve(process.cwd(), "backend", "data", "tasks.json");
let writeQueue: Promise<void> = Promise.resolve();

async function readTasks(): Promise<Task[]> {
  const data = await fs.readFile(tasksFilePath, "utf-8");
  return JSON.parse(data) as Task[];
}

async function writeTasks(tasks: Task[]): Promise<void> {
  writeQueue = writeQueue.then(() => fs.writeFile(tasksFilePath, `${JSON.stringify(tasks, null, 2)}\n`, "utf-8"));
  return writeQueue;
}

export async function getTasks(): Promise<Task[]> {
  return readTasks();
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  return (await readTasks()).find((task) => task.id === id);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const tasks = await readTasks();
  const task: Task = {
    id: tasks.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    createdAt: new Date().toISOString(),
  };
  await writeTasks([...tasks, task]);
  return task;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task | undefined> {
  const tasks = await readTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return undefined;
  const updatedTask: Task = {
    ...tasks[index],
    ...input,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
  };
  tasks[index] = updatedTask;
  await writeTasks(tasks);
  return updatedTask;
}

export async function replaceTask(id: number, input: ReplaceTaskInput): Promise<Task | undefined> {
  const tasks = await readTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return undefined;
  const replacedTask: Task = {
    id: tasks[index].id,
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    priority: input.priority,
    createdAt: input.createdAt,
  };
  tasks[index] = replacedTask;
  await writeTasks(tasks);
  return replacedTask;
}

export async function deleteTask(id: number): Promise<boolean> {
  const tasks = await readTasks();
  const remainingTasks = tasks.filter((task) => task.id !== id);
  if (remainingTasks.length === tasks.length) return false;
  await writeTasks(remainingTasks);
  return true;
}
