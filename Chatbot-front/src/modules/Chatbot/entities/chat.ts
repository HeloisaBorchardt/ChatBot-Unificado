export type ChatMessageRole = 'assistant' | 'user'
export type ChatMessageRating = 'like' | 'dislike'

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
