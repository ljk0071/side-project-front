<script lang="ts" setup>
/**
 * CustomModal 컴포넌트
 *
 * 사이트 UI에 맞는 custom한 모달창
 * alert, confirm 기능을 제공하며 오렌지 테마 색상 사용
 */
import { computed, ref, watch } from 'vue';

// 프롭스 정의
const props = defineProps<{
  /** 모달 표시 여부 */
  show: boolean;
  /** 모달 타입 */
  type: 'alert' | 'confirm';
  /** 모달 제목 */
  title?: string;
  /** 모달 메시지 */
  message: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 아이콘 타입 */
  iconType?: 'success' | 'error' | 'warning' | 'info';
}>();

// 이벤트 정의
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

// 상태 관리
const isVisible = ref(false);
const isAnimating = ref(false);

// 계산된 속성들
const modalClasses = computed(() => ({
  'custom-modal': true,
  show: isVisible.value,
  animating: isAnimating.value,
}));

const iconClasses = computed(() => ({
  'modal-icon': true,
  [`icon-${props.iconType || 'info'}`]: true,
}));

const confirmButtonText = computed(() => props.confirmText || '확인');
const cancelButtonText = computed(() => props.cancelText || '취소');

// 메서드들
const closeModal = () => {
  isAnimating.value = true;
  setTimeout(() => {
    isVisible.value = false;
    isAnimating.value = false;
    emit('close');
  }, 300);
};

const handleConfirm = () => {
  emit('confirm');
  closeModal();
};

const handleCancel = () => {
  emit('cancel');
  closeModal();
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    if (props.type === 'alert') {
      closeModal();
    } else {
      handleCancel();
    }
  }
};

// ESC 키 처리
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (props.type === 'alert') {
      closeModal();
    } else {
      handleCancel();
    }
  }
};

// 모달 표시 상태 감시
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      isVisible.value = true;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 애니메이션 효과를 위해 약간의 지연을 줍니다.
      setTimeout(() => {
        isVisible.value = false;
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      }, 300); // 애니메이션 시간과 일치시키는 것이 좋습니다.
    }
  },
);
</script>

<template>
  <teleport to="body">
    <div v-if="show" :class="modalClasses" class="custom-modal-overlay" @click="handleOverlayClick">
      <div class="custom-modal-container">
        <div class="custom-modal-content">
          <!-- 헤더 -->
          <div class="modal-header">
            <div class="modal-icon-container">
              <div :class="iconClasses">
                <div v-if="iconType === 'success'" class="icon-shape success"></div>
                <div v-else-if="iconType === 'error'" class="icon-shape error"></div>
                <div v-else-if="iconType === 'warning'" class="icon-shape warning"></div>
                <div v-else class="icon-shape info"></div>
              </div>
            </div>
            <h3 v-if="title" class="modal-title">{{ title }}</h3>
          </div>

          <!-- 메시지 -->
          <div class="modal-body">
            <p class="modal-message">{{ message }}</p>
          </div>

          <!-- 버튼 -->
          <div class="modal-footer">
            <button class="modal-button confirm-button" @click="handleConfirm">
              {{ confirmButtonText }}
            </button>
            <button
              v-if="type === 'confirm'"
              class="modal-button cancel-button"
              @click="handleCancel"
            >
              {{ cancelButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
@keyframes icon-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg-color);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-modal-overlay.show {
  opacity: 1;
}

.custom-modal-overlay.show .modal-icon {
  animation: icon-pulse 0.5s ease-in-out 0.2s;
}

.custom-modal-container {
  transform: scale(0.8) translateY(-50px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.custom-modal-overlay.show .custom-modal-container {
  transform: scale(1) translateY(0);
}

.custom-modal-content {
  background: var(--card-bg-color);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 360px; /* 너비 축소 */
  width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color);
}

.modal-header {
  padding: 20px 20px 12px; /* 패딩 조정 */
  text-align: center;
  background: var(--header-bg-color);
  color: var(--text-color);
  position: relative;
  border-bottom: 1px solid var(--border-color);
}

.modal-icon-container {
  margin-bottom: 10px;
}

.modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-color);
  margin: 0 auto;
  border: 1px solid var(--border-color);
}

.icon-shape {
  width: 24px;
  height: 24px;
}

.icon-shape.success {
  background-color: #4caf50;
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
}

.icon-shape.error {
  background-color: #f44336;
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>');
}

.icon-shape.warning {
  background-color: #ff9800;
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V7h2v7z"/></svg>');
}

.icon-shape.info {
  background-color: #2196f3;
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>');
}

.modal-title {
  margin: 0;
  font-size: 18px; /* 폰트 크기 조정 */
  font-weight: 700;
  color: var(--text-color);
}

.modal-body {
  padding: 20px; /* 패딩 조정 */
  text-align: center;
}

.modal-message {
  white-space: pre;
  margin: 0;
  font-size: 15px; /* 폰트 크기 조정 */
  line-height: 1.5;
  color: var(--text-color);
}

.modal-footer {
  padding: 12px 20px 20px; /* 패딩 조정 */
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.modal-button {
  padding: 8px 18px; /* 패딩 조정 */
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 90px;
}

.confirm-button {
  background-color: #007bff;
  color: white;
}

.confirm-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.cancel-button {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.cancel-button:hover {
  background-color: var(--header-bg-color);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

/* 반응형 */
@media (max-width: 768px) {
  .custom-modal-content {
    max-width: 320px;
  }

  .modal-header {
    padding: 18px 18px 10px;
  }

  .modal-body {
    padding: 18px;
  }

  .modal-footer {
    padding: 10px 18px 18px;
    flex-direction: column;
  }

  .modal-button {
    width: 100%;
  }
}
</style>
