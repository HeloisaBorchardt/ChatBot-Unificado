import type { ChatMessage, ChatThread, RecentChat } from '../../entities/chat'
import { httpClient } from '../../../../api/client'
import { apiRoutes } from '../../../../api/routes'
import { useAuthStore } from '../../../../stores/useAuthStore'

interface ConversationQuestionApi {
  id_pergunta: number
  texto?: string
  resposta?: {
    id_resposta?: number
    intencao?: string
    texto_resposta?: string
    tempo_resposta?: string | null
  } | null
}

interface ConversationApi {
  id_conversa: number
  usuario?: {
    id_usuario?: number
    nome?: string
    email?: string
  } | null
  data_conversa?: string
  horario_conversa?: string
  avaliacao?: boolean | null
  perguntas?: ConversationQuestionApi[]
}

const createEmptyThread = (): ChatThread => ({
  id: 'new',
  participant: {
    id: 'assistant-ed',
    name: 'Ed',
    role: 'assistant',
    title: 'Especialista em editais',
  },
  messages: [],
})

const formatRecentLabel = (dataConversa?: string, horarioConversa?: string): string => {
  if (!dataConversa) return 'Hoje'

  const date = new Date(`${dataConversa}${horarioConversa ? `T${horarioConversa}` : ''}`)
  if (Number.isNaN(date.getTime())) return 'Hoje'

  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() - 1)

  if (date.toDateString() === hoje.toDateString()) return 'Hoje'
  if (date.toDateString() === amanha.toDateString()) return 'Ontem'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

const resolveConversationTitle = (conversation: ConversationApi): string => {
  const perguntas = conversation.perguntas ?? []
  const ultimaPergunta = perguntas.at(-1)
  const titulo = ultimaPergunta?.texto?.trim()

  if (titulo) return titulo

  const usuarioNome = conversation.usuario?.nome?.trim()
  if (usuarioNome) return `Conversa de ${usuarioNome}`

  return `Conversa ${conversation.id_conversa}`
}

const mapConversationToRecentChat = (conversation: ConversationApi): RecentChat => ({
  id: String(conversation.id_conversa),
  title: resolveConversationTitle(conversation),
  updatedLabel: formatRecentLabel(conversation.data_conversa, conversation.horario_conversa),
})

const mapConversationToThread = (conversation: ConversationApi): ChatThread => {
  const messages: ChatMessage[] = []

  for (const pergunta of conversation.perguntas ?? []) {
    messages.push({
      id: `m-question-${pergunta.id_pergunta}`,
      role: 'user',
      content: pergunta.texto ?? '',
      createdAt: new Date().toISOString(),
    })

    if (pergunta.resposta?.texto_resposta) {
      messages.push({
        id: `m-answer-${pergunta.resposta.id_resposta ?? pergunta.id_pergunta}`,
        role: 'assistant',
        content: pergunta.resposta.texto_resposta,
        createdAt: new Date().toISOString(),
        conversationId: conversation.id_conversa,
        canRate: true,
        rating: null,
      })
    }
  }

  return {
    id: String(conversation.id_conversa),
    participant: {
      id: 'assistant-ed',
      name: 'Ed',
      role: 'assistant',
      title: 'Especialista em editais',
    },
    messages,
  }
}

export class ChatbotService {
  async getInitialThread(): Promise<ChatThread> {
    return createEmptyThread()
  }

  async getRecentChats(): Promise<RecentChat[]> {
    const authStore = useAuthStore()
    const usuarioEmail = authStore.currentUser?.email

    if (!usuarioEmail) return []

    const { data } = await httpClient.get<ConversationApi[]>(apiRoutes.conversas.list, {
      params: {
        usuario_email: usuarioEmail,
      },
    })

    return Array.isArray(data) ? data.map(mapConversationToRecentChat) : []
  }

  async getConversationThread(conversationId: string | number): Promise<ChatThread> {
    const { data } = await httpClient.get<ConversationApi>(apiRoutes.conversas.historico(conversationId))
    return mapConversationToThread(data)
  }

  async sendQuestion(question: string, threadId?: string): Promise<ChatMessage> {
    try {
      const authStore = useAuthStore()
      const usuarioEmail = authStore.currentUser?.email
      const chatId = Number(threadId)

      const { data } = await httpClient.post(apiRoutes.perguntas.create, {
        texto: question,
        ...(Number.isFinite(chatId) ? { chat_id: chatId } : {}),
        ...(usuarioEmail ? { usuario_email: usuarioEmail } : {}),
      })

      return {
        id: data.id_pergunta ? `m-answer-${data.id_pergunta}` : `m-${Date.now()}`,
        role: 'assistant',
        content: data.resposta || data.mensagem || data.message || 'Sem resposta do servidor',
        createdAt: new Date().toISOString(),
        conversationId: data.conversa_id ?? data.chat_id,
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

  async rateConversation(conversationId: number, liked: boolean): Promise<void> {
    await httpClient.patch(apiRoutes.conversas.detail(conversationId), {
      avaliacao: liked,
    })
  }
}
