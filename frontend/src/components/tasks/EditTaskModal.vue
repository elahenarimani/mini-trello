<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useTaskStore } from "../../stores/taskStore";
import type { CreateTaskInput, Task } from "../../types/task";
import { formatPersianNumber, priorityLabels, statusLabels } from "../../constants/taskLabels";
import { validateTaskField } from "../../utils/taskValidation";
import type { TaskFormField, TaskValidationErrors } from "../../utils/taskValidation";

type FormField = TaskFormField;
type FormErrors = TaskValidationErrors & { createdAt?: string };

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{ close: []; updated: [] }>();
const taskStore = useTaskStore();
const { updating, updateError } = storeToRefs(taskStore);
const titleInput = ref<HTMLInputElement | null>(null);
const form = reactive<CreateTaskInput>({
  title: props.task.title,
  description: props.task.description,
  status: props.task.status,
  priority: props.task.priority,
});
const errors = reactive<FormErrors>({});
const touched = reactive<Record<FormField, boolean>>({ title: false, description: false, status: false, priority: false });

const hasChanges = computed(() =>
  form.title.trim() !== props.task.title ||
  form.description.trim() !== props.task.description ||
  form.status !== props.task.status ||
  form.priority !== props.task.priority
);

function validateField(field: FormField): boolean {
  errors[field] = validateTaskField(field, form[field]);
  return !errors[field];
}

function handleBlur(field: FormField): void {
  touched[field] = true;
  validateField(field);
}

function handleInput(field: FormField): void {
  if (touched[field]) validateField(field);
}

function hasValidCreatedAt(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

async function submitForm(): Promise<void> {
  if (updating.value || !hasChanges.value) return;
  const fields: FormField[] = ["title", "description", "status", "priority"];
  fields.forEach((field) => { touched[field] = true; });
  if (!fields.map(validateField).every(Boolean)) return;
  if (!hasValidCreatedAt(props.task.createdAt)) {
    errors.createdAt = "تاریخ ایجاد این تسک معتبر نیست و امکان ویرایش آن وجود ندارد.";
    return;
  }
  const currentTask = taskStore.tasks.find((task) => task.id === props.task.id);
  if (!currentTask) {
    updateError.value = "این تسک دیگر در دسترس نیست.";
    return;
  }
  if (currentTask !== props.task) {
    updateError.value = "این تسک هنگام بازبودن فرم تغییر کرده است. فرم را ببندید و دوباره باز کنید.";
    return;
  }

  const updated = await taskStore.updateTask(props.task.id, {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
    createdAt: props.task.createdAt,
  });
  if (updated) {
    emit("updated");
    emit("close");
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && !updating.value) emit("close");
}

onMounted(() => {
  updateError.value = null;
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", handleKeydown);
  void nextTick(() => titleInput.value?.focus());
});
onUnmounted(() => {
  document.body.style.overflow = "";
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="modal-backdrop" role="presentation" @mousedown.self="!updating && $emit('close')">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-task-heading">
      <header class="modal-header">
        <div><p class="eyebrow">جزئیات تسک</p><h2 id="edit-task-heading">ویرایش تسک</h2></div>
        <button class="modal-close" type="button" aria-label="بستن فرم ویرایش تسک" :disabled="updating" @click="$emit('close')">&#215;</button>
      </header>

      <form novalidate @submit.prevent="submitForm">
        <div class="form-field">
          <label for="edit-task-title">عنوان</label>
          <input id="edit-task-title" ref="titleInput" v-model="form.title" type="text" maxlength="100" :aria-invalid="Boolean(errors.title)" :aria-describedby="errors.title ? 'edit-title-error' : undefined" @blur="handleBlur('title')" @input="handleInput('title')" />
          <div class="field-meta"><span id="edit-title-error" class="field-error">{{ errors.title }}</span><span>{{ formatPersianNumber(form.title.length) }}/۱۰۰</span></div>
        </div>

        <div class="form-field">
          <label for="edit-task-description">توضیحات</label>
          <textarea id="edit-task-description" v-model="form.description" rows="4" maxlength="500" :aria-invalid="Boolean(errors.description)" :aria-describedby="errors.description ? 'edit-description-error' : undefined" @blur="handleBlur('description')" @input="handleInput('description')"></textarea>
          <div class="field-meta"><span id="edit-description-error" class="field-error">{{ errors.description }}</span><span>{{ formatPersianNumber(form.description.length) }}/۵۰۰</span></div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="edit-task-status">وضعیت</label>
            <select id="edit-task-status" v-model="form.status" :aria-invalid="Boolean(errors.status)" @change="handleBlur('status')">
              <option value="todo">{{ statusLabels.todo }}</option><option value="in_progress">{{ statusLabels.in_progress }}</option><option value="done">{{ statusLabels.done }}</option>
            </select>
            <span class="field-error">{{ errors.status }}</span>
          </div>
          <div class="form-field">
            <label for="edit-task-priority">اولویت</label>
            <select id="edit-task-priority" v-model="form.priority" :aria-invalid="Boolean(errors.priority)" @change="handleBlur('priority')">
              <option value="low">{{ priorityLabels.low }}</option><option value="medium">{{ priorityLabels.medium }}</option><option value="high">{{ priorityLabels.high }}</option>
            </select>
            <span class="field-error">{{ errors.priority }}</span>
          </div>
        </div>

        <p v-if="errors.createdAt" class="submit-error" role="alert">{{ errors.createdAt }}</p>
        <p v-if="updateError" class="submit-error" role="alert">{{ updateError }}</p>

        <footer class="modal-actions">
          <button class="secondary-button" type="button" :disabled="updating" @click="$emit('close')">انصراف</button>
          <button class="primary-button" type="submit" :disabled="updating || !hasChanges">
            {{ updating ? "در حال ذخیره..." : "ذخیره تغییرات" }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<style scoped src="./EditTaskModal.css"></style>
