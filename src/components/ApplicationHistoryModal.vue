<script lang="ts" setup>
/**
 * ApplicationHistoryModal 컴포넌트
 *
 * 전체 페이지 크기의 지원서 내역 모달입니다.
 * 사용자의 모든 지원서 내역을 상세하게 보여줍니다.
 */
import { computed, ref } from 'vue';
import type { PartyApplicationStatusTypeEnum } from '@/types/response.ts';
import { usePartyApplications } from '@/stores/usePartyApplications.ts';
import dayjs from 'dayjs';

// 지원서 상태 타입 정의
type ApplicationStatus = PartyApplicationStatusTypeEnum;

// 컴포넌트 프롭스 정의
interface Props {
  /** 모달 표시 여부 */
  show: boolean;
}

// 이벤트 정의
interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const partyApplications = usePartyApplications();

// 상태별 한글 텍스트
const statusText: Record<ApplicationStatus, string> = {
  PENDING: '대기중',
  ACCEPTED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
};

// 상태별 색상
const statusColor: Record<ApplicationStatus, string> = {
  PENDING: '#ffc107',
  ACCEPTED: '#28a745',
  REJECTED: '#dc3545',
  CANCELLED: '#8c8c8c',
};

// 필터 상태
const selectedStatus = ref<ApplicationStatus | 'all'>('all');
const searchQuery = ref('');

// 실제 지원서 데이터 사용
const allApplications = computed(() => partyApplications.applications);

