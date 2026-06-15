<script setup lang="ts">
import BaseAvatar from '../../../common/components/BaseAvatar.vue'
import type { ChatMessage, ChatMessageRating, ChatParticipant } from '../entities/chat'
import { useAuthStore } from '../../../stores/useAuthStore'

const props = defineProps<{
  message: ChatMessage
  assistant: ChatParticipant
  editalUrl?: string | null
}>()

const emit = defineEmits<{
  rateMessage: [messageId: string, rating: ChatMessageRating]
}>()

const authStore = useAuthStore()

const currentUserName = authStore.currentUser?.fullName || 'Usuário'

const rate = (rating: ChatMessageRating) => {
  emit('rateMessage', props.message.id, rating)
}
</script>

<template>
  <article class="message" :class="`message--${message.role}`">
    <template v-if="message.role === 'assistant'">
      <BaseAvatar :label="assistant.name" size="sm" />
      <div class="message__bubble message__bubble--assistant">
        <p>{{ message.content }}</p>
        <a
          v-for="source in message.sources ?? []"
          :key="source.nome + (source.url ?? '')"
          class="message__edital-link"
          :href="source.url || undefined"
          :aria-disabled="!source.url"
          :tabindex="source.url ? 0 : -1"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="source.url ? `Abrir ${source.nome}` : `${source.nome} sem link disponível`"
        >
          📄 Edital
          <span>{{ source.nome }}</span>
        </a>
        <div v-if="message.canRate" class="message__feedback">
          <button
            type="button"
            aria-label="Gostei"
            class="message__feedback-button"
            :class="{ 'message__feedback-button--selected': message.rating === 'like' }"
            @click="rate('like')"
          >
            Like
          </button>
          <button
            type="button"
            aria-label="Nao gostei"
            class="message__feedback-button"
            :class="{ 'message__feedback-button--selected': message.rating === 'dislike' }"
            @click="rate('dislike')"
          >
            Dislike
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="message__bubble message__bubble--user">
        <p>{{ message.content }}</p>
      </div>
      <BaseAvatar :label="currentUserName" size="sm" />
    </template>
  </article>
</template>

<style scoped>
.message {
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
}

.message--user {
  justify-content: flex-end;
}

.message__bubble {
  max-width: min(72%, 660px);
  border-radius: 8px;
  border: 1px solid #c9c9cd;
  padding: 0.78rem 0.95rem;
  line-height: 1.38;
}

.message__bubble--assistant {
  background: #f7f7f8;
  color: #333842;
}

.message__edital-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.55rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #e8ecff;
  color: #27325f;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.message__edital-link:hover {
  background: #d8e0ff;
  transform: translateY(-1px);
}

.message__edital-link[aria-disabled='true'] {
  pointer-events: none;
  opacity: 0.55;
  transform: none;
}

.message__bubble--user {
  background: #762f37;
  border-color: #762f37;
  color: #ffffff;
}

.message__feedback {
  margin-top: 0.45rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
}

.message__feedback-button {
  border: 1px solid #c9c9cd;
  background: #ffffff;
  cursor: pointer;
  color: #555c66;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.message__feedback-button:hover {
  border-color: #762f37;
  color: #762f37;
}

.message__feedback-button--selected {
  background: #762f37;
  border-color: #762f37;
  color: #ffffff;
}

@media (max-width: 960px) {
  .message__bubble {
    max-width: 86%;
  }
}
</style>
