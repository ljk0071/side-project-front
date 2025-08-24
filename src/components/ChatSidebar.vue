<script setup lang="ts">
/**
 * ChatSidebar 컴포넌트
 *
 * 메인 페이지 왼쪽 사이드바에 표시되는 간소화된 채팅 컴포넌트입니다.
 * 실시간 채팅 기능을 제공하되 사이드바에 최적화된 UI를 가집니다.
 */
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useAuth } from '@/stores/useAuth.ts'
import { useMyWebSocket } from '@/composables/useMyWebSocket.ts'
import dayjs from 'dayjs'
import { useTerms } from '@/stores/useTerms.ts'

// 상태 관리
const messageInput = ref<string>('')
const messagesDisplayRef = ref<HTMLElement | null>(null)

// 인증 스토어
const auth = useAuth()
const websocket = useMyWebSocket()

/**
 * 드래그 관련 상태와 함수들
 */
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: 0, y: 0 })
const chatSidebarRef = useTemplateRef<HTMLElement>('chatSidebarRef')

/**
 * 마우스 드래그 시작
 */

const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  const rect = chatSidebarRef.value?.getBoundingClientRect()
  if (rect) {
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  event.preventDefault()
}

/**
 * 마우스 드래그 중
 */
const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  position.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y
  }
}

/**
 * 마우스 드래그 종료
 */
const onMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

/**
 * 드래그 스타일 계산
 */
const dragStyle = computed(() => {
  if (position.value.x === 0 && position.value.y === 0) {
    return {}
  }
  return {
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    zIndex: 1000,
    transform: 'none'
  }
})

const welcomeMessage = ref<string>('파티 모집글을 작성하거나 지원이 수락되면\n채팅이 시작됩니다.')

const convertTimestamp = (timestamp: number) => {
  return dayjs(timestamp * 1000).format('HH:mm')
}

/**
 * 스크롤을 하단으로 이동
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesDisplayRef.value) {
      messagesDisplayRef.value.scrollTop = messagesDisplayRef.value.scrollHeight
    }
  })
}

const sendMessageToParty = async () => {
  if (messageInput.value) {
    websocket.sendMessage(messageInput.value)
    messageInput.value = ''
  }
}

const terms = useTerms()

// 메시지 변경 시 자동 스크롤
watch(
  () => websocket.receivePartyMessage.value,
  () => {
    scrollToBottom()
  },
  { deep: true }
)
</script>

<template>
  <div :class="{ dragging: isDragging }" class="chat-sidebar" :style="dragStyle">
    <!-- 헤더 -->
    <div class="chat-header" ref="chatSidebarRef" @mousedown="onMouseDown">
      <h3>실시간 채팅</h3>
    </div>

    <!-- 로그인이 필요한 경우 -->
    <div v-if="!auth.isLoggedIn" class="login-required">
      <p class="login-info">{{ welcomeMessage }}</p>
    </div>

    <!-- 채팅 영역 -->
    <div v-else class="chat-content">
      <template v-if="!terms.getReadStatus()">
        <div class="terms-required">
          <p class="terms-info">채팅을 시작하기 전에<br />이용 약관에 동의해주세요.</p>
          <div class="terms-notice">
            <span>📋</span>
            <span>약관은 자동으로 표시됩니다</span>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 메시지 표시 영역 -->
        <div v-if="websocket.isJoined()" class="messages-container">
          <div ref="messagesDisplayRef" class="messages-display">
            <div v-if="websocket.receivePartyMessage.value.length === 0" class="no-messages">
              아직 메시지가 없습니다.
            </div>
            <div
              v-for="(msg, index) in websocket.receivePartyMessage.value"
              :key="index"
              :class="{ 'my-message': msg.senderName === 'Me' }"
              class="message-item"
            >
              <div class="message-header">
                <span class="sender">{{ msg.senderName }}</span>
                <span class="timestamp">{{ convertTimestamp(msg.timestamp) }}</span>
              </div>
              <div class="message-content">
                {{ msg.contents }}
              </div>
            </div>
          </div>

          <!-- 메시지 입력 -->
          <div class="message-input-container">
            <div class="input-group">
              <input
                v-model="messageInput"
                class="message-input"
                placeholder="메시지 입력..."
                type="text"
                @keyup.enter="sendMessageToParty"
              />
              <button
                :disabled="!messageInput.trim()"
                class="send-button"
                @click="sendMessageToParty"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chat-sidebar {
  width: 450px;
  background-color: var(--card-bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 450px;
  min-height: 450px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  cursor: grab;
  transition: transform 0.2s ease,
  box-shadow 0.2s ease;
}

.chat-sidebar:active {
  cursor: grabbing;
}

.chat-sidebar:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.chat-sidebar.dragging {
  cursor: grabbing;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform: rotate(2deg);
  user-select: none;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-color);
}

.login-required {
  padding: 20px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}

.login-required p {
  margin: 0;
  font-size: 14px;
  color: var(--card-description-color);
}

.login-info {
  margin-top: 10px !important;
  font-size: 12px !important;
  color: var(--primary-color, #3366cc) !important;
  white-space: pre-line;
}

.terms-required {
  padding: 20px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}

.terms-info {
  margin: 0;
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.5;
}

.terms-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--tag1-bg-color);
  border: 1px solid var(--tag1-text-color);
  border-radius: 8px;
  font-size: 12px;
  color: var(--tag1-text-color);
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-display {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: var(--bg-color);
}

.no-messages {
  text-align: center;
  color: var(--card-description-color);
  font-size: 14px;
  padding: 20px;
}

.message-item {
  margin-bottom: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: var(--card-bg-color);
  border-left: 3px solid #007bff;
  font-size: 12px;
}

.message-item.my-message {
  border-left-color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sender {
  font-weight: 600;
  color: var(--text-color);
  font-size: 11px;
}

.timestamp {
  font-size: 10px;
  color: var(--card-description-color);
  opacity: 0.7;
}

.message-content {
  color: var(--text-color);
  font-size: 12px;
  word-wrap: break-word;
  line-height: 1.3;
}

.message-input-container {
  padding: 12px 15px;
  border-top: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 12px;
  transition: all 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.send-button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.send-button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.clear-button {
  padding: 8px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.clear-button:hover {
  background-color: #5a6268;
  transform: scale(1.05);
}

/* 미리보기 스타일 */
.message-preview {
  position: absolute;
  bottom: 5px;
  left: 15px;
  right: 15px;
  background-color: rgba(0, 123, 255, 0.95);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  animation: fadeInUp 0.2s ease-out;
  backdrop-filter: blur(5px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.preview-item {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 13px;
  display: flex;
  gap: 8px;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-sender {
  font-weight: 600;
  color: white;
  min-width: 60px;
  flex-shrink: 0;
}

.preview-content {
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 스크롤바 스타일 */
.messages-display::-webkit-scrollbar {
  width: 4px;
}

.messages-display::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 2px;
}

.messages-display::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.messages-display::-webkit-scrollbar-thumb:hover {
  background: var(--card-description-color);
}
</style>
