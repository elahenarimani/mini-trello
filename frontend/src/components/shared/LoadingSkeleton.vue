<template>
  <section class="kanban-board" aria-label="در حال بارگذاری تسک‌ها" aria-busy="true">
    <article v-for="column in 3" :key="column" class="kanban-column skeleton-column">
      <div class="skeleton skeleton-heading"></div>
      <div class="column-content">
        <div v-for="card in 3" :key="card" class="task-card skeleton-card">
          <div class="skeleton skeleton-badge"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line short"></div>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped src="./LoadingSkeleton.css"></style>
