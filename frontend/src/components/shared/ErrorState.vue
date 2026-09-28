<script setup lang="ts">
defineProps<{ message: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <section class="feedback-state" role="alert">
    <span class="feedback-icon error-icon" aria-hidden="true">!</span>
    <h2>دریافت تسک‌ها انجام نشد</h2>
    <p>{{ message }}</p>
    <button class="primary-button" type="button" @click="$emit('retry')">تلاش مجدد</button>
  </section>
</template>

<style scoped src="./ErrorState.css"></style>
