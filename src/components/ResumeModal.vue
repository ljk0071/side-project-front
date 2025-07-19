<script lang="ts" setup>
/**
 * ResumeModal 컴포넌트
 *
 * 지원서 작성을 위한 모달 컴포넌트입니다.
 * 사용자가 지원서 내용을 입력하고 제출할 수 있는 기능을 제공합니다.
 */
import { ref } from 'vue';
import { useAuth } from '@/stores/useAuth';
import { customWarning, useCustomModal } from '@/composables/useCustomModal.ts';
import { openDiscordLogin } from '@/utils/discordAuth.ts';

// 컴포넌트 프롭스 정의
interface Props {
  /** 모달 표시 여부 */
  show: boolean;
}

// 이벤트 정의
interface Emits {
  (e: 'close'): void;

  (e: 'submit', content: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const auth = useAuth();
const { customConfirm } = useCustomModal();

/** 지원서 내용 */
const applicationContent = ref('');

/**
 * 모달 닫기
 */
const closeModal = () => {
  applicationContent.value = '';
  emit('close');
};

/**
 * 지원서 제출
 */
const submitResume = async () => {
  if (applicationContent.value.trim()) {
    emit('submit', applicationContent.value);
    applicationContent.value = '';
  } else {
    await customWarning('내용을 입력해주세요.');
    return;
  }
  if (!auth.isAuthenticated) {
    const confirmed = await customConfirm({
      title: '로그인 필요',
      message: '디코로 3초면 끝남.\n지금 바로 등록 ㄱㄱ',
      confirmText: 'ㄱㄱ',
      cancelText: 'ㄴㄴ',
      iconType: 'info',
    });
    if (confirmed) {
      openDiscordLogin();
    }
    return;
  }
};

/**
 * 모달 외부 클릭 처리
 */
const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};
</script>

<template>
  <!-- 지원서 모달 -->
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>지원서 작성</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <textarea
          v-model="applicationContent"
          class="application-textarea"
          placeholder="지원서 내용을 작성해주세요..."
        ></textarea>
      </div>
      <div class="modal-footer">
        <button class="submit-button" @click="submitResume">제출</button>
        <button class="cancel-button" @click="closeModal">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 모달 오버레이 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}

/* 모달 컨텐츠 스타일 */
.modal-content {
  background-color: var(--card-bg-color);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

/* 모달 헤더 스타일 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

/* 모달 바디 스타일 */
.modal-body {
  padding: 24px;
}

.application-textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: border-color 0.3s ease;
}

.application-textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.application-textarea::placeholder {
  color: var(--card-description-color);
}

/* 모달 푸터 스타일 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.cancel-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.submit-button {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

/* 모달 애니메이션 */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }

  .application-textarea {
    min-height: 150px;
  }
}
</style>
