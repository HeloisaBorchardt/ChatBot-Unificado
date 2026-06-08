<script setup lang="ts">
import BaseAvatar from '../../../common/components/BaseAvatar.vue'
import type { ChatMessage, ChatMessageRating, ChatParticipant } from '../entities/chat'

const props = defineProps<{
  message: ChatMessage
  assistant: ChatParticipant
}>()

const emit = defineEmits<{
  rateMessage: [messageId: string, rating: ChatMessageRating]
}>()

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
      <BaseAvatar label="Heloisa" size="sm" />
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
