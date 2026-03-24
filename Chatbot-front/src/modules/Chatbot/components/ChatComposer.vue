<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const submit = () => emit('send')
</script>

<template>
  <form class="composer" @submit.prevent="submit">
    <input
      class="composer__input"
      :value="props.modelValue"
      :disabled="props.disabled"
      type="text"
      placeholder="Digite sua mensagem..."
      @input="onInput"
    />

    <button class="composer__send" :disabled="props.disabled" type="submit" aria-label="Enviar">
      >
    </button>
    <button class="composer__attach" type="button" aria-label="Anexar arquivo">v</button>
  </form>
</template>

<style scoped>
.composer {
  border-top: 1px solid #d0d0d3;
  background: #f4f4f6;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.55rem;
  padding: 0.8rem 1rem;
}

.composer__input {
  border: 1px solid #c4c4c9;
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  font-size: 0.97rem;
  background: #ffffff;
}

.composer__input:focus {
  outline: 2px solid #aeb6d7;
  border-color: #aeb6d7;
}

.composer__send,
.composer__attach {
  border: 0;
  border-radius: 999px;
  width: 38px;
  height: 38px;
  cursor: pointer;
  font-weight: 700;
}

.composer__send {
  background: #a9bbdf;
  color: #1f304d;
}

.composer__attach {
  background: transparent;
  border: 1px solid #c4c4c9;
}

.composer__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
