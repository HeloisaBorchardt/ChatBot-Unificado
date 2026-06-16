<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ChatSidebar from '../../Chatbot/components/ChatSidebar.vue'
import type { RecentChat } from '../../Chatbot/entities/chat'
import { useAuthStore } from '../../../stores/useAuthStore'
import { httpClient } from '../../../api/client'
import { apiRoutes } from '../../../api/routes'

type StatusResposta = 'sucesso' | 'falha' | 'ambigua'
type AvaliacaoManual = 'aprovada' | 'rejeitada' | 'pendente'

interface InteracaoMock {
  id: number
  usuario: string
  pergunta: string
  perguntaProcessada: string
  status: StatusResposta
  reformulacoes: number
  avaliacao: AvaliacaoManual
  tempoResposta: number
  data: string
  categoria: string
  origem: string
  confianca: number
}

interface AcaoAdministrativa {
  id: number
  usuario: string
  acao: string
  alvo: string
  data: string
}

interface MetricasResponse {
  total_perguntas: number
  perguntas_respondidas: number
  perguntas_nao_respondidas: number
  taxa_sucesso: number
  tempo_medio_resposta: number
  avaliacoes_aprovadas: number
  avaliacoes_rejeitadas: number
  avaliacoes_pendentes: number
  total_interacoes: number
  usuarios_ativos: number
  confianca_media: number
  reformulacao_dados: Array<{ label: string; valor: number }>
  avaliacoes_dados: Array<{ label: string; quantidade: number }>
  desempenho_dados: Array<{ label: string; quantidade: number }>
}

interface ConversaApi {
  id_conversa: number
  usuario?: {
    nome?: string
    email?: string
  } | null
  data_conversa?: string
  horario_conversa?: string
  avaliacao?: boolean | null
  perguntas?: Array<{
    id_pergunta: number
    texto?: string
    resposta?: {
      intencao?: string
      texto_resposta?: string
      tempo_resposta?: string | number | null
    } | null
  }>
}

const router = useRouter()
const authStore = useAuthStore()
const recentChats = ref<RecentChat[]>([])
const carregando = ref(false)
const erro = ref('')
const filtroUsuario = ref('todos')
const filtroPeriodo = ref('todos')

const interacoes = ref<InteracaoMock[]>([
  {
    id: 1,
    usuario: 'Ana Martins',
    pergunta: 'Quais documentos explicam o fluxo de matricula?',
    perguntaProcessada: 'documentos fluxo matricula',
    status: 'sucesso',
    reformulacoes: 0,
    avaliacao: 'aprovada',
    tempoResposta: 1.2,
    data: '2026-05-19T09:20:00',
    categoria: 'Documentos',
    origem: 'Regulamento academico.pdf',
    confianca: 94,
  },
  {
    id: 2,
    usuario: 'Bruno Silva',
    pergunta: 'Mostre pendencias para rematricula',
    perguntaProcessada: 'pendencias rematricula',
    status: 'sucesso',
    reformulacoes: 1,
    avaliacao: 'pendente',
    tempoResposta: 1.8,
    data: '2026-05-19T10:05:00',
    categoria: 'Consulta',
    origem: 'Manual do aluno.pdf',
    confianca: 88,
  },
  {
    id: 3,
    usuario: 'Carla Souza',
    pergunta: 'Qual edital?',
    perguntaProcessada: 'edital',
    status: 'ambigua',
    reformulacoes: 2,
    avaliacao: 'rejeitada',
    tempoResposta: 2.6,
    data: '2026-05-18T14:42:00',
    categoria: 'Editais',
    origem: 'Confirmacao solicitada ao usuario',
    confianca: 53,
  },
  {
    id: 4,
    usuario: 'Diego Lima',
    pergunta: 'Gere um resumo sobre criterios de avaliacao',
    perguntaProcessada: 'resumo criterios avaliacao',
    status: 'sucesso',
    reformulacoes: 0,
    avaliacao: 'aprovada',
    tempoResposta: 2.1,
    data: '2026-05-17T16:15:00',
    categoria: 'Relatorio',
    origem: 'Plano de ensino.pdf',
    confianca: 91,
  },
  {
    id: 5,
    usuario: 'Elaine Costa',
    pergunta: 'Onde encontro estagio obrigatorio?',
    perguntaProcessada: 'estagio obrigatorio',
    status: 'sucesso',
    reformulacoes: 1,
    avaliacao: 'aprovada',
    tempoResposta: 1.5,
    data: '2026-05-15T11:10:00',
    categoria: 'Documentos',
    origem: 'Normas de estagio.pdf',
    confianca: 89,
  },
  {
    id: 6,
    usuario: 'Felipe Rocha',
    pergunta: 'Dados de evasao por semestre',
    perguntaProcessada: 'evasao semestre',
    status: 'falha',
    reformulacoes: 1,
    avaliacao: 'rejeitada',
    tempoResposta: 3.4,
    data: '2026-05-12T08:30:00',
    categoria: 'Indicadores',
    origem: 'Sem documento indexado',
    confianca: 38,
  },
  {
    id: 7,
    usuario: 'Ana Martins',
    pergunta: 'Exportar resposta sobre trancamento em texto',
    perguntaProcessada: 'exportar resposta trancamento texto',
    status: 'sucesso',
    reformulacoes: 0,
    avaliacao: 'pendente',
    tempoResposta: 1.1,
    data: '2026-05-10T15:22:00',
    categoria: 'Exportacao',
    origem: 'Regulamento academico.pdf',
    confianca: 92,
  },
  {
    id: 8,
    usuario: 'Bruno Silva',
    pergunta: 'Como atualizar a base de conhecimento?',
    perguntaProcessada: 'atualizar base conhecimento',
    status: 'sucesso',
    reformulacoes: 0,
    avaliacao: 'aprovada',
    tempoResposta: 1.7,
    data: '2026-04-29T13:50:00',
    categoria: 'Administrativo',
    origem: 'Guia de administracao.pdf',
    confianca: 86,
  },
])

