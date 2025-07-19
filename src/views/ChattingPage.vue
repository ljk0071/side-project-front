<script lang="ts" setup>
/**
 * Chat 컴포넌트
 *
 * STOMP를 사용한 WebSocket 채팅 기능을 제공하는 컴포넌트입니다.
 * Spring Boot 서버와 실시간 메시지 송수신이 가능합니다.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/stores/useAuth.ts';
import { useElementHover } from '@vueuse/core';
import { useRefreshDetect } from '@/stores/useRefreshDetect.ts';

const stompClient = ref<Client | null>(null);
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected');
const messageInput = ref('');
const receivedMessages = ref<Array<{ timestamp: string; content: string; sender: string }>>([]);

const auth = useAuth();
const refreshDetect = useRefreshDetect();
const password = ref('');
const messagesListRef = ref<HTMLElement | null>(null);
const messagesDisplayRef = ref<HTMLElement | null>(null);
const isMessagesDisplayHovered = useElementHover(messagesDisplayRef);

const latestMessages = computed(() => {
  return receivedMessages.value.slice(-3).reverse();
});

const showPreview = computed(() => {
  return isMessagesDisplayHovered.value && receivedMessages.value.length > 0;
});

const connectStomp = () => {
  if (stompClient.value?.connected) {
    return;
  }

  connectionStatus.value = 'connecting';

  stompClient.value = new Client({
    webSocketFactory: () => new SockJS(`${window.location.origin}:8080/ws/chat`),
    connectHeaders: {},
    debug: (str) => {
      console.log('STOMP Debug:', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      connectionStatus.value = 'connected';
      console.log('STOMP 연결됨');

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
      console.error('STOMP 에러:', frame.headers['message'], frame.body);
    },
    onDisconnect: () => {
      connectionStatus.value = 'disconnected';
      console.log('STOMP 연결 해제됨');
    },
  });

  stompClient.value.activate();
};

const disconnectStomp = () => {
  if (stompClient.value) {
    stompClient.value.deactivate();
    stompClient.value = null;
    connectionStatus.value = 'disconnected';
  }
};

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

const clearMessages = () => {
  receivedMessages.value = [];
};

const scrollToBottom = () => {
  nextTick(() => {
    const messagesDisplay = document.querySelector('.messages-display');
    if (messagesDisplay) {
      messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
    }
  });
};

const login = async () => {
  const success = await auth.login(auth.userInfo.userId, password.value);
  if (success) {
    password.value = '';
    connectStomp();
  }
};

const logout = () => {
  auth.logout();
  password.value = '';
};

watch(
  receivedMessages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

onMounted(() => {
  if (auth.isLoggedIn) {
    connectStomp();
  }
});

onUnmounted(() => {
  disconnectStomp();
});
</script>

<template>
  <div class="chat-page">
    <!-- 헤더 -->
    <header class="chat-header">
      <h1>실시간 채팅</h1>
      <router-link class="back-button" to="/">← 메인으로</router-link>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 채팅 영역 -->
      <div class="chat-section">
        <!-- STOMP 연결 상태 및 메시지 송수신 -->
        <div class="stomp-container">
          <!-- 연결 상태 -->
          <div class="connection-control">
            <span :class="connectionStatus" class="connection-status">
              {{
                connectionStatus === 'connected'
                  ? '🟢 STOMP 연결됨'
                  : connectionStatus === 'connecting'
                    ? '🟡 연결 중...'
                    : '🔴 연결 끊김'
              }}
            </span>
            <button
              v-if="connectionStatus !== 'connected'"
              class="stomp-button connect"
              @click="connectStomp()"
            >
              연결
            </button>
            <button v-else class="stomp-button disconnect" @click="disconnectStomp()">
              연결 해제
            </button>
          </div>

          <!-- 메시지 입력 및 전송 -->
          <div v-if="connectionStatus === 'connected'" class="message-input-section">
            <div class="input-group">
              <input
                v-model="messageInput"
                class="message-input"
                placeholder="메시지를 입력하세요..."
                type="text"
                @keyup.enter="sendMessage()"
              />
              <button
                :disabled="!messageInput.trim()"
                class="stomp-button send"
                @click="sendMessage()"
              >
                전송
              </button>
              <button class="stomp-button clear" @click="clearMessages()">지우기</button>
            </div>
          </div>

          <!-- 수신된 메시지 표시 -->
          <div v-if="receivedMessages.length > 0" ref="messagesDisplayRef" class="messages-display">
            <h3>메시지 기록</h3>
            <div ref="messagesListRef" class="messages-list">
              <div
                v-for="(msg, index) in receivedMessages"
                :key="index"
                :class="{ 'my-message': msg.sender === 'Me' }"
                class="message-item"
              >
                <div class="message-header">
                  <span class="sender">{{ msg.sender }}</span>
                  <span class="timestamp">{{ msg.timestamp }}</span>
                </div>
                <div class="message-content">{{ msg.content }}</div>
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
        </div>
      </div>

      <!-- 로그인 영역 -->
      <div class="login-section">
        <div class="login-container">
          <h2>로그인</h2>
          <div v-if="!auth.isLoggedIn" class="login-form">
            <div class="form-group">
              <label for="userId">ID</label>
              <input
                id="userId"
                v-model="auth.userInfo.userId"
                class="form-input"
                placeholder="사용자 ID를 입력하세요"
                type="text"
                @keyup.enter="login"
              />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="password"
                class="form-input"
                placeholder="비밀번호를 입력하세요"
                type="password"
                @keyup.enter="login"
              />
            </div>
            <button
              :disabled="!auth.userInfo.userId || !password || auth.isLoading"
              class="login-button"
              @click="login"
            >
              {{ auth.isLoading ? '로그인 중...' : '로그인' }}
            </button>
            <div v-if="auth.loginError" class="error-message">{{ auth.loginError }}</div>
          </div>
          <div v-else class="login-success">
            <div class="user-info">
              <span class="welcome-text">환영합니다, {{ auth.userInfo.name }}님!</span>
              <button class="logout-button" @click="logout">로그아웃</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--border-color);
  max-width: 1440px;
  margin: 0 auto;
}

.chat-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.back-button {
  padding: 8px 16px;
  background-color: var(--logo-color, orange);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 메인 컨테이너 스타일 */
