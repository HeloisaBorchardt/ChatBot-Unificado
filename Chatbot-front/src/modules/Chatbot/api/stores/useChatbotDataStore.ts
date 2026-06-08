import { defineStore } from 'pinia'

import { getChatbotService } from '../factories/chatbotServiceFactory'
import type { ChatMessage, ChatMessageRating, ChatThread, RecentChat } from '../../entities/chat'

interface ChatbotDataState {
  thread: ChatThread | null
  recentChats: RecentChat[]
  isLoading: boolean
  isSending: boolean
}

const chatbotService = getChatbotService()

const normalizeAssistantMessage = (message: ChatMessage): ChatMessage => {
  if (message.role !== 'assistant') return message

  return {
    ...message,
    canRate: message.canRate ?? true,
    rating: message.rating ?? null,
  }
}

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
        const recentChats = await chatbotService.getRecentChats()
        this.recentChats = recentChats

        const firstRecentChat = recentChats.at(0)
        if (firstRecentChat) {
          await this.openConversation(firstRecentChat.id)
          return
        }

        this.thread = await chatbotService.getInitialThread()
      } finally {
        this.isLoading = false
      }
    },

    async openConversation(conversationId: string) {
      this.isLoading = true

      try {
        const thread = await chatbotService.getConversationThread(conversationId)
        this.thread = {
          ...thread,
          messages: thread.messages.map((message) => normalizeAssistantMessage(message)),
        }
      } finally {
        this.isLoading = false
      }
    },

    async startNewConversation() {
      this.thread = await chatbotService.getInitialThread()
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
        this.thread.messages.push(normalizeAssistantMessage(answer))

        if (answer.conversationId) {
          this.thread.id = String(answer.conversationId)
        }

        this.recentChats = await chatbotService.getRecentChats()
      } finally {
        this.isSending = false
      }
    },

    async rateMessage(messageId: string, rating: ChatMessageRating) {
      if (!this.thread) return

      const message = this.thread.messages.find((item) => item.id === messageId)

      if (!message || message.role !== 'assistant' || !message.canRate) return

      const previousRating = message.rating
      message.rating = rating

      if (!message.conversationId) return

      try {
        await chatbotService.rateConversation(message.conversationId, rating === 'like')
      } catch (error) {
        console.error('Erro ao avaliar conversa:', error)
        message.rating = previousRating
      }
    },
  },
})
