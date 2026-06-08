<template>
  <main class="login-page">
    <section class="login-card" aria-label="Acesso ao sistema">
      <header class="login-header">
        <h1>ED Chatbot</h1>
        <p>Apoio a Decisao em Editais</p>
      </header>

      <h2>Acesso ao Sistema</h2>

      <form class="login-form" @submit.prevent="handleLogin">
        <label for="user">Email ou Usuario:</label>
        <div class="input-wrap">
          <span class="input-icon" aria-hidden="true">@</span>
          <input
            id="user"
            v-model="identifier"
            type="text"
            name="user"
            autocomplete="username"
            placeholder="Digite seu email ou usuario"
          />
        </div>

        <label for="password">Senha:</label>
        <div class="input-wrap">
          <span class="input-icon" aria-hidden="true">*</span>
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="Digite sua senha"
          />
        </div>

        <label class="remember-me" for="remember">
          <input id="remember" v-model="remember" type="checkbox" name="remember" />
          <span>Lembrar-me</span>
        </label>

        <p
          v-if="statusMessage"
          :class="['status-message', statusIsError && 'status-message--error']"
        >
          {{ statusMessage }}
        </p>

        <p class="mock-hint">
          Teste: admin@edchatbot.com / 123456 ou usuario@edchatbot.com / 123456
        </p>

        <button type="submit" class="btn-enter">ENTRAR</button>

        <div class="quick-login-actions">
          <button type="button" class="btn-secondary" @click="loginAsAdmin">
            <span class="social-icon">A</span>
            <span>Entrar como administrador</span>
          </button>
          <button type="button" class="btn-secondary" @click="loginAsUser">
            <span class="social-icon">U</span>
            <span>Entrar como usuario</span>
          </button>
        </div>

        <div class="divider" aria-hidden="true"></div>

        <button type="button" class="btn-link">Esqueci minha senha</button>
        <button type="button" class="btn-link" @click="goToCadastro">Criar nova conta</button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const identifier = ref('')
const password = ref('')
const remember = ref(false)
const statusMessage = ref('')
const statusIsError = ref(false)

const goToCadastro = () => {
  router.push({ name: 'cadastro' })
}

const loginWithMockUser = async (mockIdentifier: string, mockPassword: string) => {
  identifier.value = mockIdentifier
  password.value = mockPassword
  await handleLogin()
}

const loginAsAdmin = () => {
  loginWithMockUser('admin@edchatbot.com', '123456')
}

const loginAsUser = () => {
  loginWithMockUser('usuario@edchatbot.com', '123456')
}

const handleLogin = async () => {
  const result = await authStore.login(identifier.value, password.value, remember.value)
  statusMessage.value = result.message
  statusIsError.value = !result.ok

  if (!result.ok || !authStore.currentUser) {
    return
  }

  const redirectTarget =
    authStore.currentUser.role === 'administrador' ? 'admin-documentos' : 'chatbot'
  router.push({ name: redirectTarget })
}
</script>

<style scoped>
.login-page {
  --wine-900: #5e262d;
  --wine-700: #762f37;
  --wine-500: #946169;
  --rose-300: #b29499;
  --fog-100: #e6e6e8;
  --ink-900: #1f2024;

  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background:
    radial-gradient(circle at 15% 15%, #ffffff 0%, transparent 42%),
    radial-gradient(circle at 85% 88%, #f2dce0 0%, transparent 38%),
    linear-gradient(155deg, #dbdcdf 0%, var(--fog-100) 45%, #d7d8dc 100%);
  font-family: Montserrat, 'Segoe UI', Tahoma, sans-serif;
}

.login-card {
  width: min(100%, 24rem);
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgb(236 236 238 / 90%);
  box-shadow:
    0 20px 45px rgb(31 32 36 / 16%),
    inset 0 1px 0 rgb(255 255 255 / 58%);
  backdrop-filter: blur(4px);
}

.login-header {
  text-align: center;
  color: var(--ink-900);
}

.login-header h1 {
  font-size: clamp(2rem, 7vw, 2.5rem);
  line-height: 1;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.login-header p {
  margin-top: 0.35rem;
  font-size: clamp(1.12rem, 4.2vw, 1.65rem);
  font-weight: 800;
  line-height: 1.1;
}

h2 {
  margin-top: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 900;
  color: var(--ink-900);
}

.login-form {
  display: grid;
  gap: 0.8rem;
}

label {
  font-size: 1.34rem;
  font-weight: 800;
  color: var(--ink-900);
}

.input-wrap {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  border-radius: 0.5rem;
  background: var(--wine-500);
}

.input-icon {
  margin-left: 0.45rem;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #f2ebed;
  color: var(--wine-700);
  font-size: 0.9rem;
  font-weight: 900;
}

input[type='text'],
input[type='password'] {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.58rem 0.75rem;
}

input[type='text']::placeholder,
input[type='password']::placeholder {
  color: rgb(255 255 255 / 72%);
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.05rem;
  font-size: 1.08rem;
}

.remember-me input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--wine-700);
}

.status-message {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2f7f3a;
}

.status-message--error {
  color: #9f2c38;
}

.mock-hint {
  font-size: 0.86rem;
  font-weight: 700;
  color: #4b4f56;
}

.btn-enter {
  justify-self: center;
  border: 0;
  margin-top: 0.25rem;
  padding: 0.62rem 1.85rem;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--wine-700), var(--wine-900));
  color: #fff;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    transform 150ms ease,
    filter 150ms ease;
}

.btn-enter:hover {
  transform: translateY(-1px) scale(1.01);
  filter: brightness(1.06);
}

.quick-login-actions {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.78rem;
}

.btn-secondary {
  border: 0;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--rose-300);
  color: #121316;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.52rem 0.75rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: filter 150ms ease;
}

.btn-secondary:hover {
  filter: brightness(0.97);
}

.social-icon {
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 999px;
  background: #f4f4f4;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #40434a;
}

.divider {
  margin: 0.7rem 0 0.3rem;
  width: 100%;
  height: 1px;
  background: rgb(26 27 30 / 30%);
}

.btn-link {
  border: 0;
  margin: 0 auto;
  width: calc(100% - 2.6rem);
  border-radius: 0.45rem;
  padding: 0.48rem 0.9rem;
  background: #b99fa4;
  color: #f9f9f9;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

@media (min-width: 760px) {
  .login-card {
    width: min(100%, 31.5rem);
    padding: 2rem 2.2rem;
  }

  .login-header h1 {
    font-size: 3.3rem;
  }

  .login-header p {
    font-size: 2rem;
  }

  h2 {
    font-size: 2.15rem;
    margin-top: 1.35rem;
  }

  label {
    font-size: 1.45rem;
  }

  .btn-link {
    width: calc(100% - 3.8rem);
  }
}
</style>
