import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { httpClient } from '../api/client'
import { apiRoutes } from '../api/routes'

export type UserRole = 'usuario' | 'administrador'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  username: string
  password: string
  role: UserRole
}

interface RegisterInput {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  admin: boolean
}

interface LoginResult {
  ok: boolean
  message: string
}

interface RegisterApiResponse {
  id_usuario?: number
  nome?: string
  email?: string
  admin?: boolean
}

interface RegisterApiPayload {
  nome: string
  email: string
  senha: string
  admin: boolean
}

interface UserApiResponse {
  id_usuario: number
  nome: string
  email: string
  admin: boolean
}

interface LoginApiResponse {
  mensagem?: string
  usuario?: string
  dados_usuario?: UserApiResponse
}

const USERS_KEY = 'ed-chatbot-mock-users'
const CURRENT_USER_KEY = 'ed-chatbot-current-user'

const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'u-admin-001',
    fullName: 'Administrador Padrao',
    email: 'admin@edchatbot.com',
    username: 'admin',
    password: '123456',
    role: 'administrador',
  },
  {
    id: 'u-user-001',
    fullName: 'Usuario Padrao',
    email: 'usuario@edchatbot.com',
    username: 'usuario',
    password: '123456',
    role: 'usuario',
  },
]

const normalize = (value: string) => value.trim().toLowerCase()

const canUseStorage = typeof window !== 'undefined'

function readUsersFromStorage(): AuthUser[] {
  if (!canUseStorage) {
    return [...DEFAULT_USERS]
  }

  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
    return [...DEFAULT_USERS]
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser[]
    if (!Array.isArray(parsed)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
      return [...DEFAULT_USERS]
    }

    const usersByEmail = new Map(parsed.map((user) => [normalize(user.email), user]))
    DEFAULT_USERS.forEach((defaultUser) => {
      if (!usersByEmail.has(normalize(defaultUser.email))) {
        usersByEmail.set(normalize(defaultUser.email), defaultUser)
      }
    })

    const mergedUsers = [...usersByEmail.values()]
    localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers))

    return mergedUsers
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
    return [...DEFAULT_USERS]
  }
}