// 시간 포맷팅 함수
const formatTimeAgo = (createdAt: number) => {
  const now = dayjs();
  const created = dayjs(createdAt * 1000); // 초 단위를 밀리초로 변환
  const diffMinutes = now.diff(created, 'minute');

  if (diffMinutes < 1) {
    return '방금 전';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffMinutes < 1440) {
    // 24시간
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}시간 전`;
  } else if (diffMinutes < 10080) {
    // 7일
    const diffDays = Math.floor(diffMinutes / 1440);
    return `${diffDays}일 전`;
  } else {
    return created.format('YYYY-MM-DD');
  }
};

// 필터링된 지원서 목록
const filteredApplications = computed(() => {
  let filtered = allApplications.value;

  // 상태 필터
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter((app) => app.status === selectedStatus.value);
  }

  // 검색 필터
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (app) =>
        app.partyRecruit.article.contents.toLowerCase().includes(query) ||
        app.resume.contents.toLowerCase().includes(query),
    );
  }

  return filtered.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
});

// 상태별 통계
const statusStats = computed(() => {
  const stats = {
    total: allApplications.value.length,
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  };

  allApplications.value.forEach((app) => {
    stats[app.status]++;
  });

  return stats;
});

/**
 * 모달 닫기
 */
const closeModal = () => {
  selectedStatus.value = 'all';
  searchQuery.value = '';
  emit('close');
};

/**
 * 상태 아이콘 반환
 */
const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case 'PENDING':
      return '⏳';
    case 'ACCEPTED':
      return '✅';
    case 'REJECTED':
      return '✖';
    case 'CANCELLED':
      return '📄';
    default:
      return '📄';
  }
};

/**
 * 지원서 승인 처리
 */
const approveApplication = (applicationId: number) => {
  const application = allApplications.value.find((app) => app.id === applicationId);
  if (application) {
    application.status = 'ACCEPTED';
    alert(`지원서가 승인되었습니다.`);
  }
};

/**
 * 지원서 거절 처리
 */
const rejectApplication = (applicationId: number) => {
  const application = allApplications.value.find((app) => app.id === applicationId);
  if (application) {
    application.status = 'REJECTED';
    alert(`지원서가 거절되었습니다.`);
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
  <!-- 전체보기 모달 -->
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="header-left">
          <h2>📋 전체 지원서 내역</h2>
          <div class="stats-summary">
            <span class="stat-item">전체 {{ statusStats.total }}건</span>
            <span class="stat-item pending">대기 {{ statusStats.PENDING }}건</span>
            <span class="stat-item accepted">승인 {{ statusStats.ACCEPTED }}건</span>
            <span class="stat-item rejected">거절 {{ statusStats.REJECTED }}건</span>
          </div>
        </div>
        <button class="close-button" @click="closeModal">✕</button>
      </div>

      <!-- 필터 및 검색 -->
      <div class="filter-section">
        <div class="filter-controls">
          <div class="status-filters">
            <button
              :class="{ active: selectedStatus === 'all' }"
              class="filter-button all"
              @click="selectedStatus = 'all'"
            >
              전체 ({{ statusStats.total }})
            </button>
            <button
              :class="{ active: selectedStatus === 'PENDING' }"
              class="filter-button pending"
              @click="selectedStatus = 'PENDING'"
            >
              ⏳ 대기중 ({{ statusStats.PENDING }})
            </button>
            <button
              :class="{ active: selectedStatus === 'ACCEPTED' }"
              class="filter-button accepted"
              @click="selectedStatus = 'ACCEPTED'"
            >
              ✅ 승인됨 ({{ statusStats.ACCEPTED }})
            </button>
            <button
              :class="{ active: selectedStatus === 'REJECTED' }"
              class="filter-button rejected"
              @click="selectedStatus = 'REJECTED'"
            >
              ❌ 거절됨 ({{ statusStats.REJECTED }})
            </button>
          </div>
          <div class="search-container">
            <input
              v-model="searchQuery"
              class="search-input"
              placeholder="파티명이나 내용으로 검색..."
              type="text"
            />
          </div>
        </div>
      </div>

      <!-- 지원서 목록 (카드 그리드) -->
      <div class="applications-grid">
        <div v-if="filteredApplications.length === 0" class="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>

        <div
          v-for="application in filteredApplications"
          :key="application.id"
          :class="`status-${application.status}`"
          class="application-card"
        >
          <!-- 상태 배지 (카드 상단) -->
          <div class="card-status-badge">
            <div :style="{ backgroundColor: statusColor[application.status] }" class="status-badge">
              <span class="status-icon">{{ getStatusIcon(application.status) }}</span>
              {{ statusText[application.status] }}
            </div>
          </div>

          <!-- 카드 메인 컨텐츠 -->
          <div class="card-main">
            <!-- 파티 정보 -->
            <div class="party-header">
              <h3 class="party-name">파티 모집글</h3>
              <div class="party-meta">
                <span class="party-type">{{ formatTimeAgo(application.metadata.createdAt) }}</span>
              </div>
            </div>

            <!-- 지원 내용 -->
            <div class="application-content">
              <p>{{ application.resume.contents }}</p>
            </div>

            <!-- 대기중인 지원서에 승인/거절 버튼 추가 -->
            <div v-if="application.status === 'PENDING'" class="card-actions">
              <button class="approve-button" @click="approveApplication(application.id)">
                ✅ 승인
              </button>
              <button class="reject-button" @click="rejectApplication(application.id)">
                <span class="reject-icon">✖</span> 거절
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  width: 95vw;
  height: 90vh;
  max-width: 1200px;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.header-left h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.stats-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.stat-item.pending {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  color: #856404;
}

.stat-item.accepted {
  background-color: rgba(40, 167, 69, 0.1);
  border-color: #28a745;
  color: #155724;
}

.stat-item.rejected {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: #dc3545;
  color: #721c24;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.filter-section {
  padding: 20px 32px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.status-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-button.active {
  background-color: var(--primary-color, #007bff);
  color: white;
  border-color: var(--primary-color, #007bff);
}

.search-container {
  flex-shrink: 0;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  width: 250px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* 카드 그리드 레이아웃 */
.applications-grid {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  align-content: start;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--card-description-color);
}

/* 지원서 카드 스타일 */
.application-card {
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: fit-content;
  position: relative;
  display: flex;
  flex-direction: column;
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 상태별 테두리 색상 */
.application-card.status-accepted {
  border-top: 4px solid #28a745;
}

.application-card.status-rejected {
  border-top: 4px solid #dc3545;
}

.application-card.status-pending {
  border-top: 4px solid #ffc107;
}

/* 상태 배지 */
.card-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.status-badge {
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-icon {
  font-size: 12px;
}

/* 카드 메인 컨텐츠 */
.card-main {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 파티 헤더 */
.party-header {
  margin-bottom: 8px;
}

.party-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
  margin-right: 60px; /* 상태 배지 공간 확보 */
}

.party-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.party-type,
.level {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--card-description-color);
  font-weight: 500;
}

/* 지원 내용 */
.application-content {
  flex: 1;
}

.application-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--card-description-color);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 카드 액션 버튼 */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.card-actions .approve-button {
  flex: 1;
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-actions .approve-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.card-actions .reject-button {
  flex: 1;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-actions .reject-button:hover {
  background-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.reject-icon {
  color: #ffffff;
  font-weight: bold;
  font-size: 11px;
}

/* 모달 애니메이션 */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 스크롤바 스타일 */
.applications-grid::-webkit-scrollbar {
  width: 8px;
}

.applications-grid::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 4px;
}

.applications-grid::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.applications-grid::-webkit-scrollbar-thumb:hover {
  background: var(--card-description-color);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .modal-content {
    width: 98vw;
    height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .header-left h2 {
    font-size: 20px;
  }

  .stats-summary {
    gap: 8px;
  }

  .filter-section {
    padding: 16px 20px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-input {
    width: 100%;
  }

  .applications-grid {
    padding: 16px 20px;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .application-card {
    margin-bottom: 0;
  }

  .card-main {
    padding: 16px;
  }

  .party-name {
    font-size: 16px;
    margin-right: 50px;
  }
}
</style>