const interacoesMock = [...interacoes.value]

const acoesAdministrativas = ref<AcaoAdministrativa[]>([
  {
    id: 1,
    usuario: 'admin@edchatbot.com',
    acao: 'Cadastrou documento',
    alvo: 'Regulamento academico.pdf',
    data: '2026-05-19T08:40:00',
  },
  {
    id: 2,
    usuario: 'admin@edchatbot.com',
    acao: 'Atualizou perfil de acesso',
    alvo: 'Bruno Silva',
    data: '2026-05-18T17:22:00',
  },
  {
    id: 3,
    usuario: 'admin@edchatbot.com',
    acao: 'Reindexou base de conhecimento',
    alvo: 'Documentos academicos',
    data: '2026-05-16T10:12:00',
  },
])

const pieChartCanvas = ref<HTMLCanvasElement | null>(null)
const barChartCanvas = ref<HTMLCanvasElement | null>(null)
const desempenhoChartCanvas = ref<HTMLCanvasElement | null>(null)

const usuarios = computed(() => [...new Set(interacoes.value.map((item) => item.usuario))])

const interacoesFiltradas = computed(() => {
  const agora = new Date()

  return interacoes.value.filter((item) => {
    const porUsuario = filtroUsuario.value === 'todos' || item.usuario === filtroUsuario.value
    const data = new Date(item.data)

    let porPeriodo = true
    if (filtroPeriodo.value === 'hoje') {
      porPeriodo = data.toDateString() === agora.toDateString()
    }

    if (filtroPeriodo.value === '7dias') {
      const limite = new Date(agora)
      limite.setDate(limite.getDate() - 7)
      porPeriodo = data >= limite
    }

    if (filtroPeriodo.value === '30dias') {
      const limite = new Date(agora)
      limite.setDate(limite.getDate() - 30)
      porPeriodo = data >= limite
    }

    return porUsuario && porPeriodo
  })
})

const calcularPercentual = (valor: number, total: number) => {
  if (!total) return 0
  return Number(((valor / total) * 100).toFixed(1))
}

const converterTempoParaSegundos = (valor?: string | number | null) => {
  if (typeof valor === 'number') return valor
  if (!valor) return 0

  const texto = valor.trim()
  if (!texto) return 0

  if (/^\d+(?:\.\d+)?$/.test(texto)) {
    return Number(texto)
  }

  const partes = texto.split(/\s+/)
  const tempo = (partes.length > 1 ? partes[1] : partes[0]) ?? ''
  const dias = partes.length > 1 ? Number(partes[0]) || 0 : 0
  const componentes = tempo.split(':')

  if (componentes.length < 2 || componentes.length > 3) return 0

  const horas = Number(componentes[0]) || 0
  const minutos = Number(componentes[1]) || 0
  const segundos = Number.parseFloat(componentes[2] ?? '0') || 0

  return dias * 86400 + horas * 3600 + minutos * 60 + segundos
}

