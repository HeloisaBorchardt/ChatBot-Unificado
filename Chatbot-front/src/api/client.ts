import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api'
const timeoutFromEnv = Number(import.meta.env.VITE_CHATBOT_TIMEOUT_MS)
const apiTimeout = Number.isFinite(timeoutFromEnv) ? timeoutFromEnv : 60000

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeout,
})
