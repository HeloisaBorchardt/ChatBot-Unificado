<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ChatComposer from '../components/ChatComposer.vue'
import ChatHeader from '../components/ChatHeader.vue'
import ChatMessageBubble from '../components/ChatMessageBubble.vue'
import ChatSidebar from '../components/ChatSidebar.vue'
import { useChatbotScreen } from '../composables/useChatbotScreen'
import type { ChatParticipant } from '../entities/chat'
import { useAuthStore } from '../../../stores/useAuthStore'

const {
  thread,
  recentChats,
  isLoading,
  isSending,
  messages,
  draftMessage,
  setDraftMessage,
  sendCurrentMessage,
  rateMessage,
  openConversation,
  startNewChat,
} = useChatbotScreen()

const fallbackAssistant: ChatParticipant = {
  id: 'assistant-ed',
  name: 'Ed',
  role: 'assistant',
  title: 'Especialista em editais',
}

const assistantParticipant = computed(() => thread.value?.participant ?? fallbackAssistant)

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="chatbot-screen">
    <ChatSidebar
      section="conversa"
      :recent-chats="recentChats"
      :active-chat-id="thread?.id"
      @new-chat="startNewChat"
      @select-chat="openConversation"
    />

    <section class="chatbot-screen__content">
      <ChatHeader :name="assistantParticipant.name" :title="assistantParticipant.title">
        <template #actions>
          <button type="button" class="chatbot-screen__logout" @click="handleLogout">Sair</button>
        </template>
      </ChatHeader>

      <div v-if="isLoading" class="chatbot-screen__loading">Carregando conversa...</div>

      <section v-else class="chatbot-screen__messages">
        <ChatMessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :assistant="assistantParticipant"
          @rate-message="rateMessage"
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
  height: 100dvh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: #ededf0;
  overflow: hidden;
}

.chatbot-screen__content {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 0;
  height: 100dvh;
  overflow: hidden;
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
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.chatbot-screen__logout {
  border: 1px solid #c9ccd3;
  border-radius: 999px;
  background: #762f37;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.45rem 0.95rem;
  cursor: pointer;
  transition: filter 150ms ease;
}

.chatbot-screen__logout:hover {
  filter: brightness(1.07);
}

@media (max-width: 960px) {
  .chatbot-screen {
    grid-template-columns: 1fr;
    height: 100dvh;
  }

  .chatbot-screen__content {
    height: calc(100dvh - 0px);
  }

  .chatbot-screen__messages {
    padding: 1rem;
  }
}
</style>