const calcularTempoMedioResposta = (dados: InteracaoMock[]) => {
  const interacoesComTempo = dados.filter((item) => item.tempoResposta > 0)
  const base = interacoesComTempo.length ? interacoesComTempo : interacoesMock.filter((item) => item.tempoResposta > 0)

  if (!base.length) return 0

  const total = base.reduce((soma, item) => soma + item.tempoResposta, 0)
  return Number((total / base.length).toFixed(1))
}

const metricas = computed<MetricasResponse>(() => {
  const dados = interacoesFiltradas.value
  const total = dados.length
  const respondidas = dados.filter((item) => item.status === 'sucesso').length
  const naoRespondidas = dados.filter((item) => item.status === 'falha').length
  const confiancaTotal = dados.reduce((soma, item) => soma + item.confianca, 0)
  const aprovadas = dados.filter((item) => item.avaliacao === 'aprovada').length
  const rejeitadas = dados.filter((item) => item.avaliacao === 'rejeitada').length
  const pendentes = dados.filter((item) => item.avaliacao === 'pendente').length

  return {
    total_perguntas: total,
    perguntas_respondidas: respondidas,
    perguntas_nao_respondidas: naoRespondidas,
    taxa_sucesso: calcularPercentual(respondidas, total),
    tempo_medio_resposta: calcularTempoMedioResposta(dados),
    avaliacoes_aprovadas: aprovadas,
    avaliacoes_rejeitadas: rejeitadas,
    avaliacoes_pendentes: pendentes,
    total_interacoes: total,
    usuarios_ativos: new Set(dados.map((item) => item.usuario)).size,
    confianca_media: total ? Number((confiancaTotal / total).toFixed(1)) : 0,
    reformulacao_dados: [
      { label: 'Sem reformulacao', valor: dados.filter((item) => item.reformulacoes === 0).length },
      { label: 'Uma reformulacao', valor: dados.filter((item) => item.reformulacoes === 1).length },
      { label: 'Duas ou mais', valor: dados.filter((item) => item.reformulacoes >= 2).length },
    ],
    avaliacoes_dados: [
      { label: 'Positivas', quantidade: aprovadas },
      { label: 'Rejeitadas', quantidade: rejeitadas },
      { label: 'Pendentes', quantidade: pendentes },
    ],
    desempenho_dados: [
      { label: 'Respondidas', quantidade: respondidas },
      { label: 'Com falha', quantidade: naoRespondidas },
      { label: 'Ambiguas', quantidade: dados.filter((item) => item.status === 'ambigua').length },
    ],
  }
})

const formatarData = (valor: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))

const montarDataConversa = (conversa: ConversaApi): string => {
  if (!conversa.data_conversa) return new Date().toISOString()
  return `${conversa.data_conversa}T${conversa.horario_conversa ?? '00:00:00'}`
}

const mapearAvaliacao = (avaliacao?: boolean | null): AvaliacaoManual => {
  if (avaliacao === true) return 'aprovada'
  if (avaliacao === false) return 'rejeitada'
  return 'pendente'
}

const respostaIndicaFalha = (resposta: string) => {
  const texto = resposta.trim().toLowerCase()

  if (!texto) return true

  return [
    'não encontrei',
    'nÃ£o encontrei',
    'nao encontrei',
    'erro ao gerar resposta',
    'erro ao conectar com o servidor',
    'sem resposta do servidor',
  ].some((indicador) => texto.includes(indicador))
}

