import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useChatbotDataStore } from '../api/stores/useChatbotDataStore'
import { useChatbotUiStore } from '../store/useChatbotUiStore'
import type { ChatMessageRating } from '../entities/chat'

export const useChatbotScreen = () => {
  const dataStore = useChatbotDataStore()
  const uiStore = useChatbotUiStore()

  const { thread, recentChats, isLoading, isSending, messages } = storeToRefs(dataStore)
  const { draftMessage, isSidebarOpen } = storeToRefs(uiStore)

  const hasMessages = computed(() => messages.value.length > 0)

  const sendCurrentMessage = async () => {
    const message = draftMessage.value.trim()
    if (!message) return

    uiStore.clearDraftMessage()
    await dataStore.sendMessage(message)
  }

  const openConversation = async (conversationId: string) => {
    uiStore.clearDraftMessage()
    await dataStore.openConversation(conversationId)
  }

  const startNewChat = async () => {
    uiStore.clearDraftMessage()
    await dataStore.startNewConversation()
  }

  const rateMessage = async (messageId: string, rating: ChatMessageRating) => {
    await dataStore.rateMessage(messageId, rating)
  }

  onMounted(async () => {
    if (!thread.value) {
      await dataStore.initialize()
    }
  })

  return {
    thread,
    recentChats,
    isLoading,
    isSending,
    messages,
    hasMessages,
    draftMessage,
    isSidebarOpen,
    setDraftMessage: uiStore.setDraftMessage,
    toggleSidebar: uiStore.toggleSidebar,
    sendCurrentMessage,
    rateMessage,
    openConversation,
    startNewChat,
  }
}
