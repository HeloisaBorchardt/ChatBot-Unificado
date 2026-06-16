<script setup lang="ts">
import { computed } from 'vue'
import BaseAvatar from '../../../common/components/BaseAvatar.vue'
import type { RecentChat } from '../entities/chat'
import { useAuthStore } from '../../../stores/useAuthStore'

interface Props {
  recentChats: RecentChat[]
  section: 'conversa' | 'admin'
  activeChatId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  newChat: []
  selectChat: [chatId: string]
}>()

const authStore = useAuthStore()

const currentUserName = computed(() => authStore.currentUser?.fullName || 'Usuario')
const currentUserEmail = computed(() => authStore.currentUser?.email || 'email@exemplo.com')

const triggerNewChat = () => emit('newChat')
const triggerSelectChat = (chatId: string) => emit('selectChat', chatId)
</script>

<template>
  <aside class="sidebar">
    <section class="sidebar__profile">
      <BaseAvatar :label="currentUserName" />
      <div>
        <p class="sidebar__name">{{ currentUserName }}</p>
        <p class="sidebar__email">{{ currentUserEmail }}</p>
      </div>
    </section>

    <button
      v-if="props.section === 'conversa'"
      class="sidebar__new-chat"
      type="button"
      @click="triggerNewChat"
    >
      + Novo Chat
    </button>

    <section v-if="props.section === 'conversa'" class="sidebar__recent">
      <p class="sidebar__recent-title">Chats recentes</p>
      <ul class="sidebar__list">
        <li
          v-for="chat in props.recentChats"
          :key="chat.id"
          class="sidebar__list-item"
          :class="{ 'sidebar__list-item--active': chat.id === props.activeChatId }"
        >
          <button type="button" class="sidebar__chat-button" @click="triggerSelectChat(chat.id)">
            <p class="sidebar__chat-title">{{ chat.title }}</p>
            <p class="sidebar__chat-time">{{ chat.updatedLabel }}</p>
          </button>
        </li>
      </ul>
    </section>

    <section v-if="props.section === 'admin'" class="sidebar__admin-nav">
      <p class="sidebar__recent-title">Painel administrativo</p>
      <RouterLink class="sidebar__admin-link" :to="{ name: 'admin-documentos' }">
        Documentos
      </RouterLink>
      <RouterLink class="sidebar__admin-link" :to="{ name: 'admin-controle-acesso' }">
        Controle de acesso
      </RouterLink>
      <RouterLink class="sidebar__admin-link" :to="{ name: 'admin-relatorios' }">
        Relatórios
      </RouterLink>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  border-right: 1px solid #d0d0d3;
  background: #f2f2f4;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.9rem;
}

.sidebar__profile {
  background: #ececef;
  border: 1px solid #d9d9dc;
  border-radius: 10px;
  padding: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.sidebar__name {
  font-weight: 700;
  color: #24272b;
}

.sidebar__email {
  font-size: 0.86rem;
  color: #6f7682;
}

.sidebar__new-chat {
  border: 0;
  border-radius: 9px;
  padding: 0.7rem 0.85rem;
  text-align: left;
  font-size: 0.98rem;
  cursor: pointer;
}

.sidebar__new-chat {
  background: #762f37;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
}

.sidebar__recent {
  border-top: 1px solid #d2d2d6;
  margin-top: 0.35rem;
  padding-top: 0.85rem;
}

.sidebar__admin-nav {
  border-top: 1px solid #d2d2d6;
  margin-top: 0.35rem;
  padding-top: 0.85rem;
  display: grid;
  gap: 0.5rem;
}

.sidebar__admin-link {
  text-decoration: none;
  color: #2d3137;
  border: 1px solid #d0d0d3;
  background: #ededf0;
  border-radius: 9px;
  padding: 0.65rem 0.7rem;
  font-weight: 600;
}

.sidebar__admin-link.router-link-exact-active {
  background: #762f37;
  color: #ffffff;
  border-color: #762f37;
}

.sidebar__recent-title {
  color: #707581;
  font-size: 0.94rem;
  margin-bottom: 0.6rem;
}

.sidebar__list {
  list-style: none;
  display: grid;
  gap: 0.55rem;
}

.sidebar__list-item {
  border-radius: 8px;
  border: 1px solid #d0d0d3;
  background: #ffffff;
}

.sidebar__chat-button {
  width: 100%;
  padding: 0.7rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
}

.sidebar__list-item--active {
  background: #762f37;
  border-color: #762f37;
}

.sidebar__list-item--active .sidebar__chat-title,
.sidebar__list-item--active .sidebar__chat-time {
  color: #ffffff;
}

.sidebar__chat-title {
  color: #272a30;
  font-weight: 700;
  line-height: 1.25;
}

.sidebar__chat-time {
  color: #6e7480;
  font-size: 0.85rem;
}

@media (max-width: 960px) {
  .sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid #d0d0d3;
  }
}
</style>