function writeUsersToStorage(users: AuthUser[]): void {
  if (!canUseStorage) {
    return
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readCurrentUserFromStorage(users: AuthUser[]): AuthUser | null {
  if (!canUseStorage) {
    return null
  }

  const currentUserId =
    sessionStorage.getItem(CURRENT_USER_KEY) ?? localStorage.getItem(CURRENT_USER_KEY)
  if (!currentUserId) {
    return null
  }

  return users.find((user) => user.id === currentUserId) ?? null
}

function persistCurrentUser(userId: string, remember: boolean): void {
  if (!canUseStorage) {
    return
  }

  if (remember) {
    localStorage.setItem(CURRENT_USER_KEY, userId)
    sessionStorage.removeItem(CURRENT_USER_KEY)
    return
  }

  sessionStorage.setItem(CURRENT_USER_KEY, userId)
  localStorage.removeItem(CURRENT_USER_KEY)
}

function clearCurrentUser(): void {
  if (!canUseStorage) {
    return
  }

  localStorage.removeItem(CURRENT_USER_KEY)
  sessionStorage.removeItem(CURRENT_USER_KEY)
}

const apiUserToAuthUser = (user: UserApiResponse, password = ''): AuthUser => ({
  id: `u-${user.id_usuario}`,
  fullName: user.nome,
  email: user.email,
  username: user.email.split('@')[0] || user.nome.toLowerCase().replaceAll(' ', '.'),
  password,
  role: user.admin ? 'administrador' : 'usuario',
})

const resolveEmailFromIdentifier = (identifier: string, localUsers: AuthUser[]): string => {
  if (identifier.includes('@')) {
    return identifier
  }

  const localUser = localUsers.find((user) => normalize(user.username) === identifier)
  return localUser?.email ?? identifier
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref<AuthUser[]>(readUsersFromStorage())
  const currentUser = ref<AuthUser | null>(readCurrentUserFromStorage(users.value))

  const isAuthenticated = computed(() => currentUser.value !== null)

  async function register(input: RegisterInput): Promise<LoginResult> {
    const fullName = input.fullName.trim()
    const email = normalize(input.email)

    if (!fullName || !email || !input.password || !input.confirmPassword) {
      return { ok: false, message: 'Preencha todos os campos obrigatorios.' }
    }

    if (input.password.length < 6) {
      return { ok: false, message: 'A senha deve ter ao menos 6 caracteres.' }
    }

    if (input.password !== input.confirmPassword) {
      return { ok: false, message: 'As senhas nao coincidem.' }
    }

    try {
      const role: UserRole = input.admin ? 'administrador' : 'usuario'

      const payload: RegisterApiPayload = {
        nome: fullName,
        email,
        senha: input.password,
        admin: input.admin,
      }

      const { data } = await httpClient.post<RegisterApiResponse>(apiRoutes.usuarios.list, payload)

      const emailAlreadyExists = users.value.some((user) => normalize(user.email) === email)
      if (!emailAlreadyExists) {
        const generatedUser: AuthUser = {
          id: data?.id_usuario ? `u-${data.id_usuario}` : `u-${Date.now()}`,
          fullName: data?.nome ?? fullName,
          email: data?.email ?? email,
          username: email.split('@')[0] || fullName.toLowerCase().replaceAll(' ', '.'),
          password: input.password,
          role: data?.admin ?? input.admin ? 'administrador' : role,
        }

        users.value = [...users.value, generatedUser]
        writeUsersToStorage(users.value)
      }

      return { ok: true, message: 'Conta criada com sucesso.' }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          return {
            ok: false,
            message: 'Nao foi possivel conectar com a API. Verifique se o backend esta online.',
          }
        }

        if (error.response.status === 400 || error.response.status === 409) {
          return { ok: false, message: 'Ja existe uma conta com este email.' }
        }

        return {
          ok: false,
          message: `Falha ao cadastrar usuario (erro ${error.response.status}).`,
        }
      }

      return { ok: false, message: 'Nao foi possivel concluir o cadastro.' }
    }
  }

  async function login(identifier: string, password: string, remember: boolean): Promise<LoginResult> {
    const normalizedIdentifier = normalize(identifier)
    const email = resolveEmailFromIdentifier(normalizedIdentifier, users.value)

    if (!email || !password) {
      return { ok: false, message: 'Informe usuario/email e senha.' }
    }

    try {
      const { data: loginData } = await httpClient.post<LoginApiResponse>(apiRoutes.usuarios.login, {
        email,
        senha: password,
      })

      let foundUser = loginData.dados_usuario
        ? apiUserToAuthUser(loginData.dados_usuario, password)
        : users.value.find((user) => normalize(user.email) === email)

      if (!foundUser) {
        try {
        const { data: apiUsers } = await httpClient.get<UserApiResponse[]>(apiRoutes.usuarios.list)
        const apiUser = apiUsers.find((user) => normalize(user.email) === email)

        if (apiUser) {
          foundUser = apiUserToAuthUser(apiUser, password)
        }
        } catch (error) {
          console.error('Erro ao carregar usuario logado:', error)
        }
      }

      if (!foundUser) {
        foundUser = {
          id: `u-${Date.now()}`,
          fullName: loginData.usuario ?? email,
          email,
          username: email.split('@')[0] ?? email,
          password,
          role: 'usuario',
        }
      }

      const authenticatedUser = foundUser
      const otherUsers = users.value.filter((user) => normalize(user.email) !== email)
      users.value = [...otherUsers, authenticatedUser]
      writeUsersToStorage(users.value)

      currentUser.value = authenticatedUser
      persistCurrentUser(authenticatedUser.id, remember)

      return { ok: true, message: loginData.mensagem ?? 'Login realizado com sucesso.' }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          return {
            ok: false,
            message: 'Nao foi possivel conectar com a API. Verifique se o backend esta online.',
          }
        }

        const data = error.response.data as { erro?: string }
        return {
          ok: false,
          message: data?.erro ?? `Falha ao entrar (erro ${error.response.status}).`,
        }
      }

      return { ok: false, message: 'Nao foi possivel concluir o login.' }
    }
  }

  function logout(): void {
    currentUser.value = null
    clearCurrentUser()
  }

  return {
    users,
    currentUser,
    isAuthenticated,
    register,
    login,
    logout,
  }
})
