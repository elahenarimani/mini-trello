<script setup lang="ts">
import type { PriorityFilter, SortOrder, StatusFilter } from "../../types/task";
import { formatPersianNumber, priorityLabels, statusLabels } from "../../constants/taskLabels";

const props = defineProps<{
  total: number;
  visible: number;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  sortOrder: SortOrder;
}>();
const emit = defineEmits<{
  updateStatusFilter: [value: StatusFilter];
  updatePriorityFilter: [value: PriorityFilter];
  updateSortOrder: [value: SortOrder];
  clear: [];
}>();

const isDefault = () => props.statusFilter === "all" && props.priorityFilter === "all" && props.sortOrder === "desc";

function updateStatus(event: Event): void {
  if (!(event.target instanceof HTMLSelectElement)) return;
  const value = event.target.value;
  if (value === "all" || value === "todo" || value === "in_progress" || value === "done") emit("updateStatusFilter", value);
}

function updatePriority(event: Event): void {
  if (!(event.target instanceof HTMLSelectElement)) return;
  const value = event.target.value;
  if (value === "all" || value === "low" || value === "medium" || value === "high") emit("updatePriorityFilter", value);
}

function updateSort(event: Event): void {
  if (!(event.target instanceof HTMLSelectElement)) return;
  const value = event.target.value;
  if (value === "asc" || value === "desc") emit("updateSortOrder", value);
}
</script>

<template>
  <section class="board-toolbar" aria-label="کنترل‌های برد">
    <div class="toolbar-heading">
      <div>
        <p class="eyebrow">نمای کلی فضای کاری</p>
        <h1>تسک‌های من</h1>
      </div>
      <div class="task-counts" aria-live="polite">
        <span class="total-badge">همه تسک‌ها: {{ formatPersianNumber(total) }}</span>
        <span class="total-badge">قابل‌نمایش: {{ formatPersianNumber(visible) }}</span>
      </div>
    </div>

    <div class="toolbar-controls" aria-label="فیلتر و مرتب‌سازی تسک‌ها">
      <label class="control-field">
        <span>وضعیت</span>
        <select :value="statusFilter" aria-label="فیلتر براساس وضعیت" @change="updateStatus">
          <option value="all">همه وضعیت‌ها</option>
          <option value="todo">{{ statusLabels.todo }}</option>
          <option value="in_progress">{{ statusLabels.in_progress }}</option>
          <option value="done">{{ statusLabels.done }}</option>
        </select>
      </label>
      <label class="control-field">
        <span>اولویت</span>
        <select :value="priorityFilter" aria-label="فیلتر براساس اولویت" @change="updatePriority">
          <option value="all">همه اولویت‌ها</option>
          <option value="low">{{ priorityLabels.low }}</option>
          <option value="medium">{{ priorityLabels.medium }}</option>
          <option value="high">{{ priorityLabels.high }}</option>
        </select>
      </label>
      <label class="control-field">
        <span>مرتب‌سازی</span>
        <select :value="sortOrder" aria-label="مرتب‌سازی براساس تاریخ ایجاد" @change="updateSort">
          <option value="desc">جدیدترین</option>
          <option value="asc">قدیمی‌ترین</option>
        </select>
      </label>
      <button class="clear-filters-button" type="button" :disabled="isDefault()" @click="$emit('clear')">
        پاک‌کردن فیلترها
      </button>
    </div>
  </section>
</template>

<style scoped src="./BoardToolbar.css"></style>
