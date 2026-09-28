<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useTaskStore } from "../../stores/taskStore";
import type { CreateTaskInput } from "../../types/task";
import { formatPersianNumber, priorityLabels, statusLabels } from "../../constants/taskLabels";
import { validateTaskField } from "../../utils/taskValidation";
import type { TaskFormField, TaskValidationErrors } from "../../utils/taskValidation";

type FormField = TaskFormField;
type FormErrors = TaskValidationErrors;

const emit = defineEmits<{ close: []; created: [] }>();
const taskStore = useTaskStore();
const { creating, createError } = storeToRefs(taskStore);
const titleInput = ref<HTMLInputElement | null>(null);

const form = reactive<CreateTaskInput>({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
});
const errors = reactive<FormErrors>({});
const touched = reactive<Record<FormField, boolean>>({
  title: false,
  description: false,
  status: false,
  priority: false,
});

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

async function submitForm(): Promise<void> {
  if (creating.value) return;
  const fields: FormField[] = ["title", "description", "status", "priority"];
  fields.forEach((field) => { touched[field] = true; });
  const isValid = fields.map(validateField).every(Boolean);
  if (!isValid) return;

  const created = await taskStore.createTask({
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
  });
  if (created) {
    emit("created");
    emit("close");
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && !creating.value) emit("close");
}

onMounted(() => {
  createError.value = null;
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
  <div class="modal-backdrop" role="presentation" @mousedown.self="!creating && $emit('close')">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
      <header class="modal-header">
        <div>
          <p class="eyebrow">تسک جدید</p>
          <h2 id="add-task-title">افزودن تسک</h2>
        </div>
        <button class="modal-close" type="button" aria-label="بستن فرم افزودن تسک" :disabled="creating" @click="$emit('close')">×</button>
      </header>

      <form novalidate @submit.prevent="submitForm">
        <div class="form-field">
          <label for="task-title">عنوان</label>
          <input id="task-title" ref="titleInput" v-model="form.title" type="text" maxlength="100" :aria-invalid="Boolean(errors.title)" :aria-describedby="errors.title ? 'title-error' : undefined" @blur="handleBlur('title')" @input="handleInput('title')" />
          <div class="field-meta"><span id="title-error" class="field-error">{{ errors.title }}</span><span>{{ formatPersianNumber(form.title.length) }}/۱۰۰</span></div>
        </div>

        <div class="form-field">
          <label for="task-description">توضیحات</label>
          <textarea id="task-description" v-model="form.description" rows="4" maxlength="500" :aria-invalid="Boolean(errors.description)" :aria-describedby="errors.description ? 'description-error' : undefined" @blur="handleBlur('description')" @input="handleInput('description')"></textarea>
          <div class="field-meta"><span id="description-error" class="field-error">{{ errors.description }}</span><span>{{ formatPersianNumber(form.description.length) }}/۵۰۰</span></div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="task-status">وضعیت</label>
            <select id="task-status" v-model="form.status" :aria-invalid="Boolean(errors.status)" @change="handleBlur('status')">
              <option value="todo">{{ statusLabels.todo }}</option>
              <option value="in_progress">{{ statusLabels.in_progress }}</option>
              <option value="done">{{ statusLabels.done }}</option>
            </select>
            <span class="field-error">{{ errors.status }}</span>
          </div>
          <div class="form-field">
            <label for="task-priority">اولویت</label>
            <select id="task-priority" v-model="form.priority" :aria-invalid="Boolean(errors.priority)" @change="handleBlur('priority')">
              <option value="low">{{ priorityLabels.low }}</option>
              <option value="medium">{{ priorityLabels.medium }}</option>
              <option value="high">{{ priorityLabels.high }}</option>
            </select>
            <span class="field-error">{{ errors.priority }}</span>
          </div>
        </div>

        <p v-if="createError" class="submit-error" role="alert">{{ createError }}</p>

        <footer class="modal-actions">
          <button class="secondary-button" type="button" :disabled="creating" @click="$emit('close')">انصراف</button>
          <button class="primary-button" type="submit" :disabled="creating">
            {{ creating ? "در حال ایجاد..." : "ایجاد تسک" }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<style scoped src="./AddTaskModal.css"></style>
