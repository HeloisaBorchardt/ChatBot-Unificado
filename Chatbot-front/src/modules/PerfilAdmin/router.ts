import type { RouteRecordRaw } from 'vue-router'

export const perfilAdminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/documentos',
    name: 'admin-documentos',
    component: () => import('./views/DocumentCrudView.vue'),
  },
  {
    path: '/admin/controle-acesso',
    name: 'admin-controle-acesso',
    component: () => import('./views/AccessControlView.vue'),
  },
  {
    path: '/admin/relatorios',
    name: 'admin-relatorios',
    component: () => import('./views/RelatóriosView.vue'),
  },
]
