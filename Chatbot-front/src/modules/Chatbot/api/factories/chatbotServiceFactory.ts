import { ChatbotService } from '../services/chatbotService'

let chatbotServiceInstance: ChatbotService | null = null

export const getChatbotService = (): ChatbotService => {
  if (!chatbotServiceInstance) {
    chatbotServiceInstance = new ChatbotService()
  }

  return chatbotServiceInstance
}
