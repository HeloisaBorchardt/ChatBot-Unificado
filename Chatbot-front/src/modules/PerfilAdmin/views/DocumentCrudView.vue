<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ChatSidebar from '../../Chatbot/components/ChatSidebar.vue'
import type { RecentChat } from '../../Chatbot/entities/chat'
import { useAuthStore } from '../../../stores/useAuthStore'
import { httpClient } from '../../../api/client'
import { apiRoutes } from '../../../api/routes'

interface Documento {
  id: number
  titulo: string
  tipo: string
  arquivoNome: string
  arquivoTamanho: number
  dataInsercao: string
}

interface DocumentoApiResponse {
  id_documento?: number
  nome?: string
  arquivo?: string
  data_insercao?: string
}

interface DocumentoApiItem {
  id_documento: number
  nome: string
  arquivo?: string
  data_insercao: string
}

const router = useRouter()
const authStore = useAuthStore()
const recentChats = ref<RecentChat[]>([])
const busca = ref('')
const isUploadModalOpen = ref(false)
const isSavingDocument = ref(false)
const documentError = ref('')
const documentSuccess = ref('')
const documentName = ref('')
const selectedFile = ref<File | null>(null)

const documentos = ref<Documento[]>([])

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDraggingFile = ref(false)

const documentosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return documentos.value

  return documentos.value.filter((doc) => {
    return (
      doc.titulo.toLowerCase().includes(termo) ||
      doc.tipo.toLowerCase().includes(termo) ||
      doc.arquivoNome.toLowerCase().includes(termo)
    )
  })
})

const formatarTamanhoArquivo = (tamanho: number): string => {
  if (tamanho < 1024) return `${tamanho} B`
  if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`
  return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`
}

const formatarDataInsercao = (valor: string): string => {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data)
}

const selecionarArquivo = (event: Event) => {
  const input = event.target as HTMLInputElement
  processarArquivo(input.files?.[0] ?? null)
}

const obterTituloArquivo = (nomeArquivo: string): string => {
  const ponto = nomeArquivo.lastIndexOf('.')
  if (ponto <= 0) return nomeArquivo
  return nomeArquivo.slice(0, ponto)
}

const processarArquivo = (arquivo: File | null) => {
  if (!arquivo) return

  selectedFile.value = arquivo
  documentName.value = obterTituloArquivo(arquivo.name)
  documentError.value = ''
  documentSuccess.value = ''
}

const criarDocumento = async () => {
  const nome = documentName.value.trim()
  if (!nome || isSavingDocument.value) {
    return
  }

  isSavingDocument.value = true
  documentError.value = ''
  documentSuccess.value = ''

  try {
    const dataInsercao = new Date().toISOString()
    const payload = new FormData()
    payload.append('nome', nome)

    if (selectedFile.value) {
      payload.append('arquivo', selectedFile.value)
    }

    const { data } = await httpClient.post<DocumentoApiResponse>(apiRoutes.documentos.list, payload)

    const novoDocumento: Documento = {
      id: data.id_documento ?? Date.now(),
      titulo: data.nome ?? nome,
      tipo: 'DOCUMENTO',
      arquivoNome: selectedFile.value?.name ?? data.arquivo?.split('/').pop() ?? data.nome ?? nome,
      arquivoTamanho: selectedFile.value?.size ?? 0,
      dataInsercao: data.data_insercao ?? dataInsercao,
    }

    documentos.value.unshift(novoDocumento)
    documentSuccess.value = 'Documento cadastrado com sucesso.'

    isUploadModalOpen.value = false
    documentName.value = ''
    selectedFile.value = null

    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    console.error('Erro ao cadastrar documento:', error)

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        documentError.value =
          'Nao foi possivel conectar com a API. Verifique se o backend esta online.'
      } else {
        documentError.value = `Falha ao cadastrar documento (erro ${error.response.status}).`
      }
    } else {
      documentError.value = 'Nao foi possivel cadastrar o documento agora.'
    }
  } finally {
    isSavingDocument.value = false
  }
}

const carregarDocumentos = async () => {
  documentError.value = ''

  try {
    const { data } = await httpClient.get<DocumentoApiItem[]>(apiRoutes.documentos.list)

    documentos.value = Array.isArray(data)
      ? data.map((item) => ({
          id: item.id_documento,
          titulo: item.nome,
          tipo: 'DOCUMENTO',
          arquivoNome: item.arquivo?.split('/').pop() ?? `${item.nome}.pdf`,
          arquivoTamanho: 0,
          dataInsercao: item.data_insercao,
        }))
      : []
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        documentError.value =
          'Nao foi possivel conectar com a API. Verifique se o backend esta online.'
      } else {
        documentError.value = `Falha ao carregar documentos (erro ${error.response.status}).`
      }
    } else {
      documentError.value = 'Nao foi possivel carregar os documentos agora.'
    }
  }
}

const abrirSeletorArquivo = () => {
  fileInputRef.value?.click()
}

const abrirModalUpload = () => {
  isUploadModalOpen.value = true
  documentError.value = ''
  documentSuccess.value = ''
}