const mapearConversasParaInteracoes = (conversas: ConversaApi[]): InteracaoMock[] => {
  return conversas.flatMap((conversa) => {
    const perguntas = conversa.perguntas?.length ? conversa.perguntas : []

    return perguntas.map((pergunta) => {
      const respostaTexto = pergunta.resposta?.texto_resposta?.trim() ?? ''
      const status: StatusResposta = respostaIndicaFalha(respostaTexto) ? 'falha' : 'sucesso'

      return {
        id: pergunta.id_pergunta,
        usuario: conversa.usuario?.nome ?? conversa.usuario?.email ?? 'Usuario anonimo',
        pergunta: pergunta.texto ?? 'Pergunta sem texto',
        perguntaProcessada: pergunta.texto ?? 'Pergunta sem texto',
        status,
        reformulacoes: 0,
        avaliacao: mapearAvaliacao(conversa.avaliacao),
        tempoResposta: converterTempoParaSegundos(pergunta.resposta?.tempo_resposta),
        data: montarDataConversa(conversa),
        categoria: pergunta.resposta?.intencao ?? 'GERAL',
        origem: 'API /conversas/',
        confianca: status === 'sucesso' ? 100 : 0,
      }
    })
  })
}

const carregarMetricas = async () => {
  carregando.value = true
  erro.value = ''

  try {
    const { data } = await httpClient.get<ConversaApi[]>(apiRoutes.conversas.list)
    const interacoesApi = Array.isArray(data) ? mapearConversasParaInteracoes(data) : []
    interacoes.value = interacoesApi.length ? interacoesApi : []
  } catch (error) {
    console.error('Erro ao carregar metricas:', error)
    interacoes.value = interacoesMock
    erro.value = 'Nao foi possivel carregar metricas da API. Exibindo dados locais.'
  } finally {
    carregando.value = false
  }
}

const desenharPieChart = () => {
  const canvas = pieChartCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.offsetWidth
  const height = canvas.offsetHeight
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2
  const raio = Math.min(width, height) / 2 - 20
  const cores = ['#5f6f52', '#b75d69', '#315c7d']
  const dados = metricas.value.reformulacao_dados
  const total = dados.reduce((sum, item) => sum + item.valor, 0)

  if (!total) return

  let anguloInicio = -Math.PI / 2
  dados.forEach((item, index) => {
    const anguloFinal = anguloInicio + (item.valor / total) * 2 * Math.PI

    ctx.beginPath()
    ctx.arc(centerX, centerY, raio, anguloInicio, anguloFinal)
    ctx.lineTo(centerX, centerY)
    ctx.fillStyle = cores[index % cores.length] || '#5f6f52'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
    anguloInicio = anguloFinal
  })
}

const desenharBarChart = (
  canvas: HTMLCanvasElement | null,
  dados: Array<{ label: string; quantidade: number }>,
  cores: string[],
) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.offsetWidth
  const height = canvas.offsetHeight
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)

  const maxValor = Math.max(...dados.map((d) => d.quantidade), 1)
  const padding = 42
  const gap = 12
  const barWidth = Math.max((width - padding * 2) / dados.length - gap, 24)
  const chartHeight = height - padding * 2

  ctx.fillStyle = '#2d3137'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'

  dados.forEach((item, index) => {
    const x = padding + index * (barWidth + gap)
    const barHeight = (item.quantidade / maxValor) * chartHeight
    const y = height - padding - barHeight

    ctx.fillStyle = cores[index % cores.length] || '#315c7d'
    ctx.fillRect(x, y, barWidth, barHeight)
    ctx.fillStyle = '#2d3137'
    ctx.fillText(String(item.quantidade), x + barWidth / 2, y - 8)
    ctx.fillText(item.label, x + barWidth / 2, height - 12)
  })

  ctx.strokeStyle = '#d0d0d7'
  ctx.beginPath()
  ctx.moveTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()
}

const desenharGraficos = () => {
  desenharPieChart()
  desenharBarChart(barChartCanvas.value, metricas.value.avaliacoes_dados, [
    '#5f6f52',
    '#b75d69',
    '#315c7d',
  ])
  desenharBarChart(desempenhoChartCanvas.value, metricas.value.desempenho_dados, [
    '#315c7d',
    '#b75d69',
    '#c28f2c',
  ])
}

const agendarDesenhoGraficos = async () => {
  await nextTick()
  window.requestAnimationFrame(desenharGraficos)
}

