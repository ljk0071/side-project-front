<script lang="ts" setup>
/**
 * ChatSidebar 컴포넌트
 *
 * 메인 페이지 왼쪽 사이드바에 표시되는 간소화된 채팅 컴포넌트입니다.
 * 실시간 채팅 기능을 제공하되 사이드바에 최적화된 UI를 가집니다.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/stores/useAuth.ts';
import { useElementHover } from '@vueuse/core';
import { useRefreshDetect } from '@/stores/useRefreshDetect.ts';

// 상태 관리
const stompClient = ref<Client | null>(null);
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected');
const messageInput = ref('');
const receivedMessages = ref<Array<{ timestamp: string; content: string; sender: string }>>([]);
const messagesDisplayRef = ref<HTMLElement | null>(null);

// 인증 스토어
const auth = useAuth();
const refreshDetect = useRefreshDetect();

// 호버 상태 (미리보기용)
const isMessagesDisplayHovered = useElementHover(messagesDisplayRef);

// 최근 메시지만 표시 (사이드바용)
const recentMessages = computed(() => {
  return receivedMessages.value.slice(-10); // 최근 10개만
});

// 미리보기용 최신 메시지 (최근 3개)
const latestMessages = computed(() => {
  return receivedMessages.value.slice(-3).reverse();
});

// 미리보기 표시 여부
const showPreview = computed(() => {
  return isMessagesDisplayHovered.value && receivedMessages.value.length > 0;
});

/**
 * STOMP 연결
 */
const connectStomp = () => {
  if (stompClient.value?.connected) {
    return;
  }

  connectionStatus.value = 'connecting';

  stompClient.value = new Client({
    webSocketFactory: () => new SockJS(`${window.location.origin}:8080/ws/chat`),
    connectHeaders: {},
    debug: () => {}, // 디버그 로그 비활성화
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      connectionStatus.value = 'connected';
      console.log('사이드바 채팅 연결됨');

      // 메시지 수신을 위한 구독
      stompClient.value?.subscribe('/topic/chat/ROOM_1752315601836', (message) => {
        const receivedData = JSON.parse(message.body);
        if (receivedData.senderId !== auth.userInfo.uniqueId) {
          receivedMessages.value.push({
            timestamp: new Date().toLocaleTimeString(),
            content: receivedData.content || receivedData.message || message.body,
            sender: receivedData.senderName || 'Server',
          });
          scrollToBottom();
        }
      });

      refreshDetect.checkRefresh();

      if (!refreshDetect.isRefresh) {
        // 연결 완료 후 방 참가 (첫 번째 연결 시에만)
        stompClient.value?.publish({
          destination: '/chat/ROOM_1752315601836/join',
        });
      }
    },
    onStompError: (frame) => {
      connectionStatus.value = 'disconnected';
      console.error('사이드바 STOMP 에러:', frame.headers['message']);
    },
    onDisconnect: () => {
      connectionStatus.value = 'disconnected';
      console.log('사이드바 STOMP 연결 해제됨');
    },
  });

  stompClient.value.activate();
};

/**
 * STOMP 연결 해제
 */
const disconnectStomp = () => {
  if (stompClient.value) {
    stompClient.value.deactivate();
    stompClient.value = null;
    connectionStatus.value = 'disconnected';
  }
};

/**
 * 메시지 전송
 */
const sendMessage = () => {
  if (stompClient.value?.connected && messageInput.value.trim()) {
    const message = {
      content: messageInput.value,
      sender: 'Vue Client',
      timestamp: new Date().toISOString(),
    };

    stompClient.value.publish({
      destination: '/chat/ROOM_1752315601836/send',
      body: JSON.stringify(message),
    });

    receivedMessages.value.push({
      timestamp: new Date().toLocaleTimeString(),
      content: messageInput.value,
      sender: 'Me',
    });

    messageInput.value = '';
    scrollToBottom();
  }
};

/**
 * 스크롤을 하단으로 이동
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesDisplayRef.value) {
      messagesDisplayRef.value.scrollTop = messagesDisplayRef.value.scrollHeight;
    }
  });
};

/**
 * 메시지 내용 단축
 */
const truncateMessage = (content: string, maxLength: number = 40) => {
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
};

/**
 * 메시지 지우기
 */
const clearMessages = () => {
  receivedMessages.value = [];
};

