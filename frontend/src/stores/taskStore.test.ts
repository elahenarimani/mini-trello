import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { CreateTaskInput, ReplaceTaskInput, Task, UpdateTaskStatusInput } from "../types/task";
import { cloneTaskFixtures } from "../tests/fixtures/tasks";

const apiMocks = vi.hoisted(() => ({
  getTasks: vi.fn<() => Promise<Task[]>>(),
  createTask: vi.fn<(input: CreateTaskInput) => Promise<Task>>(),
  updateTask: vi.fn<(id: number, input: ReplaceTaskInput) => Promise<Task>>(),
  deleteTask: vi.fn<(id: number) => Promise<void>>(),
  updateTaskStatus: vi.fn<(id: number, input: UpdateTaskStatusInput) => Promise<Task>>(),
}));

vi.mock("../services/taskApi", () => apiMocks);

import { useTaskStore } from "./taskStore";

describe("task store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it("fetches tasks and manages loading state", async () => {
    let resolveRequest: (tasks: Task[]) => void = () => undefined;
    apiMocks.getTasks.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    const store = useTaskStore();

    const request = store.fetchTasks();
    expect(store.loading).toBe(true);
    resolveRequest(cloneTaskFixtures());
    await request;

    expect(store.loading).toBe(false);
    expect(store.tasks).toHaveLength(4);
    expect(store.error).toBeNull();
  });

  it("keeps a readable error when fetching fails", async () => {
    apiMocks.getTasks.mockRejectedValue(new Error("دریافت تسک‌ها انجام نشد."));
    const store = useTaskStore();
    await store.fetchTasks();
    expect(store.tasks).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe("دریافت تسک‌ها انجام نشد.");
  });

  it("adds the task returned by the create API", async () => {
    const created = cloneTaskFixtures()[0];
    apiMocks.createTask.mockResolvedValue(created);
    const store = useTaskStore();
    const input: CreateTaskInput = { title: created.title, description: created.description, status: created.status, priority: created.priority };
    await expect(store.createTask(input)).resolves.toBe(true);
    expect(store.tasks).toEqual([created]);
    expect(store.creating).toBe(false);
  });

  it("replaces a task with the response from the update API", async () => {
    const store = useTaskStore();
    store.tasks = [cloneTaskFixtures()[0]];
    const updated: Task = { ...store.tasks[0], title: "Updated task" };
    apiMocks.updateTask.mockResolvedValue(updated);
    const input: ReplaceTaskInput = { title: updated.title, description: updated.description, status: updated.status, priority: updated.priority, createdAt: updated.createdAt };
    await expect(store.updateTask(updated.id, input)).resolves.toBe(true);
    expect(store.tasks[0]).toEqual(updated);
  });

  it("removes a task only after a successful delete", async () => {
    const store = useTaskStore();
    store.tasks = cloneTaskFixtures().slice(0, 2);
    apiMocks.deleteTask.mockResolvedValue(undefined);
    await expect(store.deleteTask(1)).resolves.toBe(true);
    expect(store.tasks.map((task) => task.id)).toEqual([2]);
    expect(store.deletingTaskId).toBeNull();
  });

  it("keeps a task when delete fails", async () => {
    const store = useTaskStore();
    store.tasks = [cloneTaskFixtures()[0]];
    apiMocks.deleteTask.mockRejectedValue(new Error("حذف تسک انجام نشد."));
    await expect(store.deleteTask(1)).resolves.toBe(false);
    expect(store.tasks).toHaveLength(1);
    expect(store.deleteError).toBe("حذف تسک انجام نشد.");
  });

  it("updates status using the complete task returned by the API", async () => {
    const store = useTaskStore();
    store.tasks = [cloneTaskFixtures()[0]];
    const updated: Task = { ...store.tasks[0], status: "done" };
    apiMocks.updateTaskStatus.mockResolvedValue(updated);
    await expect(store.updateTaskStatus(1, "done")).resolves.toBe(true);
    expect(store.tasks[0]).toEqual(updated);
    expect(apiMocks.updateTaskStatus).toHaveBeenCalledWith(1, { status: "done" });
  });

  it("rolls back only the changed task when an optimistic PATCH fails", async () => {
    const store = useTaskStore();
    store.tasks = cloneTaskFixtures().slice(0, 2);
    const originalFirst = { ...store.tasks[0] };
    const originalSecond = { ...store.tasks[1] };
    apiMocks.updateTaskStatus.mockRejectedValue(new Error("تغییر وضعیت تسک انجام نشد."));

    const request = store.updateTaskStatus(1, "done", true);
    expect(store.tasks[0].status).toBe("done");
    await expect(request).resolves.toBe(false);

    expect(store.tasks[0]).toEqual(originalFirst);
    expect(store.tasks[1]).toEqual(originalSecond);
    expect(store.statusUpdateError).toBe("تغییر وضعیت تسک انجام نشد.");
    expect(store.updatingStatusTaskIds).toEqual([]);
  });
});
