<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import KanbanColumn from "./KanbanColumn.vue";
import type { StatusFilter, Task, TaskStatus } from "../../types/task";
import { statusLabels } from "../../constants/taskLabels";

const props = defineProps<{
  tasks: Task[];
  updatingStatusTaskIds: number[];
  editingTaskId: number | null;
  deletingTaskId: number | null;
  statusFilter: StatusFilter;
}>();
const emit = defineEmits<{
  edit: [task: Task];
  delete: [payload: { task: Task; trigger: HTMLButtonElement | null }];
  statusChange: [payload: { taskId: number; newStatus: TaskStatus; optimistic?: boolean }];
}>();
const openMenuTaskId = ref<number | null>(null);
const draggedTaskId = ref<number | null>(null);
const sourceStatus = ref<TaskStatus | null>(null);
const activeDropStatus = ref<TaskStatus | null>(null);
const dragEnabled = computed(() => props.statusFilter === "all");

function clearDragState(): void {
  draggedTaskId.value = null;
  sourceStatus.value = null;
  activeDropStatus.value = null;
}

function startDrag(payload: { taskId: number; sourceStatus: TaskStatus; event: DragEvent }): void {
  if (!dragEnabled.value || props.updatingStatusTaskIds.includes(payload.taskId)) {
    payload.event.preventDefault();
    return;
  }
  openMenuTaskId.value = null;
  draggedTaskId.value = payload.taskId;
  sourceStatus.value = payload.sourceStatus;
  payload.event.dataTransfer?.setData("text/plain", String(payload.taskId));
  if (payload.event.dataTransfer) payload.event.dataTransfer.effectAllowed = "move";
}

function enterColumn(status: TaskStatus): void {
  if (draggedTaskId.value !== null && status !== sourceStatus.value) activeDropStatus.value = status;
}

function leaveColumn(status: TaskStatus): void {
  if (activeDropStatus.value === status) activeDropStatus.value = null;
}

function dropTask(status: TaskStatus): void {
  const taskId = draggedTaskId.value;
  const previousStatus = sourceStatus.value;
  clearDragState();
  if (taskId === null || previousStatus === null || previousStatus === status) return;
  const task = props.tasks.find((item) => item.id === taskId);
  if (!task || task.status !== previousStatus || props.updatingStatusTaskIds.includes(taskId)) return;
  emit("statusChange", { taskId, newStatus: status, optimistic: true });
}

function toggleMenu(taskId: number): void {
  openMenuTaskId.value = openMenuTaskId.value === taskId ? null : taskId;
}

function editTask(task: Task): void {
  openMenuTaskId.value = null;
  emit("edit", task);
}

function deleteTask(payload: { task: Task; trigger: HTMLButtonElement | null }): void {
  openMenuTaskId.value = null;
  emit("delete", payload);
}

function closeMenu(): void { openMenuTaskId.value = null; }
onMounted(() => document.addEventListener("click", closeMenu));
onUnmounted(() => document.removeEventListener("click", closeMenu));

const columns: Array<{ status: TaskStatus; title: string }> = [
  { status: "todo", title: statusLabels.todo },
  { status: "in_progress", title: statusLabels.in_progress },
  { status: "done", title: statusLabels.done },
];

const visibleColumns = computed(() =>
  props.statusFilter === "all"
    ? columns
    : columns.filter((column) => column.status === props.statusFilter)
);

const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
  todo: props.tasks.filter((task) => task.status === "todo"),
  in_progress: props.tasks.filter((task) => task.status === "in_progress"),
  done: props.tasks.filter((task) => task.status === "done"),
}));
</script>

<template>
  <section class="kanban-board" :class="{ 'single-column': statusFilter !== 'all' }" aria-label="برد مدیریت تسک‌ها">
    <KanbanColumn
      v-for="column in visibleColumns"
      :key="column.status"
      :title="column.title"
      :status="column.status"
      :tasks="tasksByStatus[column.status]"
      :open-menu-task-id="openMenuTaskId"
      :updating-status-task-ids="updatingStatusTaskIds"
      :editing-task-id="editingTaskId"
      :deleting-task-id="deletingTaskId"
      :drag-enabled="dragEnabled"
      :dragged-task-id="draggedTaskId"
      :active-drop-status="activeDropStatus"
      @toggle-menu="toggleMenu"
      @edit="editTask"
      @delete="deleteTask"
      @status-change="$emit('statusChange', $event)"
      @drag-start="startDrag"
      @drag-end="clearDragState"
      @drag-enter="enterColumn"
      @drag-leave="leaveColumn"
      @drop-task="dropTask"
    />
  </section>
</template>

<style scoped src="./KanbanBoard.css"></style>