/**
 * 로그아웃 처리
 */
const logout = () => {
  auth.logout();
};

/**
 * 드래그 관련 상태와 함수들
 */
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: 0, y: 0 });
const chatSidebarRef = ref<HTMLElement | null>(null);

/**
 * 마우스 드래그 시작
 */
const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  const rect = chatSidebarRef.value?.getBoundingClientRect();
  if (rect) {
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  event.preventDefault();
};

/**
 * 마우스 드래그 중
 */
const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;

  position.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y,
  };
};

/**
 * 마우스 드래그 종료
 */
const onMouseUp = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};

/**
 * 드래그 스타일 계산
 */
const dragStyle = computed(() => {
  if (position.value.x === 0 && position.value.y === 0) {
    return {};
  }
  return {
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    zIndex: 1000,
    transform: 'none',
  };
});

// 기존 HTML5 드래그 이벤트들 (제거)
const onDragStart = (event: DragEvent) => {
  event.preventDefault();
};

const onDrag = (event: DragEvent) => {
  event.preventDefault();
};

const onDragEnd = (event: DragEvent) => {
  event.preventDefault();
};

// 메시지 자동 스크롤
watch(
  receivedMessages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// 컴포넌트 생명주기
onMounted(() => {
  if (auth.isLoggedIn) {
    // connectStomp();
  }
});

onUnmounted(() => {
  disconnectStomp();
});
</script>

<template>
  <div
    ref="chatSidebarRef"
    :class="{ dragging: isDragging }"
    :style="dragStyle"
    class="chat-sidebar"
    @dragstart="onDragStart"
    @mousedown="onMouseDown"
  >
    <!-- 헤더 -->
    <div class="chat-header">
      <h3>실시간 채팅</h3>
      <div class="header-right">
        <div :class="connectionStatus" class="connection-status">
          <span v-if="connectionStatus === 'connected'">🟢</span>
          <span v-else-if="connectionStatus === 'connecting'">🟡</span>
          <span v-else>🔴</span>
        </div>
        <button v-if="auth.isLoggedIn" class="logout-button" @click="logout">로그아웃</button>
      </div>
    </div>

    <!-- 로그인이 필요한 경우 -->
    <div v-if="!auth.isLoggedIn" class="login-required">
      <p class="login-info">파티 모집글에서 지원을 수락하면 채팅이 시작됩니다.</p>
    </div>

    <!-- 채팅 영역 -->
    <div v-else class="chat-content">
      <!-- 연결 상태가 disconnected인 경우 연결 버튼 -->
      <div v-if="connectionStatus === 'disconnected'" class="connection-control">
        <button class="connect-button" @click="connectStomp">채팅 연결</button>
      </div>

      <!-- 메시지 표시 영역 -->
      <div v-if="connectionStatus === 'connected'" class="messages-container">
        <div ref="messagesDisplayRef" class="messages-display">
          <div v-if="recentMessages.length === 0" class="no-messages">아직 메시지가 없습니다.</div>
          <div
            v-for="(msg, index) in recentMessages"
            :key="index"
            :class="{ 'my-message': msg.sender === 'Me' }"
            class="message-item"
          >
            <div class="message-header">
              <span class="sender">{{ msg.sender }}</span>
              <span class="timestamp">{{ msg.timestamp }}</span>
            </div>
            <div class="message-content">
              {{ truncateMessage(msg.content) }}
            </div>
          </div>

          <!-- 미리보기 -->
          <div v-if="showPreview" class="message-preview">
            <div class="preview-header">최근 메시지</div>
            <div v-for="(msg, index) in latestMessages" :key="index" class="preview-item">
              <span class="preview-sender">{{ msg.sender }}:</span>
              <span class="preview-content">{{ msg.content }}</span>
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
              @keyup.enter="sendMessage"
            />
            <button :disabled="!messageInput.trim()" class="send-button" @click="sendMessage">
              📤
            </button>
            <button class="clear-button" @click="clearMessages">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-sidebar {
  width: 300px;
  background-color: var(--card-bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  min-height: 300px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  cursor: grab;
  transition:
    transform 0.2s ease,
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

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.connection-status {
  font-size: 16px;
}

.logout-button {
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #c82333;
  transform: scale(1.05);
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
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.connection-control {
  padding: 20px;
  text-align: center;
}

.connect-button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.connect-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
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
