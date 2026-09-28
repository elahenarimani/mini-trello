import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
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

import App from "../App.vue";
import AddTaskModal from "./tasks/AddTaskModal.vue";
import DeleteTaskModal from "./tasks/DeleteTaskModal.vue";
import ErrorState from "./shared/ErrorState.vue";
import LoadingSkeleton from "./shared/LoadingSkeleton.vue";
import TaskCard from "./board/TaskCard.vue";

const mountApp = () => mount(App, { global: { plugins: [createPinia()] } });

describe("important component behavior", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    apiMocks.getTasks.mockResolvedValue([]);
  });

  it("shows loading while tasks are being fetched", async () => {
    apiMocks.getTasks.mockReturnValue(new Promise(() => undefined));
    const wrapper = mountApp();
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(LoadingSkeleton).exists()).toBe(true);
  });

  it("shows an error and retries loading", async () => {
    apiMocks.getTasks.mockRejectedValueOnce(new Error("دریافت تسک‌ها انجام نشد."));
    const wrapper = mountApp();
    await flushPromises();
    expect(wrapper.findComponent(ErrorState).exists()).toBe(true);

    apiMocks.getTasks.mockResolvedValueOnce([]);
    await wrapper.findComponent(ErrorState).get("button").trigger("click");
    await flushPromises();
    expect(apiMocks.getTasks).toHaveBeenCalledTimes(2);
  });

  it("shows the empty state when the API returns no tasks", async () => {
    const wrapper = mountApp();
    await flushPromises();
    expect(wrapper.text()).toContain("هنوز تسکی وجود ندارد");
  });

  it("opens the add task modal from the header", async () => {
    const wrapper = mountApp();
    await flushPromises();
    await wrapper.get(".add-task-button").trigger("click");
    expect(wrapper.findComponent(AddTaskModal).exists()).toBe(true);
  });

  it("does not submit an invalid add task form", async () => {
    const wrapper = mountApp();
    await flushPromises();
    await wrapper.get(".add-task-button").trigger("click");
    await wrapper.findComponent(AddTaskModal).get("form").trigger("submit");
    expect(apiMocks.createTask).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("عنوان الزامی است.");
  });

  it("emits a typed status change from a task card", async () => {
    const task = cloneTaskFixtures()[0];
    const wrapper = mount(TaskCard, {
      props: { task, menuOpen: false, statusUpdating: false, statusDisabled: false, dragEnabled: true, dragging: false },
    });
    await wrapper.get("select").setValue("done");
    expect(wrapper.emitted("statusChange")?.[0]).toEqual([{ taskId: task.id, newStatus: "done" }]);
  });

  it("opens the delete confirmation modal from a task menu", async () => {
    apiMocks.getTasks.mockResolvedValue([cloneTaskFixtures()[0]]);
    const wrapper = mountApp();
    await flushPromises();
    await wrapper.get(".more-button").trigger("click");
    const deleteButton = wrapper.findAll(".card-menu-popover button").find((button) => button.text() === "حذف تسک");
    expect(deleteButton).toBeDefined();
    await deleteButton?.trigger("click");
    expect(wrapper.findComponent(DeleteTaskModal).exists()).toBe(true);
  });
});
