<script setup lang="ts">
import { ref } from "vue";
import type { Task, TaskStatus } from "../../types/task";
import { priorityLabels, statusLabels } from "../../constants/taskLabels";

defineProps<{
  task: Task;
  menuOpen: boolean;
  statusUpdating: boolean;
  statusDisabled: boolean;
  dragEnabled: boolean;
  dragging: boolean;
}>();
const emit = defineEmits<{
  toggleMenu: [taskId: number];
  edit: [task: Task];
  delete: [payload: { task: Task; trigger: HTMLButtonElement | null }];
  statusChange: [payload: { taskId: number; newStatus: TaskStatus }];
  dragStart: [payload: { taskId: number; sourceStatus: TaskStatus; event: DragEvent }];
  dragEnd: [];
}>();
const menuButton = ref<HTMLButtonElement | null>(null);

function requestDelete(task: Task): void {
  emit("delete", { task, trigger: menuButton.value });
}

function isTaskStatus(value: string): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "done";
}

function handleStatusChange(event: Event, task: Task): void {
  if (!(event.target instanceof HTMLSelectElement)) return;
  const newStatus = event.target.value;
  event.target.value = task.status;
  if (!isTaskStatus(newStatus) || newStatus === task.status) return;
  emit("statusChange", { taskId: task.id, newStatus });
}

function handleDragStart(event: DragEvent, task: Task): void {
  emit("dragStart", { taskId: task.id, sourceStatus: task.status, event });
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاریخ نامعتبر";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
</script>

<template>
  <article class="task-card" :class="{ 'is-dragging': dragging }">
    <div class="task-card-topline">
      <span class="priority" :class="`priority-${task.priority}`">
        <span class="priority-dot" aria-hidden="true"></span>{{ priorityLabels[task.priority] }}
      </span>
      <div class="task-card-actions">
        <button
          class="drag-handle"
          type="button"
          :draggable="dragEnabled"
          :disabled="!dragEnabled"
          :aria-label="`انتقال «${task.title}» به ستون وضعیت دیگر`"
          :title="dragEnabled ? 'انتقال به ستون دیگر' : 'انتقال در دسترس نیست'"
          @dragstart="handleDragStart($event, task)"
          @dragend="$emit('dragEnd')"
        >&#8942;&#8942;</button>
        <div class="card-menu" @click.stop>
          <button ref="menuButton" class="more-button" type="button" :disabled="statusUpdating" :aria-label="`گزینه‌های بیشتر برای ${task.title}`" :aria-expanded="menuOpen" @click="$emit('toggleMenu', task.id)">&#8226;&#8226;&#8226;</button>
          <div v-if="menuOpen" class="card-menu-popover" role="menu">
            <button type="button" role="menuitem" :disabled="statusUpdating" @click="$emit('edit', task)">ویرایش تسک</button>
            <button class="danger-menu-item" type="button" role="menuitem" :disabled="statusUpdating" @click="requestDelete(task)">حذف تسک</button>
          </div>
        </div>
      </div>
    </div>
    <h3>{{ task.title }}</h3>
    <p class="task-description">{{ task.description || "توضیحی ثبت نشده است." }}</p>
    <footer class="task-card-footer">
      <div class="task-date"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg><time :datetime="task.createdAt">{{ formatDate(task.createdAt) }}</time></div>
      <div class="status-control">
        <label class="sr-only" :for="`task-status-${task.id}`">تغییر وضعیت {{ task.title }}</label>
        <select
          :id="`task-status-${task.id}`"
          :value="task.status"
          :disabled="statusDisabled || statusUpdating"
          :aria-label="`تغییر وضعیت ${task.title}`"
          :aria-busy="statusUpdating"
          @change="handleStatusChange($event, task)"
        >
          <option value="todo">{{ statusLabels.todo }}</option>
          <option value="in_progress">{{ statusLabels.in_progress }}</option>
          <option value="done">{{ statusLabels.done }}</option>
        </select>
        <span v-if="statusUpdating" class="status-spinner" aria-hidden="true"></span>
      </div>
    </footer>
  </article>
</template>

<style scoped src="./TaskCard.css"></style>
