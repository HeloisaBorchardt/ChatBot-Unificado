<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ChatSidebar from '../../Chatbot/components/ChatSidebar.vue'
import type { RecentChat } from '../../Chatbot/entities/chat'
import { useAuthStore } from '../../../stores/useAuthStore'
import { httpClient } from '../../../api/client'

interface UsuarioApi {
  id_usuario: number
  nome: string
  email: string
  data_cadastro: string
  ultimo_acesso?: string | null
  admin: boolean
  perfil?: number
}

const router = useRouter()
const authStore = useAuthStore()
const recentChats = ref<RecentChat[]>([])
const busca = ref('')
const carregando = ref(false)
const erro = ref('')
const usuarios = ref<UsuarioApi[]>([])

const isEditModalOpen = ref(false)
const usuarioEditando = ref<UsuarioApi | null>(null)
const usuarioEditForm = ref({
  nome: '',
  email: '',
  senha: '',
  perfil: 2,
})
const isSavingUsuario = ref(false)
const erroEdicao = ref('')
const isDeletingUsuario = ref<number | null>(null)

const formatarData = (valor?: string | null): string => {
  if (!valor) return '-'

  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data)
}

const mapearPerfil = (perfil: number): string => {
  if (perfil === 1) return 'Admin'
  return 'Usuario'
}

const obterPerfil = (usuario: UsuarioApi): number => usuario.perfil ?? (usuario.admin ? 1 : 2)

const usuariosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return usuarios.value

  return usuarios.value.filter((usuario) => {
    return (
      String(usuario.id_usuario).includes(termo) ||
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo)
    )
  })
})

const totalUsuarios = computed(() => usuarios.value.length)

const parseDataApi = (valor: string): number => {
  // Backend pode enviar microssegundos (ex: .898000Z), normalizamos para milissegundos.
  const normalizado = valor.replace(/(\.\d{3})\d+(Z)$/i, '$1$2')
  const timestamp = Date.parse(normalizado)
  return Number.isNaN(timestamp) ? Number.NaN : timestamp
}

const ativosAgora = computed(() => {
  const janelaMs = 5 * 60 * 1000 // 5 minutos (ativo no momento)
  const agora = Date.now()

  const ativos = usuarios.value.filter((usuario) => {
    if (!usuario.ultimo_acesso) return false

    const ultimoAcesso = parseDataApi(usuario.ultimo_acesso)
    if (Number.isNaN(ultimoAcesso)) return false

    const diferenca = agora - ultimoAcesso
    return diferenca >= 0 && diferenca <= janelaMs
  })

  return ativos.length
})

