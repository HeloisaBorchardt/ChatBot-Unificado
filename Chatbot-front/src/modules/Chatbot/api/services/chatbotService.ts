import type { ChatMessage, ChatThread, RecentChat } from '../../entities/chat'
import { httpClient } from '../../../../api/client'

const mockRecentChats: RecentChat[] = [
  { id: 'r-1', title: 'Quem pode se inscrever?', updatedLabel: '2m atras' },
  { id: 'r-2', title: 'Quais documentos sao obrigatorios?', updatedLabel: '1h atras' },
  { id: 'r-3', title: 'Quais sao os criterios?', updatedLabel: '1d atras' },
  { id: 'r-4', title: 'Ha etapas eliminatorias?', updatedLabel: '3d atras' },
]

const createInitialMockThread = (): ChatThread => ({
  id: 'thread-1',
  participant: {
    id: 'assistant-ed',
    name: 'Ed',
    role: 'assistant',
    title: 'Especialista em editais',
  },
  messages: [
    {
      id: 'm-1',
      role: 'assistant',
      content: 'Ola, Heloisa. Tem alguma pergunta para mim?',
      createdAt: new Date().toISOString(),
    },
  ],
})

export class ChatbotService {
  async getInitialThread(): Promise<ChatThread> {
    return createInitialMockThread()
  }

  async getRecentChats(): Promise<RecentChat[]> {
    return mockRecentChats
  }

  async sendQuestion(question: string): Promise<ChatMessage> {
    try {
      const { data } = await httpClient.post('/mensagem', {
        mensagem: question,
      })

      return {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content: data.resposta || data.mensagem || data.message || 'Sem resposta do servidor',
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content: 'Erro ao conectar com o servidor',
        createdAt: new Date().toISOString(),
      }
    }
  }
}
