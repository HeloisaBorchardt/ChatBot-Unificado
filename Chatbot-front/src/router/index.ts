import { createRouter, createWebHistory } from 'vue-router'
import chatbotRoutes from '../modules/Chatbot/routes'
import perfilAdminRoutes from '../modules/PerfilAdmin/routes'
import { useAuthStore } from '../stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { guestOnly: true },
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      meta: { guestOnly: true },
      component: () => import('../views/CadastroView.vue'),
    },
    ...chatbotRoutes.map((route) => ({
      ...route,
      meta: { ...route.meta, requiresAuth: true, role: 'usuario' },
    })),
    ...perfilAdminRoutes.map((route) => ({
      ...route,
      meta: { ...route.meta, requiresAuth: true, role: 'administrador' },
    })),
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isAuthenticated

  if (to.meta.guestOnly && isLoggedIn) {
    const redirectRoute =
      authStore.currentUser?.role === 'administrador' ? 'admin-documentos' : 'chatbot'
    return { name: redirectRoute }
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }

  if (to.meta.role && authStore.currentUser?.role !== to.meta.role) {
    const redirectRoute =
      authStore.currentUser?.role === 'administrador' ? 'admin-documentos' : 'chatbot'
    return { name: redirectRoute }
  }

  return true
})

export default router
