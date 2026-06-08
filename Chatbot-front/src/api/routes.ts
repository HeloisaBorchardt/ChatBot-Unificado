const apiPrefix = ''

export const apiRoutes = {
  usuarios: {
    list: `${apiPrefix}/usuarios/`,
    login: `${apiPrefix}/usuarios/login/`,
  },
  documentos: {
    list: `${apiPrefix}/documentos/`,
    detail: (id: number | string) => `${apiPrefix}/documentos/${id}/`,
  },
  perguntas: {
    create: `${apiPrefix}/perguntas/`,
  },
  conversas: {
    list: `${apiPrefix}/conversas/`,
    detail: (id: number | string) => `${apiPrefix}/conversas/${id}/`,
    historico: (id: number | string) => `${apiPrefix}/conversas/${id}/historico/`,
    exportar: `${apiPrefix}/conversas/exportar/`,
  },
} as const
