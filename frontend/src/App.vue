<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import AppHeader from "./components/layout/AppHeader.vue";
import BoardToolbar from "./components/board/BoardToolbar.vue";
import KanbanBoard from "./components/board/KanbanBoard.vue";
import LoadingSkeleton from "./components/shared/LoadingSkeleton.vue";
import ErrorState from "./components/shared/ErrorState.vue";
import EmptyState from "./components/shared/EmptyState.vue";
import AddTaskModal from "./components/tasks/AddTaskModal.vue";
import EditTaskModal from "./components/tasks/EditTaskModal.vue";
import DeleteTaskModal from "./components/tasks/DeleteTaskModal.vue";
import { useTaskStore } from "./stores/taskStore";
import type { PriorityFilter, SortOrder, StatusFilter, Task, TaskStatus } from "./types/task";
import { filterAndSortTasks } from "./utils/taskFilters";

const taskStore = useTaskStore();
const { tasks, loading, error, deletingTaskId, updatingStatusTaskIds, statusUpdateError } = storeToRefs(taskStore);
const darkMode = ref(false);
const statusFilter = ref<StatusFilter>("all");
const priorityFilter = ref<PriorityFilter>("all");
const sortOrder = ref<SortOrder>("desc");
const showAddTaskModal = ref(false);
const selectedTask = ref<Task | null>(null);
const taskToDelete = ref<Task | null>(null);
let deleteTrigger: HTMLButtonElement | null = null;
const successMessage = ref("");
const feedbackIsError = ref(false);
let successTimer: ReturnType<typeof setTimeout> | undefined;

const visibleTasks = computed(() =>
  filterAndSortTasks(tasks.value, statusFilter.value, priorityFilter.value, sortOrder.value)
);

function clearFilters(): void {
  statusFilter.value = "all";
  priorityFilter.value = "all";
  sortOrder.value = "desc";
}

function showSuccess(message: string): void {
  feedbackIsError.value = false;
  successMessage.value = message;
  if (successTimer) clearTimeout(successTimer);
  successTimer = setTimeout(() => { successMessage.value = ""; }, 3000);
}

function showError(message: string): void {
  feedbackIsError.value = true;
  successMessage.value = message;
  if (successTimer) clearTimeout(successTimer);
  successTimer = setTimeout(() => { successMessage.value = ""; }, 4000);
}

async function handleStatusChange(payload: { taskId: number; newStatus: TaskStatus; optimistic?: boolean }): Promise<void> {
  const updated = await taskStore.updateTaskStatus(payload.taskId, payload.newStatus, payload.optimistic);
  if (updated) showSuccess(payload.optimistic ? "تسک با موفقیت جابه‌جا شد." : "وضعیت تسک با موفقیت تغییر کرد.");
  else if (statusUpdateError.value) showError(statusUpdateError.value);
}

function openDeleteModal(payload: { task: Task; trigger: HTMLButtonElement | null }): void {
  selectedTask.value = null;
  taskToDelete.value = payload.task;
  deleteTrigger = payload.trigger;
}

function closeDeleteModal(): void {
  taskToDelete.value = null;
  void nextTick(() => {
    const focusTarget = deleteTrigger?.isConnected
      ? deleteTrigger
      : document.querySelector<HTMLButtonElement>(".add-task-button");
    focusTarget?.focus();
    deleteTrigger = null;
  });
}

onMounted(() => void taskStore.fetchTasks());
</script>

<template>
  <div class="app" :data-theme="darkMode ? 'dark' : 'light'">
    <AppHeader
      :dark-mode="darkMode"
      @toggle-theme="darkMode = !darkMode"
      @add-task="showAddTaskModal = true"
    />

    <main class="workspace">
      <BoardToolbar
        :total="tasks.length"
        :visible="visibleTasks.length"
        :status-filter="statusFilter"
        :priority-filter="priorityFilter"
        :sort-order="sortOrder"
        @update-status-filter="statusFilter = $event"
        @update-priority-filter="priorityFilter = $event"
        @update-sort-order="sortOrder = $event"
        @clear="clearFilters"
      />
      <LoadingSkeleton v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="taskStore.fetchTasks" />
      <EmptyState
        v-else-if="tasks.length === 0"
        title="هنوز تسکی وجود ندارد"
        message="برای شروع، اولین تسک خود را ایجاد کنید."
      />
      <EmptyState
        v-else-if="visibleTasks.length === 0"
        title="تسکی مطابق فیلترهای انتخاب‌شده پیدا نشد"
        message="ترکیب دیگری را انتخاب کنید یا فیلترها را پاک کنید."
        action-label="پاک‌کردن فیلترها"
        @action="clearFilters"
      />
      <KanbanBoard
        v-else
        :tasks="visibleTasks"
        :status-filter="statusFilter"
        :updating-status-task-ids="updatingStatusTaskIds"
        :editing-task-id="selectedTask?.id ?? null"
        :deleting-task-id="deletingTaskId"
        @edit="selectedTask = $event"
        @delete="openDeleteModal"
        @status-change="handleStatusChange"
      />
    </main>

    <AddTaskModal
      v-if="showAddTaskModal"
      @close="showAddTaskModal = false"
      @created="showSuccess('تسک با موفقیت ایجاد شد.')"
    />
    <EditTaskModal
      v-if="selectedTask"
      :task="selectedTask"
      @close="selectedTask = null"
      @updated="showSuccess('تسک با موفقیت ویرایش شد.')"
    />
    <DeleteTaskModal
      v-if="taskToDelete"
      :task="taskToDelete"
      @close="closeDeleteModal"
      @deleted="showSuccess('تسک با موفقیت حذف شد.')"
    />
    <p v-if="successMessage" class="toast" :class="{ 'toast-error': feedbackIsError }" :role="feedbackIsError ? 'alert' : 'status'">{{ successMessage }}</p>
  </div>
</template>

<style scoped src="./App.css"></style>
