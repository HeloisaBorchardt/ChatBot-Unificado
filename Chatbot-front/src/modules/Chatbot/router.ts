import type { RouteRecordRaw } from 'vue-router'

export const chatbotRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'chatbot',
    component: () => import('./views/ChatbotView.vue'),
  },
]