const exportarRelatorio = () => {
  const conteudo = `
DASHBOARD DE METRICAS DO CHATBOT
================================

Filtros:
- Usuario: ${filtroUsuario.value === 'todos' ? 'Todos' : filtroUsuario.value}
- Periodo: ${filtroPeriodo.value}

Metricas de uso:
- Total de interacoes registradas: ${metricas.value.total_interacoes}
- Numero de perguntas realizadas: ${metricas.value.total_perguntas}
- Usuarios ativos: ${metricas.value.usuarios_ativos}

Desempenho:
- Perguntas respondidas com sucesso: ${metricas.value.perguntas_respondidas}
- Respostas com falha: ${metricas.value.perguntas_nao_respondidas}
- Taxa de sucesso: ${metricas.value.taxa_sucesso}%
- Tempo medio de resposta: ${metricas.value.tempo_medio_resposta}s
- Confianca media: ${metricas.value.confianca_media}%

Avaliacao manual:
- Positivas: ${metricas.value.avaliacoes_aprovadas}
- Rejeitadas: ${metricas.value.avaliacoes_rejeitadas}
- Pendentes: ${metricas.value.avaliacoes_pendentes}

Historico de interacoes:
${interacoesFiltradas.value
  .map(
    (item) =>
      `- ${formatarData(item.data)} | ${item.usuario} | ${item.status} | ${item.pergunta} | Origem: ${item.origem}`,
  )
  .join('\n')}

Acoes administrativas:
${acoesAdministrativas.value
  .map((item) => `- ${formatarData(item.data)} | ${item.usuario} | ${item.acao}: ${item.alvo}`)
  .join('\n')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
  `

  const blob = new Blob([conteudo], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-metricas-${new Date().getTime()}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await carregarMetricas()
  await agendarDesenhoGraficos()
})

watch([metricas, filtroUsuario, filtroPeriodo], () => {
  agendarDesenhoGraficos()
})
</script>

