import { createRouter, createWebHistory } from 'vue-router'
import chatbotRoutes from '../modules/Chatbot/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...chatbotRoutes],
})

export default router
