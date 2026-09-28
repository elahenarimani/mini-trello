<script setup lang="ts">
import TaskCard from "./TaskCard.vue";
import EmptyState from "../shared/EmptyState.vue";
import type { Task, TaskStatus } from "../../types/task";
import { formatPersianNumber } from "../../constants/taskLabels";

const props = defineProps<{
  title: string;
  status: TaskStatus;
  tasks: Task[];
  openMenuTaskId: number | null;
  updatingStatusTaskIds: number[];
  editingTaskId: number | null;
  deletingTaskId: number | null;
  dragEnabled: boolean;
  draggedTaskId: number | null;
  activeDropStatus: TaskStatus | null;
}>();
const emit = defineEmits<{
  toggleMenu: [taskId: number];
  edit: [task: Task];
  delete: [payload: { task: Task; trigger: HTMLButtonElement | null }];
  statusChange: [payload: { taskId: number; newStatus: TaskStatus }];
  dragStart: [payload: { taskId: number; sourceStatus: TaskStatus; event: DragEvent }];
  dragEnd: [];
  dragEnter: [status: TaskStatus];
  dragLeave: [status: TaskStatus];
  dropTask: [status: TaskStatus];
}>();

function handleDragOver(event: DragEvent): void {
  if (!props.dragEnabled) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
}

function handleDragEnter(event: DragEvent): void {
  if (!props.dragEnabled) return;
  event.preventDefault();
  emit("dragEnter", props.status);
}

function handleDragLeave(event: DragEvent): void {
  const column = event.currentTarget;
  const nextTarget = event.relatedTarget;
  if (column instanceof HTMLElement && nextTarget instanceof Node && column.contains(nextTarget)) return;
  emit("dragLeave", props.status);
}

function handleDrop(event: DragEvent): void {
  if (!props.dragEnabled) return;
  event.preventDefault();
  emit("dropTask", props.status);
}
</script>

<template>
  <article
    class="kanban-column"
    :class="[`column-${status}`, { 'drop-target': activeDropStatus === status }]"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <header class="column-header">
      <div class="column-title">
        <span class="status-indicator" aria-hidden="true"></span>
        <h2>{{ title }}</h2>
      </div>
      <span class="column-count">{{ formatPersianNumber(tasks.length) }}</span>
    </header>

    <div class="column-content">
      <p v-if="activeDropStatus === status" class="drop-indicator" role="status">در ستون «{{ title }}» رها کنید</p>
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :menu-open="openMenuTaskId === task.id"
        :status-updating="updatingStatusTaskIds.includes(task.id)"
        :status-disabled="editingTaskId === task.id || deletingTaskId === task.id"
        :drag-enabled="dragEnabled && editingTaskId !== task.id && deletingTaskId !== task.id && !updatingStatusTaskIds.includes(task.id)"
        :dragging="draggedTaskId === task.id"
        @toggle-menu="$emit('toggleMenu', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @status-change="$emit('statusChange', $event)"
        @drag-start="$emit('dragStart', $event)"
        @drag-end="$emit('dragEnd')"
      />
      <EmptyState
        v-if="tasks.length === 0"
        compact
        title="این ستون خالی است"
        message="تسک بعدی می‌تواند اینجا قرار بگیرد."
      />
    </div>
  </article>
</template>

<style scoped src="./KanbanColumn.css"></style>
