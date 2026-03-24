/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHATBOT_API_URL?: string
  readonly VITE_CHATBOT_API_TOKEN?: string
  readonly VITE_CHATBOT_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
