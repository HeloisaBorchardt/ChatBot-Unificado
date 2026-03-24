import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useChatbotDataStore } from '../api/stores/useChatbotDataStore'
import { useChatbotUiStore } from '../store/useChatbotUiStore'

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
  }
}
