import { ref } from "vue";
import { defineStore } from "pinia";
import { createTask as createTaskRequest, deleteTask as deleteTaskRequest, getTasks, updateTask as updateTaskRequest, updateTaskStatus as updateTaskStatusRequest } from "../services/taskApi";
import type { CreateTaskInput, ReplaceTaskInput, Task, TaskStatus } from "../types/task";

export const useTaskStore = defineStore("tasks", () => {
  const getRequestError = (requestError: unknown): string => {
    if (requestError instanceof TypeError) return "ارتباط با سرور برقرار نشد. لطفاً اتصال Backend را بررسی کنید.";
    return requestError instanceof Error && requestError.message
      ? requestError.message
      : "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.";
  };
  // state
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const creating = ref(false);
  const createError = ref<string | null>(null);
  const updating = ref(false);
  const updateError = ref<string | null>(null);
  const deletingTaskId = ref<number | null>(null);
  const deleteError = ref<string | null>(null);
  const updatingStatusTaskIds = ref<number[]>([]);
  const statusUpdateError = ref<string | null>(null);
// action
  async function fetchTasks(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      tasks.value = await getTasks();
    } catch (requestError: unknown) {
      error.value = getRequestError(requestError);
    } finally {
      loading.value = false;
    }
  }

  async function createTask(input: CreateTaskInput): Promise<boolean> {
    creating.value = true;
    createError.value = null;
    try {
      const createdTask = await createTaskRequest(input);
      tasks.value.push(createdTask);
      return true;
    } catch (requestError: unknown) {
      createError.value = getRequestError(requestError);
      return false;
    } finally {
      creating.value = false;
    }
  }

  async function updateTask(id: number, input: ReplaceTaskInput): Promise<boolean> {
    if (updatingStatusTaskIds.value.includes(id)) return false;
    if (!tasks.value.some((task) => task.id === id)) {
      updateError.value = "این تسک دیگر در دسترس نیست.";
      return false;
    }
    updating.value = true;
    updateError.value = null;
    try {
      const updatedTask = await updateTaskRequest(id, input);
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index === -1) {
        updateError.value = "این تسک دیگر در دسترس نیست.";
        return false;
      }
      tasks.value[index] = updatedTask;
      return true;
    } catch (requestError: unknown) {
      updateError.value = getRequestError(requestError);
      return false;
    } finally {
      updating.value = false;
    }
  }

  async function deleteTask(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      deleteError.value = "شناسه تسک معتبر نیست.";
      return false;
    }
    if (deletingTaskId.value !== null || updatingStatusTaskIds.value.includes(id)) return false;
    if (!tasks.value.some((task) => task.id === id)) {
      deleteError.value = "این تسک دیگر در دسترس نیست.";
      return false;
    }

    deletingTaskId.value = id;
    deleteError.value = null;
    try {
      await deleteTaskRequest(id);
      tasks.value = tasks.value.filter((task) => task.id !== id);
      return true;
    } catch (requestError: unknown) {
      deleteError.value = getRequestError(requestError);
      return false;
    } finally {
      deletingTaskId.value = null;
    }
  }

  async function updateTaskStatus(id: number, status: TaskStatus, optimistic = false): Promise<boolean> {
    const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
    if (!Number.isInteger(id) || id <= 0) {
      statusUpdateError.value = "شناسه تسک معتبر نیست.";
      return false;
    }
    if (!validStatuses.includes(status)) {
      statusUpdateError.value = "وضعیت انتخاب‌شده معتبر نیست.";
      return false;
    }
    if (updatingStatusTaskIds.value.includes(id) || deletingTaskId.value === id) return false;
    const currentTask = tasks.value.find((task) => task.id === id);
    if (!currentTask) {
      statusUpdateError.value = "این تسک دیگر در دسترس نیست.";
      return false;
    }
    if (currentTask.status === status) return false;

    const previousTask: Task = { ...currentTask };
    updatingStatusTaskIds.value = [...updatingStatusTaskIds.value, id];
    statusUpdateError.value = null;
    if (optimistic) {
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index !== -1) tasks.value[index] = { ...currentTask, status };
    }
    try {
      const updatedTask = await updateTaskStatusRequest(id, { status });
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index === -1) {
        statusUpdateError.value = "این تسک دیگر در دسترس نیست.";
        return false;
      }
      tasks.value[index] = updatedTask;
      return true;
    } catch (requestError: unknown) {
      if (optimistic) {
        const index = tasks.value.findIndex((task) => task.id === id);
        if (index !== -1) tasks.value[index] = previousTask;
      }
      statusUpdateError.value = getRequestError(requestError);
      return false;
    } finally {
      updatingStatusTaskIds.value = updatingStatusTaskIds.value.filter((taskId) => taskId !== id);
    }
  }

  return {
    tasks, loading, error,
    creating, createError,
    updating, updateError,
    deletingTaskId, deleteError,
    updatingStatusTaskIds, statusUpdateError,
    fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus,
  };
});
