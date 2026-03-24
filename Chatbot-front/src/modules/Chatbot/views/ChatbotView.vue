<script setup lang="ts">
import { computed } from 'vue'

import ChatComposer from '../components/ChatComposer.vue'
import ChatHeader from '../components/ChatHeader.vue'
import ChatMessageBubble from '../components/ChatMessageBubble.vue'
import ChatSidebar from '../components/ChatSidebar.vue'
import { useChatbotScreen } from '../composables/useChatbotScreen'
import type { ChatParticipant } from '../entities/chat'

const {
  thread,
  recentChats,
  isLoading,
  isSending,
  messages,
  draftMessage,
  setDraftMessage,
  sendCurrentMessage,
} = useChatbotScreen()

const fallbackAssistant: ChatParticipant = {
  id: 'assistant-ed',
  name: 'Ed',
  role: 'assistant',
  title: 'Especialista em editais',
}

const assistantParticipant = computed(() => thread.value?.participant ?? fallbackAssistant)
</script>

<template>
  <main class="chatbot-screen">
    <ChatSidebar :recent-chats="recentChats" @new-chat="setDraftMessage('')" />

    <section class="chatbot-screen__content">
      <ChatHeader :name="assistantParticipant.name" :title="assistantParticipant.title" />

      <div v-if="isLoading" class="chatbot-screen__loading">Carregando conversa...</div>

      <section v-else class="chatbot-screen__messages">
        <ChatMessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :assistant="assistantParticipant"
        />
      </section>

      <ChatComposer
        :model-value="draftMessage"
        :disabled="isSending"
        @update:model-value="setDraftMessage"
        @send="sendCurrentMessage"
      />
    </section>
  </main>
</template>

<style scoped>
.chatbot-screen {
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: #ededf0;
}

.chatbot-screen__content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.chatbot-screen__loading {
  display: grid;
  place-items: center;
  color: #555c66;
}

.chatbot-screen__messages {
  padding: 1.2rem 1.6rem;
  display: grid;
  align-content: start;
  gap: 1.15rem;
  overflow-y: auto;
}

@media (max-width: 960px) {
  .chatbot-screen {
    grid-template-columns: 1fr;
    min-height: 100dvh;
  }

  .chatbot-screen__content {
    min-height: auto;
  }

  .chatbot-screen__messages {
    padding: 1rem;
  }
}
</style>