<template>
  <main class="relatorios-page">
    <ChatSidebar section="admin" :recent-chats="recentChats" />

    <section class="relatorios-content">
      <header class="relatorios-page__header">
        <div>
          <h1>Dashboard de Metricas</h1>
          <p>Uso, desempenho, qualidade das respostas e historico de interacoes.</p>
        </div>

        <div class="relatorios-page__header-actions">
          <button
            type="button"
            class="btn btn--ghost"
            @click="carregarMetricas"
            :disabled="carregando"
          >
            Atualizar
          </button>
          <button type="button" class="btn btn--primary" @click="handleLogout">Sair</button>
        </div>
      </header>

      <p v-if="erro" class="feedback feedback--error">{{ erro }}</p>
      <p v-else-if="carregando" class="feedback">Carregando metricas mockadas...</p>

      <section v-else class="metrics-container">
        <section class="filters-panel" aria-label="Filtros do historico">
          <label>
            <span>Usuario</span>
            <select v-model="filtroUsuario">
              <option value="todos">Todos</option>
              <option v-for="usuario in usuarios" :key="usuario" :value="usuario">
                {{ usuario }}
              </option>
            </select>
          </label>

          <label>
            <span>Periodo</span>
            <select v-model="filtroPeriodo">
              <option value="todos">Todo o historico</option>
              <option value="hoje">Hoje</option>
              <option value="7dias">Ultimos 7 dias</option>
              <option value="30dias">Ultimos 30 dias</option>
            </select>
          </label>

          <button type="button" class="btn btn--export" @click="exportarRelatorio">
            Exportar relatorio
          </button>
        </section>

        <section class="metrics-grid">
          <article class="metric-card">
            <div class="metric-card__icon">US</div>
            <p class="metric-card__value">{{ metricas.total_perguntas }}</p>
            <p class="metric-card__label">Perguntas realizadas</p>
          </article>

          <article class="metric-card">
            <div class="metric-card__icon">OK</div>
            <p class="metric-card__value">{{ metricas.taxa_sucesso }}%</p>
            <p class="metric-card__label">Respondidas com sucesso</p>
          </article>

          <article class="metric-card">
            <div class="metric-card__icon">TR</div>
            <p class="metric-card__value">{{ metricas.tempo_medio_resposta }}s</p>
            <p class="metric-card__label">Tempo médio de resposta</p>
          </article>

          <article class="metric-card">
            <div class="metric-card__icon">AV</div>
            <p class="metric-card__value">{{ metricas.avaliacoes_aprovadas }}</p>
            <p class="metric-card__label">Avaliações positivas</p>
          </article>

          <article class="metric-card">
            <div class="metric-card__icon">UA</div>
            <p class="metric-card__value">{{ metricas.usuarios_ativos }}</p>
            <p class="metric-card__label">Usuários ativos</p>
          </article>

          <article class="metric-card">
            <div class="metric-card__icon">CF</div>
            <p class="metric-card__value">{{ metricas.confianca_media }}%</p>
            <p class="metric-card__label">Confiança média</p>
          </article>

          <article class="metric-card">
            <div class="metric-card__icon">ER</div>
            <p class="metric-card__value">{{ metricas.perguntas_nao_respondidas }}</p>
            <p class="metric-card__label">Respostas com falha</p>
          </article>
        </section>

        <section class="charts-grid">
          <article class="chart-card">
            <h2 class="chart-card__title">Reformulação de perguntas</h2>
            <div class="chart-container">
              <canvas
                ref="pieChartCanvas"
                class="pie-chart"
                role="img"
                aria-label="Gráfico de pizza: taxa de reformulação"
              ></canvas>
            </div>
            <ul class="chart-legend">
              <li v-for="(item, index) in metricas.reformulacao_dados" :key="item.label">
                <span
                  class="legend-dot"
                  :style="{ backgroundColor: ['#5f6f52', '#b75d69', '#315c7d'][index] }"
                ></span>
                {{ item.label }} - {{ item.valor }}
              </li>
            </ul>
          </article>

          <article class="chart-card">
            <h2 class="chart-card__title">Avaliação manual da qualidade</h2>
            <div class="chart-container">
              <canvas
                ref="barChartCanvas"
                class="bar-chart"
                role="img"
                aria-label="Gráfico de barras: avaliação manual"
              ></canvas>
            </div>
          </article>

          <article class="chart-card">
            <h2 class="chart-card__title">Relatório de desempenho</h2>
            <div class="chart-container">
              <canvas
                ref="desempenhoChartCanvas"
                class="bar-chart"
                role="img"
                aria-label="Gráfico de barras: desempenho do chatbot"
              ></canvas>
            </div>
          </article>

          <article class="chart-card chart-card--summary">
            <h2 class="chart-card__title">Resumo de qualidade</h2>
            <dl class="quality-list">
              <div>
                <dt>Avaliações positivas</dt>
                <dd>{{ metricas.avaliacoes_aprovadas }}</dd>
              </div>
              <div>
                <dt>Respostas rejeitadas</dt>
                <dd>{{ metricas.avaliacoes_rejeitadas }}</dd>
              </div>
              <div>
                <dt>Aguardando avaliação</dt>
                <dd>{{ metricas.avaliacoes_pendentes }}</dd>
              </div>
              <div>
                <dt>Interaçõess registradas</dt>
                <dd>{{ metricas.total_interacoes }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="history-grid">
          <article class="table-card">
            <header class="table-card__header">
              <h2>Historico de conversas</h2>
              <span>{{ interacoesFiltradas.length }} registros</span>
            </header>

            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Usuario</th>
                    <th>Pergunta</th>
                    <th>Processada</th>
                    <th>Status</th>
                    <th>Origem</th>
                    <th>Avaliacao</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in interacoesFiltradas" :key="item.id">
                    <td>{{ formatarData(item.data) }}</td>
                    <td>{{ item.usuario }}</td>
                    <td>{{ item.pergunta }}</td>
                    <td>{{ item.perguntaProcessada }}</td>
                    <td>
                      <span class="status-pill" :class="`status-pill--${item.status}`">
                        {{ item.status }}
                      </span>
                    </td>
                    <td>{{ item.origem }}</td>
                    <td>{{ item.avaliacao }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="table-card">
            <header class="table-card__header">
              <h2>Acoes administrativas</h2>
              <span>{{ acoesAdministrativas.length }} registros</span>
            </header>

            <ul class="admin-actions-list">
              <li v-for="acao in acoesAdministrativas" :key="acao.id">
                <div>
                  <p>{{ acao.acao }}</p>
                  <span>{{ acao.alvo }}</span>
                </div>
                <time>{{ formatarData(acao.data) }}</time>
              </li>
            </ul>
          </article>
        </section>
      </section>
    </section>
  </main>
</template>

<style scoped src="./RelatóriosView.css"></style>
