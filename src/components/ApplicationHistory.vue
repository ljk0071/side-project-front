<script lang="ts" setup>
/**
 * ApplicationHistory 컴포넌트
 *
 * 지원서 제출 내역을 스택 형식으로 표시하는 사이드바 컴포넌트입니다.
 * 사용자가 제출한 지원서들의 상태와 내용을 보여줍니다.
 */
import { computed, ref } from 'vue';
import ApplicationHistoryModal from './ApplicationHistoryModal.vue';

// 이벤트 정의
interface Emits {
  (e: 'open-full-view'): void;
}

const emit = defineEmits<Emits>();

// 모달 상태
const showFullModal = ref(false);

// 지원서 상태 타입 정의
type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

// 지원서 아이템 인터페이스
interface ApplicationItem {
  id: number;
  partyName: string;
  content: string;
  status: ApplicationStatus;
  submittedAt: string;
}

// 상태별 한글 텍스트
const statusText: Record<ApplicationStatus, string> = {
  pending: '대기중',
  accepted: '승인됨',
  rejected: '거절됨',
};

// 상태별 색상
const statusColor: Record<ApplicationStatus, string> = {
  pending: '#ffc107',
  accepted: '#28a745',
  rejected: '#dc3545',
};

// 임시 지원서 내역 데이터
const applications = ref<ApplicationItem[]>([
  {
    id: 1,
    partyName: '시길',
    content: '안녕하세요! 시길 파티에 지원하고 싶습니다. 80레벨 나이트로드로 경험이 많습니다.',
    status: 'pending',
    submittedAt: '2024-12-20 14:30',
  },
  {
    id: 2,
    partyName: '대만 사잇길',
    content: '88프리 완숙 캐릭터로 지원합니다. 팀플레이 잘하겠습니다!',
    status: 'accepted',
    submittedAt: '2024-12-20 13:15',
  },
  {
    id: 3,
    partyName: '도전의 탑',
    content: '도탑 경험 많은 87레벨 비숍입니다. 힐 서포트 가능합니다.',
    status: 'pending',
    submittedAt: '2024-12-20 12:00',
  },
  {
    id: 4,
    partyName: '자쿠움 원정대',
    content: '매일 9시 참여 가능합니다. 딜러로 지원합니다.',
    status: 'rejected',
    submittedAt: '2024-12-19 20:45',
  },
  {
    id: 5,
    partyName: '무릉도장',
    content: '주간 무릉도장 함께하고 싶습니다. 40층까지 경험 있습니다.',
    status: 'pending',
    submittedAt: '2024-12-19 19:20',
  },
]);

/**
 * 내용 일부만 표시하는 함수
 */
const truncateContent = (content: string, maxLength: number = 50) => {
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
};

/**
 * 상태 아이콘 반환
 */
const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'accepted':
      return '✅';
    case 'rejected':
      return '✖';
    default:
      return '📄';
  }
};

/**
 * 전체보기 모달 열기
 */
const openFullView = () => {
  showFullModal.value = true;
};

/**
 * 전체보기 모달 닫기
 */
const closeFullView = () => {
  showFullModal.value = false;
};

/**
 * 지원서 승인 처리
 */
const approveApplication = (applicationId: number) => {
  const application = applications.value.find((app) => app.id === applicationId);
  if (application) {
    application.status = 'accepted';
    alert(`${application.partyName} 지원서가 승인되었습니다.`);
  }
};

/**
 * 지원서 거절 처리
 */
const rejectApplication = (applicationId: number) => {
  const application = applications.value.find((app) => app.id === applicationId);
  if (application) {
    application.status = 'rejected';
    alert(`${application.partyName} 지원서가 거절되었습니다.`);
  }
};

/**
 * 드래그 관련 상태와 함수들
 */
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: 0, y: 0 });
const applicationHistoryRef = ref<HTMLElement | null>(null);

// 원래 크기 저장
const originalSize = ref({ width: 0, height: 0 });

/**
 * 마우스 드래그 시작
 */
const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  const rect = applicationHistoryRef.value?.getBoundingClientRect();
  if (rect) {
    // 원래 크기 저장
    originalSize.value = {
      width: rect.width,
      height: rect.height,
    };

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
    width: `${originalSize.value.width}px`,
    height: `${originalSize.value.height}px`,
    maxHeight: 'none', // 드래그 중에는 최대 높이 제한 해제
    minHeight: 'unset', // 최소 높이 제한 해제
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
</script>

<template>
  <div
    ref="applicationHistoryRef"
    :class="{ dragging: isDragging }"
    :style="dragStyle"
    class="application-history"
    @dragstart="onDragStart"
    @mousedown="onMouseDown"
  >
    <div class="history-header">
      <h3>지원서 내역</h3>
      <span class="total-count">{{ applications.length }}건</span>
    </div>

    <div class="history-list">
      <div
        v-for="application in applications"
        :key="application.id"
        :class="`status-${application.status}`"
        class="application-item"
      >
        <div class="item-header">
          <div class="party-name">
            <span class="status-icon">{{ getStatusIcon(application.status) }}</span>
            {{ application.partyName }}
          </div>
          <div :style="{ backgroundColor: statusColor[application.status] }" class="status-badge">
            {{ statusText[application.status] }}
          </div>
        </div>

        <div class="item-content">
          {{ truncateContent(application.content) }}
        </div>

        <div class="item-footer">
          <span class="submitted-time">{{ application.submittedAt }}</span>
          <!-- 대기중인 지원서에 승인/거절 버튼 추가 -->
          <div v-if="application.status === 'pending'" class="action-buttons">
            <button class="approve-button" @click="approveApplication(application.id)">승인</button>
            <button class="reject-button" @click="rejectApplication(application.id)">거절</button>
          </div>
        </div>
      </div>
    </div>

    <div class="history-footer">
      <button class="view-all-button" @click="openFullView">전체보기</button>
    </div>

    <!-- 전체보기 모달 -->
    <ApplicationHistoryModal :show="showFullModal" @close="closeFullView" />
  </div>
</template>

<style scoped>
.application-history {
  width: 300px;
  background-color: var(--card-bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  cursor: grab;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.application-history:active {
  cursor: grabbing;
}

.application-history:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.application-history.dragging {
  cursor: grabbing;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform: rotate(-2deg);
  user-select: none;
}

.history-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-bg-color);
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-color);
}

.total-count {
  font-size: 12px;
  color: var(--card-description-color);
  background-color: var(--bg-color);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.application-item {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.application-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color, #3366cc);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.party-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  font-size: 16px;
}

.status-badge {
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

.item-content {
  font-size: 12px;
  color: var(--card-description-color);
  line-height: 1.4;
  margin-bottom: 8px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.submitted-time {
  font-size: 11px;
  color: var(--card-description-color);
  opacity: 0.7;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.approve-button {
  padding: 4px 8px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.reject-button {
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reject-button:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.history-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.view-all-button {
  width: 100%;
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-button:hover {
  background-color: var(--primary-color, #3366cc);
  color: white;
  border-color: var(--primary-color, #3366cc);
}

/* 상태별 특별 스타일 */
.application-item.status-accepted {
  border-left: 3px solid #28a745;
}

.application-item.status-rejected {
  border-left: 3px solid #dc3545;
}

.application-item.status-pending {
  border-left: 3px solid #ffc107;
}

/* 스크롤바 스타일 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--card-description-color);
}

/* 모바일 반응형 */
@media (max-width: 1200px) {
  .application-history {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .application-history {
    display: none;
  }
}
</style>
