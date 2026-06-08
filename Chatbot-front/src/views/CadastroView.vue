<template>
  <main class="signup-page">
    <section class="signup-card" aria-label="Criar conta">
      <header class="signup-header">
        <h1>ED Chatbot</h1>
        <p>Apoio a Decisao em Editais</p>
      </header>

      <h2>Criar Conta</h2>

      <form class="signup-form" @submit.prevent="handleRegister">
        <label for="full-name">Nome Completo:</label>
        <input
          id="full-name"
          v-model="fullName"
          type="text"
          name="full-name"
          autocomplete="name"
          placeholder="Seu nome"
        />

        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="voce@exemplo.com"
        />

        <label for="password">Senha:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="new-password"
          placeholder="Minimo 6 caracteres"
        />

        <label for="confirm-password">Confirmar Senha:</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          name="confirm-password"
          autocomplete="new-password"
          placeholder="Repita sua senha"
        />

        <label class="role-option" for="is-admin">
          <input id="is-admin" v-model="isAdmin" type="checkbox" name="admin" />
          <span>Administrador</span>
        </label>

        <p
          v-if="statusMessage"
          :class="['status-message', statusIsError && 'status-message--error']"
        >
          {{ statusMessage }}
        </p>

        <button type="submit" class="btn-register" :disabled="isSubmitting">
          {{ isSubmitting ? 'CADASTRANDO...' : 'CADASTRAR' }}
        </button>

        <p class="login-text">
          Ja possui conta?
          <button type="button" class="btn-inline-link" @click="goToLogin">Entrar</button>
        </p>
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

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isAdmin = ref(false)
const statusMessage = ref('')
const statusIsError = ref(false)
const isSubmitting = ref(false)

const goToLogin = () => {
  router.push({ name: 'login' })
}

const handleRegister = async () => {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  const result = await authStore.register({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    admin: isAdmin.value,
  })

  statusMessage.value = result.message
  statusIsError.value = !result.ok

  if (!result.ok) {
    isSubmitting.value = false
    return
  }

  fullName.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  isAdmin.value = false

  setTimeout(() => {
    router.push({ name: 'login' })
  }, 650)

  isSubmitting.value = false
}
</script>

<style scoped>
.signup-page {
  --wine-900: #5e262d;
  --wine-700: #762f37;
  --wine-500: #946169;
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

.signup-card {
  width: min(100%, 24rem);
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgb(236 236 238 / 90%);
  box-shadow:
    0 20px 45px rgb(31 32 36 / 16%),
    inset 0 1px 0 rgb(255 255 255 / 58%);
  backdrop-filter: blur(4px);
}

.signup-header {
  text-align: center;
  color: var(--ink-900);
}

.signup-header h1 {
  font-size: clamp(2rem, 7vw, 2.5rem);
  line-height: 1;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.signup-header p {
  margin-top: 0.35rem;
  font-size: clamp(1.12rem, 4.2vw, 1.65rem);
  font-weight: 800;
  line-height: 1.1;
}

h2 {
  margin-top: 1.15rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 2.05rem;
  font-weight: 900;
  color: var(--ink-900);
}

.signup-form {
  display: grid;
  gap: 0.66rem;
}

label,
.access-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ink-900);
}

.access-title {
  margin-top: 0.4rem;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  border: 0;
  outline: 0;
  border-radius: 0.5rem;
  background: var(--wine-500);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
}

input[type='text']::placeholder,
input[type='email']::placeholder,
input[type='password']::placeholder {
  color: rgb(255 255 255 / 72%);
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.1rem;
}

.role-option input {
  width: 1.45rem;
  height: 1.45rem;
  margin: 0;
  border-radius: 0.2rem;
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

.btn-register {
  justify-self: center;
  margin-top: 0.7rem;
  border: 0;
  border-radius: 999px;
  padding: 0.68rem 1.85rem;
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

.btn-register:hover {
  transform: translateY(-1px) scale(1.01);
  filter: brightness(1.06);
}

.btn-register:disabled {
  cursor: wait;
  opacity: 0.78;
  transform: none;
}

.login-text {
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111216;
}

.btn-inline-link {
  border: 0;
  background: transparent;
  color: #2f46d8;
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
  margin-left: 0.2rem;
}

@media (min-width: 760px) {
  .signup-card {
    width: min(100%, 31rem);
    padding: 2rem 2.2rem;
  }

  .signup-header h1 {
    font-size: 3.3rem;
  }

  .signup-header p {
    font-size: 2rem;
  }

  h2 {
    font-size: 2.15rem;
    margin-top: 1.35rem;
  }

  label,
  .access-title,
  .role-option {
    font-size: 1.45rem;
  }
}
</style>
