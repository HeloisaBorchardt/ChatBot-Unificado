export type ChatMessageRole = 'assistant' | 'user'
export type ChatMessageRating = 'like' | 'dislike'

export interface ChatMessageSource {
  nome: string
  url: string | null
}

export interface ChatParticipant {
  id: string
  name: string
  role: ChatMessageRole
  title?: string
  email?: string
}

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  createdAt: string
  conversationId?: number
  canRate?: boolean
  rating?: ChatMessageRating | null
  sources?: ChatMessageSource[]
}

export interface RecentChat {
  id: string
  title: string
  updatedLabel: string
}

export interface ChatThread {
  id: string
  participant: ChatParticipant
  messages: ChatMessage[]
}
