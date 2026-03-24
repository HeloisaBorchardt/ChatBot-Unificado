<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    bgColor?: string
    textColor?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    bgColor: '#5f6ea6',
    textColor: '#ffffff',
    size: 'md',
  },
)

const avatarText = computed(() => props.label.trim().charAt(0).toUpperCase())

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'avatar--sm'
  if (props.size === 'lg') return 'avatar--lg'
  return 'avatar--md'
})
</script>

<template>
  <div
    class="avatar"
    :class="sizeClass"
    :style="{ '--avatar-bg': bgColor, '--avatar-text': textColor }"
    aria-hidden="true"
  >
    {{ avatarText }}
  </div>
</template>

<style scoped>
.avatar {
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: var(--avatar-text);
  background: radial-gradient(circle at 30% 30%, #7f8ed3, var(--avatar-bg));
  font-weight: 700;
  flex-shrink: 0;
}

.avatar--sm {
  width: 34px;
  height: 34px;
  font-size: 0.85rem;
}

.avatar--md {
  width: 40px;
  height: 40px;
  font-size: 0.95rem;
}

.avatar--lg {
  width: 46px;
  height: 46px;
  font-size: 1rem;
}
</style>