const carregarUsuarios = async () => {
  carregando.value = true
  erro.value = ''

  try {
    const { data } = await httpClient.get<UsuarioApi[]>('/usuarios/')
    usuarios.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao carregar usuarios:', error)

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        erro.value =
          'Nao foi possivel conectar com a API. Verifique se o backend esta rodando e se a URL da API esta correta.'
      } else {
        erro.value = `A API respondeu com erro ${error.response.status}. Tente novamente em instantes.`
      }
    } else {
      erro.value = 'Nao foi possivel carregar os usuarios agora.'
    }
  } finally {
    carregando.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

const deletarUsuario = async (usuario: UsuarioApi) => {
  const confirmar = window.confirm(`Tem certeza que deseja deletar o usuário "${usuario.nome}"?`)
  if (!confirmar) return

  isDeletingUsuario.value = usuario.id_usuario
  erro.value = ''

  try {
    await httpClient.delete(`/usuarios/${usuario.id_usuario}/`)

    usuarios.value = usuarios.value.filter((u) => u.id_usuario !== usuario.id_usuario)
    erro.value = 'Usuário deletado com sucesso!'

    setTimeout(() => {
      erro.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        erro.value = 'Não foi possível conectar com a API. Verifique se o backend está rodando.'
      } else {
        erro.value = `Erro ${error.response.status} ao deletar usuário.`
      }
    } else {
      erro.value = 'Não foi possível deletar o usuário agora.'
    }
  } finally {
    isDeletingUsuario.value = null
  }
}

const abrirModalEdicao = (usuario: UsuarioApi) => {
  console.log('Abrindo modal de edição para:', usuario)
  usuarioEditando.value = usuario
  usuarioEditForm.value = {
    nome: usuario.nome,
    email: usuario.email,
    senha: '',
    perfil: obterPerfil(usuario),
  }
  erroEdicao.value = ''
  isEditModalOpen.value = true
  console.log('Modal aberta. isEditModalOpen:', isEditModalOpen.value)
}

const fecharModalEdicao = () => {
  isEditModalOpen.value = false
  usuarioEditando.value = null
  usuarioEditForm.value = {
    nome: '',
    email: '',
    senha: '',
    perfil: 2,
  }
  erroEdicao.value = ''
}

const salvarUsuario = async () => {
  console.log('Salvando usuário...')
  if (!usuarioEditando.value) {
    console.error('Nenhum usuário em edição')
    return
  }

  const nome = usuarioEditForm.value.nome.trim()
  const email = usuarioEditForm.value.email.trim()
  const senhaInput = usuarioEditForm.value.senha.trim()

  console.log('Dados do formulário:', {
    nome,
    email,
    senhaInput,
    perfil: usuarioEditForm.value.perfil,
  })

  if (!nome || !email) {
    erroEdicao.value = 'Nome e email são obrigatórios.'
    return
  }

  isSavingUsuario.value = true
  erroEdicao.value = ''

  try {
    // Constrói payload apenas com campos que foram modificados
    const payload: Record<string, string | boolean> = {
      nome,
      email,
      admin: usuarioEditForm.value.perfil === 1,
    }

    // Só envia senha se o usuário digitou algo novo
    if (senhaInput.length > 0) {
      payload.senha = senhaInput
      console.log('Enviando nova senha')
    } else {
      console.log('Mantendo senha antiga (campo vazio)')
    }

    // ANTES
    const usuarioAntes = usuarios.value.find(
      (u) => u.id_usuario === usuarioEditando.value!.id_usuario,
    )
    console.log('📝 ANTES de salvar:', {
      id: usuarioAntes?.id_usuario,
      nome: usuarioAntes?.nome,
      email: usuarioAntes?.email,
    })

    console.log('Enviando PATCH para:', `/usuarios/${usuarioEditando.value.id_usuario}/`)

    const response = await httpClient.patch(
      `/usuarios/${usuarioEditando.value.id_usuario}/`,
      payload,
    )
    console.log('✅ Resposta da API:', response.status)

    // Sempre recarrega da API para sincronizar
    console.log('🔄 Recarregando usuários...')
    await carregarUsuarios()

    fecharModalEdicao()
    erro.value = 'Usuário atualizado com sucesso!'
    setTimeout(() => {
      erro.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)

    if (axios.isAxiosError(error)) {
      console.error('Erro Axios - Response:', error.response?.data)
      console.error('Erro Axios - Status:', error.response?.status)

      if (!error.response) {
        erroEdicao.value =
          'Não foi possível conectar com a API. Verifique se o backend está rodando.'
      } else {
        erroEdicao.value = `Erro ${error.response.status} ao atualizar usuário. ${
          error.response.data?.detail || error.response.statusText || ''
        }`
      }
    } else {
      erroEdicao.value = 'Não foi possível atualizar o usuário agora.'
    }
  } finally {
    isSavingUsuario.value = false
  }
}

onMounted(() => {
  carregarUsuarios()
})
</script>

<template>
  <main class="access-page">
    <ChatSidebar section="admin" :recent-chats="recentChats" />

    <section class="access-content">
      <header class="access-page__header">
        <div>
          <h1>Controle de Acesso</h1>
          <p>Gestao de usuarios cadastrados no sistema.</p>
        </div>

        <div class="access-page__header-actions">
          <button
            type="button"
            class="btn btn--ghost"
            @click="carregarUsuarios"
            :disabled="carregando"
          >
            Atualizar
          </button>
          <button type="button" class="btn btn--primary" @click="handleLogout">Sair</button>
        </div>
      </header>

      <section class="stats-grid">
        <article class="stat-card">
          <p class="stat-card__value">{{ totalUsuarios }}</p>
          <p class="stat-card__label">Total de usuarios</p>
        </article>

        <article class="stat-card">
          <p class="stat-card__value">{{ ativosAgora }}</p>
          <p class="stat-card__label">Ativos no momento</p>
        </article>
      </section>

      <section class="toolbar">
        <input
          v-model="busca"
          type="text"
          class="toolbar__search"
          placeholder="Buscar por id, nome ou email"
        />
      </section>

      <section class="table-card">
        <p v-if="erro" class="feedback feedback--error">{{ erro }}</p>
        <p v-else-if="carregando" class="feedback">Carregando usuarios...</p>
        <p v-else-if="!usuariosFiltrados.length" class="feedback">Nenhum usuario encontrado.</p>

        <div v-else class="table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Cadastro</th>
                <th>Ultimo acesso</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosFiltrados" :key="usuario.id_usuario">
                <td>#{{ usuario.id_usuario }}</td>
                <td>{{ usuario.nome }}</td>
                <td>{{ usuario.email }}</td>
                <td>{{ formatarData(usuario.data_cadastro) }}</td>
                <td>{{ formatarData(usuario.ultimo_acesso) }}</td>
                <td>
                  <span
                    class="role-pill"
                    :class="{
                      'role-pill--admin': obterPerfil(usuario) === 1,
                      'role-pill--user': obterPerfil(usuario) === 2,
                    }"
                  >
                    {{ mapearPerfil(obterPerfil(usuario)) }}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    class="btn-action"
                    @click="abrirModalEdicao(usuario)"
                    title="Editar usuário"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn-action btn-action--delete"
                    @click="deletarUsuario(usuario)"
                    :disabled="isDeletingUsuario === usuario.id_usuario"
                    title="Deletar usuário"
                  >
                    {{ isDeletingUsuario === usuario.id_usuario ? 'Deletando...' : 'Deletar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="fecharModalEdicao">
      <div class="modal-content">
        <header class="modal-header">
          <h2>Editar Usuário - {{ usuarioEditando?.nome || 'Carregando...' }}</h2>
          <button type="button" class="modal-close" @click="fecharModalEdicao">✕</button>
        </header>

        <section class="modal-body">
          <p v-if="erroEdicao" class="feedback feedback--error">{{ erroEdicao }}</p>

          <div class="form-group">
            <label for="edit-nome">Nome *</label>
            <input
              id="edit-nome"
              v-model="usuarioEditForm.nome"
              type="text"
              class="form-input"
              placeholder="Nome do usuário"
            />
          </div>

          <div class="form-group">
            <label for="edit-email">Email *</label>
            <input
              id="edit-email"
              v-model="usuarioEditForm.email"
              type="email"
              class="form-input"
              placeholder="email@exemplo.com"
            />
          </div>

          <div class="form-group">
            <label for="edit-senha">Senha (deixe em branco para manter a atual)</label>
            <input
              id="edit-senha"
              v-model="usuarioEditForm.senha"
              type="password"
              class="form-input"
              placeholder="Digite a nova senha ou deixe em branco"
            />
          </div>

          <div class="form-group">
            <label for="edit-perfil">Perfil</label>
            <select id="edit-perfil" v-model.number="usuarioEditForm.perfil" class="form-input">
              <option :value="1">Admin</option>
              <option :value="2">Usuário</option>
            </select>
          </div>
        </section>

        <footer class="modal-footer">
          <button type="button" class="btn btn--ghost" @click="fecharModalEdicao">Cancelar</button>
          <button
            type="button"
            class="btn btn--primary"
            @click="salvarUsuario"
            :disabled="isSavingUsuario"
          >
            {{ isSavingUsuario ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </footer>
      </div>
    </div>
  </main>
</template>

<style scoped src="./AccessControlView.css"></style>
