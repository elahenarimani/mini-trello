<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useTaskStore } from "../../stores/taskStore";
import type { Task } from "../../types/task";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{ close: []; deleted: [] }>();
const taskStore = useTaskStore();
const { deletingTaskId, deleteError } = storeToRefs(taskStore);
const cancelButton = ref<HTMLButtonElement | null>(null);
const isDeleting = () => deletingTaskId.value === props.task.id;

async function confirmDelete(): Promise<void> {
  if (deletingTaskId.value !== null) return;
  if (!Number.isInteger(props.task.id) || props.task.id <= 0) {
    deleteError.value = "شناسه تسک معتبر نیست.";
    return;
  }
  if (!taskStore.tasks.some((task) => task.id === props.task.id)) {
    deleteError.value = "این تسک دیگر در دسترس نیست.";
    return;
  }

  const deleted = await taskStore.deleteTask(props.task.id);
  if (deleted) {
    emit("deleted");
    emit("close");
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && deletingTaskId.value === null) emit("close");
}

onMounted(() => {
  deleteError.value = null;
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", handleKeydown);
  void nextTick(() => cancelButton.value?.focus());
});
onUnmounted(() => {
  document.body.style.overflow = "";
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="modal-backdrop" role="presentation" @mousedown.self="deletingTaskId === null && $emit('close')">
    <section class="modal delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-task-heading">
      <div class="delete-modal-icon" aria-hidden="true">!</div>
      <h2 id="delete-task-heading">آیا این تسک حذف شود؟</h2>
      <p>
        تسک <strong>«{{ task.title }}»</strong> برای همیشه حذف می‌شود و این عملیات قابل بازگشت نیست.
      </p>

      <p v-if="deleteError" class="submit-error" role="alert">{{ deleteError }}</p>

      <footer class="modal-actions">
        <button ref="cancelButton" class="secondary-button" type="button" :disabled="deletingTaskId !== null" @click="$emit('close')">انصراف</button>
        <button class="danger-button" type="button" :disabled="deletingTaskId !== null" @click="confirmDelete">
          {{ isDeleting() ? "در حال حذف..." : "حذف" }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped src="./DeleteTaskModal.css"></style>
