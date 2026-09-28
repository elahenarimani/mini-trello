<script setup lang="ts">
defineProps<{ darkMode: boolean }>();
defineEmits<{ toggleTheme: []; addTask: [] }>();
</script>

<template>
  <header class="topbar">
    <div class="brand" aria-label="صفحه اصلی مینی ترلو">
      <span class="brand-mark" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
      <span>مینی ترلو</span>
    </div>

    <div class="board-name">
      <span class="board-name-label">برد فعلی</span>
      <strong>برد مدیریت تسک‌ها</strong>
    </div>

    <div class="header-actions">
      <button class="icon-button" type="button" :aria-label="darkMode ? 'استفاده از حالت روشن' : 'استفاده از حالت تیره'" @click="$emit('toggleTheme')">
        <svg v-if="darkMode" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42M7.06 16.94l-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5 8.5 8.5 0 1 0 20.5 15.4Z"/></svg>
      </button>
      <button class="primary-button add-task-button" type="button" @click="$emit('addTask')">
        <span aria-hidden="true">+</span>
        افزودن تسک
      </button>
    </div>
  </header>
</template>

<style scoped src="./AppHeader.css"></style>