const fecharModalUpload = () => {
  isUploadModalOpen.value = false
  isDraggingFile.value = false
  documentError.value = ''
  documentSuccess.value = ''
  documentName.value = ''
  selectedFile.value = null

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const aoArrastarSobre = () => {
  isDraggingFile.value = true
}

const aoSairDaArea = () => {
  isDraggingFile.value = false
}

const aoSoltarArquivo = (event: DragEvent) => {
  isDraggingFile.value = false
  const arquivo = event.dataTransfer?.files?.[0] ?? null
  processarArquivo(arquivo)
}

const onDocumentNameChange = () => {
  documentError.value = ''
  documentSuccess.value = ''
}

const removerDocumento = async (id: number) => {
  const confirmed = window.confirm('Deseja excluir este documento?')
  if (!confirmed) {
    return
  }

  documentError.value = ''
  documentSuccess.value = ''

  try {
    await httpClient.delete(apiRoutes.documentos.detail(id))
    documentSuccess.value = 'Documento excluido com sucesso.'
    await carregarDocumentos()
  } catch (error) {
    console.error('Erro ao excluir documento:', error)

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        documentError.value =
          'Nao foi possivel conectar com a API. Verifique se o backend esta online.'
      } else {
        documentError.value = `Falha ao excluir documento (erro ${error.response.status}).`
      }
    } else {
      documentError.value = 'Nao foi possivel excluir o documento agora.'
    }
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

onMounted(() => {
  carregarDocumentos()
})
</script>

<template>
  <main class="admin-page">
    <ChatSidebar section="admin" :recent-chats="recentChats" />

    <section class="admin-content">
      <header class="admin-page__header">
        <div>
          <h1>Admin de Documentos</h1>
          <p>Visualizacao e gerenciamento de documentos.</p>
        </div>

        <div class="admin-page__header-actions">
          <button type="button" class="btn btn--primary" @click="abrirModalUpload">
            + Novo documento
          </button>
          <button type="button" class="admin-page__back" @click="handleLogout">Sair</button>
        </div>
      </header>

      <section class="admin-toolbar">
        <input
          v-model="busca"
          type="text"
          class="admin-toolbar__search"
          placeholder="Buscar por titulo, tipo ou arquivo"
        />
      </section>

      <section class="admin-grid">
        <article class="card">
          <h2>Documentos cadastrados</h2>

          <p v-if="documentError" class="feedback feedback--error">{{ documentError }}</p>
          <p v-else-if="documentSuccess" class="feedback feedback--success">
            {{ documentSuccess }}
          </p>

          <p v-if="!documentosFiltrados.length" class="empty">Nenhum documento encontrado.</p>

          <ul v-else class="doc-list">
            <li v-for="doc in documentosFiltrados" :key="doc.id" class="doc-list__item">
              <div>
                <p class="doc-list__title">{{ doc.titulo }}</p>
                <p class="doc-list__meta">{{ doc.tipo }}</p>
                <p class="doc-list__file">
                  Arquivo: {{ doc.arquivoNome }}
                  <span>({{ formatarTamanhoArquivo(doc.arquivoTamanho) }})</span>
                </p>
                <p class="doc-list__meta">
                  Inserido em: {{ formatarDataInsercao(doc.dataInsercao) }}
                </p>
              </div>

              <div class="doc-list__actions">
                <button type="button" class="btn btn--danger" @click="removerDocumento(doc.id)">
                  Excluir
                </button>
              </div>
            </li>
          </ul>
        </article>
      </section>

      <div v-if="isUploadModalOpen" class="modal" @click.self="fecharModalUpload">
        <section class="modal__card" role="dialog" aria-modal="true" aria-label="Novo documento">
          <header class="modal__header">
            <h2>Novo documento</h2>
            <button type="button" class="modal__close" @click="fecharModalUpload">Fechar</button>
          </header>

          <section class="crud-form">
            <label>
              <span>Nome do documento</span>
              <input
                v-model="documentName"
                type="text"
                placeholder="Ex.: Edital 2026"
                @input="onDocumentNameChange"
              />
            </label>

            <label>
              <span>Selecionar arquivo para preencher o nome</span>
              <div
                class="upload-dropzone"
                :class="{ 'upload-dropzone--dragging': isDraggingFile }"
                @click="abrirSeletorArquivo"
                @dragover.prevent="aoArrastarSobre"
                @dragleave.prevent="aoSairDaArea"
                @drop.prevent="aoSoltarArquivo"
              >
                <p class="upload-dropzone__title">Arraste e solte o arquivo aqui</p>
                <p class="upload-dropzone__subtitle">
                  ou clique para selecionar no computador. O nome do arquivo sera usado no cadastro.
                </p>
              </div>
              <input
                ref="fileInputRef"
                class="upload-dropzone__input"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                @change="selecionarArquivo"
              />
            </label>

            <small class="crud-form__file-info"
              >O arquivo sera enviado para o backend e vetorizado automaticamente.</small
            >

            <div class="crud-form__actions">
              <button type="button" class="btn btn--ghost" @click="fecharModalUpload">
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn--primary"
                @click="criarDocumento"
                :disabled="isSavingDocument || !documentName.trim()"
              >
                {{ isSavingDocument ? 'Salvando...' : 'Salvar documento' }}
              </button>
            </div>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped src="./DocumentCrudView.css"></style>
