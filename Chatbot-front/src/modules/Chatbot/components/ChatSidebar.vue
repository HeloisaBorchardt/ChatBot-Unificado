<script setup lang="ts">
import BaseAvatar from '../../../common/components/BaseAvatar.vue'
import type { RecentChat } from '../entities/chat'

const props = defineProps<{
  recentChats: RecentChat[]
}>()

const emit = defineEmits<{
  newChat: []
}>()

const triggerNewChat = () => emit('newChat')
</script>

<template>
  <aside class="sidebar">
    <section class="sidebar__profile">
      <BaseAvatar label="Heloisa" />
      <div>
        <p class="sidebar__name">Heloisa</p>
        <p class="sidebar__email">heloisa@gmail.com</p>
      </div>
    </section>

    <button class="sidebar__settings" type="button">
      <span class="sidebar__icon">[ ]</span>
      Configuracao
    </button>

    <button class="sidebar__new-chat" type="button" @click="triggerNewChat">+ Novo Chat</button>

    <section class="sidebar__recent">
      <p class="sidebar__recent-title">Chats recentes</p>
      <ul class="sidebar__list">
        <li v-for="chat in props.recentChats" :key="chat.id" class="sidebar__list-item">
          <p class="sidebar__chat-title">{{ chat.title }}</p>
          <p class="sidebar__chat-time">{{ chat.updatedLabel }}</p>
        </li>
      </ul>
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

.sidebar__settings,
.sidebar__new-chat {
  border: 0;
  border-radius: 9px;
  padding: 0.7rem 0.85rem;
  text-align: left;
  font-size: 0.98rem;
  cursor: pointer;
}

.sidebar__settings {
  background: #ebebee;
  color: #2d2f34;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar__icon {
  font-size: 1rem;
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
  padding: 0.7rem;
  border-radius: 8px;
  border: 1px solid transparent;
}

.sidebar__list-item:first-child {
  background: #762f37;
}

.sidebar__list-item:first-child .sidebar__chat-title,
.sidebar__list-item:first-child .sidebar__chat-time {
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
