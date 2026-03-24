import { defineStore } from 'pinia'

import { getChatbotService } from '../factories/chatbotServiceFactory'
import type { ChatMessage, ChatThread, RecentChat } from '../../entities/chat'

interface ChatbotDataState {
  thread: ChatThread | null
  recentChats: RecentChat[]
  isLoading: boolean
  isSending: boolean
}

const chatbotService = getChatbotService()

export const useChatbotDataStore = defineStore('chatbot-data', {
  state: (): ChatbotDataState => ({
    thread: null,
    recentChats: [],
    isLoading: false,
    isSending: false,
  }),

  getters: {
    messages: (state): ChatMessage[] => state.thread?.messages ?? [],
  },

  actions: {
    async initialize() {
      this.isLoading = true

      try {
        const [thread, recentChats] = await Promise.all([
          chatbotService.getInitialThread(),
          chatbotService.getRecentChats(),
        ])

        this.thread = thread
        this.recentChats = recentChats
      } finally {
        this.isLoading = false
      }
    },

    appendUserMessage(content: string) {
      if (!this.thread) return

      this.thread.messages.push({
        id: `m-user-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      })
    },

    async sendMessage(content: string) {
      if (!this.thread || this.isSending) return

      this.isSending = true
      this.appendUserMessage(content)

      try {
        const answer = await chatbotService.sendQuestion(content, this.thread.id)
        this.thread.messages.push(answer)
      } finally {
        this.isSending = false
      }
    },
  },
})
