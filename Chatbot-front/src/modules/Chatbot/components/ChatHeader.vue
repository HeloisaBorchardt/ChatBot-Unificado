<script setup lang="ts">
import BaseAvatar from '../../../common/components/BaseAvatar.vue'

defineProps<{
  name: string
  title?: string
}>()
</script>

<template>
  <header class="chat-header">
    <BaseAvatar :label="name" size="lg" />
    <div>
      <h2 class="chat-header__name">{{ name }}</h2>
      <p v-if="title" class="chat-header__title">{{ title }}</p>
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid #d7d7da;
  background: #f6f6f7;
}

.chat-header__name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2d3137;
}

.chat-header__title {
  font-size: 0.92rem;
  color: #616772;
}
</style>
