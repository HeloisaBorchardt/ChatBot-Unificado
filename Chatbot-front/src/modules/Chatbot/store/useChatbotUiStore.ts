import { defineStore } from 'pinia'

interface ChatbotUiState {
  draftMessage: string
  isSidebarOpen: boolean
}

export const useChatbotUiStore = defineStore('chatbot-ui', {
  state: (): ChatbotUiState => ({
    draftMessage: '',
    isSidebarOpen: true,
  }),

  actions: {
    setDraftMessage(value: string) {
      this.draftMessage = value
    },

    clearDraftMessage() {
      this.draftMessage = ''
    },

    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
  },
})