.main-container {
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

/* 채팅 섹션 스타일 */
.chat-section {
  flex: 1;
  padding: 20px 25px;
}

/* STOMP 컨테이너 스타일 */
.stomp-container {
  height: 100%;
}

.connection-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.connection-status {
  font-size: 14px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  background-color: var(--header-bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.connection-status.connected {
  background-color: #d4edda;
  color: #155724;
}

.connection-status.connecting {
  background-color: #fff3cd;
  color: #856404;
}

.connection-status.disconnected {
  background-color: #f8d7da;
  color: #721c24;
}

.stomp-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stomp-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stomp-button.connect {
  background-color: #28a745;
  color: white;
}

.stomp-button.connect:hover:not(:disabled) {
  background-color: #218838;
}

.stomp-button.disconnect {
  background-color: #dc3545;
  color: white;
}

.stomp-button.disconnect:hover:not(:disabled) {
  background-color: #c82333;
}

.stomp-button.send {
  background-color: #007bff;
  color: white;
}

.stomp-button.send:hover:not(:disabled) {
  background-color: #0056b3;
}

.stomp-button.clear {
  background-color: #6c757d;
  color: white;
}

.stomp-button.clear:hover:not(:disabled) {
  background-color: #5a6268;
}

/* 메시지 입력 섹션 */
.message-input-section {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--header-bg-color);
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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

/* 메시지 표시 영역 */
.messages-display {
  background-color: var(--header-bg-color);
  border-radius: 8px;
  padding: 15px;
  height: calc(100vh - 400px);
  overflow-y: auto;
  position: relative;
}

.messages-display h3 {
  margin: 0 0 15px 0;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  padding: 10px;
  border-radius: 8px;
  background-color: var(--bg-color);
  border-left: 3px solid #007bff;
}

.message-item.my-message {
  border-left-color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.sender {
  font-weight: 600;
  color: var(--text-color);
  font-size: 12px;
}

.timestamp {
  font-size: 11px;
  color: var(--text-color);
  opacity: 0.7;
}

.message-content {
  color: var(--text-color);
  font-size: 14px;
  word-wrap: break-word;
}

/* 로그인 섹션 스타일 */
.login-section {
  width: 300px;
  padding: 20px;
  background-color: var(--header-bg-color);
  border-left: 1px solid var(--border-color);
}

.login-container {
  height: 100%;
}

.login-container h2 {
  margin: 0 0 20px 0;
  color: var(--text-color);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.form-input {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.login-button {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 8px 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
}

.login-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.welcome-text {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
}

.logout-button {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #c82333;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .login-section {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }

  .chat-header {
    padding: 15px 20px;
  }

  .chat-header h1 {
    font-size: 20px;
  }

  .chat-section {
    padding: 15px 20px;
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .stomp-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .connection-status {
    font-size: 12px;
    padding: 4px 8px;
  }

  .messages-display {
    height: 300px;
  }

  .message-input {
    margin-bottom: 10px;
  }

  .input-group .stomp-button {
    margin-bottom: 5px;
  }
}
</style>
