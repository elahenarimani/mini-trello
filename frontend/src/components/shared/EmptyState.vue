<script setup lang="ts">
withDefaults(defineProps<{ title?: string; message?: string; compact?: boolean; actionLabel?: string }>(), {
  title: "هنوز تسکی وجود ندارد",
  message: "تسک‌ها پس از ایجاد در این بخش نمایش داده می‌شوند.",
  compact: false,
  actionLabel: "",
});
defineEmits<{ action: [] }>();
</script>

<template>
  <div class="empty-state" :class="{ compact }">
    <span class="empty-state-icon" aria-hidden="true">✓</span>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button v-if="actionLabel" class="secondary-button empty-state-action" type="button" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped src="./EmptyState.css"></style>
