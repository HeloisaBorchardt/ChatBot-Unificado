<script setup lang="ts">
import BaseAvatar from '../../../common/components/BaseAvatar.vue'

defineProps<{
  name: string
  title?: string
}>()
</script>

<template>
  <header class="chat-header">
    <div class="chat-header__identity">
      <BaseAvatar :label="name" size="lg" />
      <div>
        <h2 class="chat-header__name">{{ name }}</h2>
        <p v-if="title" class="chat-header__title">{{ title }}</p>
      </div>
    </div>

    <div v-if="$slots.actions" class="chat-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid #d7d7da;
  background: #f6f6f7;
}

.chat-header__identity {
  display: flex;
  align-items: center;
  gap: 0.85rem;
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

.chat-header__actions {
  display: flex;
  align-items: center;
}
</style>
