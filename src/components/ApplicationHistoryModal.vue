<script lang="ts" setup>
/**
 * ApplicationHistoryModal 컴포넌트
 *
 * 전체 페이지 크기의 지원서 내역 모달입니다.
 * 사용자의 모든 지원서 내역을 상세하게 보여줍니다.
 */
import { computed, ref } from 'vue';

// 지원서 상태 타입 정의
type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

// 지원서 아이템 인터페이스
interface ApplicationItem {
  id: number;
  partyName: string;
  content: string;
  status: ApplicationStatus;
  submittedAt: string;
  partyType: string;
  level: string;
  responseDate?: string;
  feedback?: string;
}

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

// 필터 상태
const selectedStatus = ref<ApplicationStatus | 'all'>('all');
const searchQuery = ref('');

// 확장된 지원서 내역 데이터
const allApplications = ref<ApplicationItem[]>([
  {
    id: 1,
    partyName: '시길',
    content:
      '안녕하세요! 시길 파티에 지원하고 싶습니다. 80레벨 나이트로드로 경험이 많습니다. 매일 저녁 8시-10시 활동 가능하며, 팀플레이를 중시합니다.',
    status: 'pending',
    submittedAt: '2024-12-20 14:30',
    partyType: '시간의길',
    level: '80',
    responseDate: undefined,
    feedback: undefined,
  },
  {
    id: 2,
    partyName: '대만 사잇길',
    content:
      '88프리 완숙 캐릭터로 지원합니다. 팀플레이 잘하겠습니다! 대만 사잇길 경험 많이 있고, 효율적인 사냥 패턴 숙지하고 있습니다.',
    status: 'accepted',
    submittedAt: '2024-12-20 13:15',
    partyType: '사잇길',
    level: '88',
    responseDate: '2024-12-20 15:30',
    feedback: '경험이 풍부하시네요! 파티에 합류해주세요.',
  },
  {
    id: 3,
    partyName: '도전의 탑',
    content:
      '도탑 경험 많은 87레벨 비숍입니다. 힐 서포트 가능합니다. 매주 정기적으로 참여 가능하며, 다른 파티원들과의 소통도 원활합니다.',
    status: 'pending',
    submittedAt: '2024-12-20 12:00',
    partyType: '도전의탑',
    level: '87',
    responseDate: undefined,
    feedback: undefined,
  },
  {
    id: 4,
    partyName: '자쿠움 원정대',
    content:
      '매일 9시 참여 가능합니다. 딜러로 지원합니다. 자쿠움 패턴 완전히 숙지하고 있으며, 안정적인 딜링 가능합니다.',
    status: 'rejected',
    submittedAt: '2024-12-19 20:45',
    partyType: '원정대',
    level: '85',
    responseDate: '2024-12-20 09:00',
    feedback: '현재 딜러 자리가 모두 찼습니다. 다음 기회에 지원해주세요.',
  },
  {
    id: 5,
    partyName: '무릉도장',
    content:
      '주간 무릉도장 함께하고 싶습니다. 40층까지 경험 있습니다. 주말 시간대 활동 가능하며, 꾸준히 참여하겠습니다.',
    status: 'pending',
    submittedAt: '2024-12-19 19:20',
    partyType: '무릉도장',
    level: '82',
    responseDate: undefined,
    feedback: undefined,
  },
  {
    id: 6,
    partyName: '혼테일 원정대',
    content:
      '매일 10시 혼테일 원정대 참여하고 싶습니다. 힐러로 지원하며, 안정적인 힐링과 버프 지원 가능합니다.',
    status: 'accepted',
    submittedAt: '2024-12-19 18:00',
    partyType: '원정대',
    level: '83',
    responseDate: '2024-12-19 19:30',
    feedback: '힐러가 필요했는데 잘 맞네요! 환영합니다.',
  },
  {
    id: 7,
    partyName: '아케인포스',
    content:
      '매일 아케인포스 함께하실분! VJ부터 아르카나까지 모든 지역 경험 있습니다. 꾸준한 참여 가능합니다.',
    status: 'pending',
    submittedAt: '2024-12-19 16:45',
    partyType: '아케인포스',
    level: '89',
    responseDate: undefined,
    feedback: undefined,
  },
  {
    id: 8,
    partyName: '핑크빈 원정대',
    content: '주간 핑크빈 원정대 참여하고 싶습니다. 서포터 역할 가능하며, 패턴 숙지 완료했습니다.',
    status: 'rejected',
    submittedAt: '2024-12-18 21:30',
    partyType: '원정대',
    level: '84',
    responseDate: '2024-12-19 10:00',
    feedback: '레벨이 조금 부족합니다. 85레벨 이상일 때 다시 지원해주세요.',
  },
]);

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
        app.partyName.toLowerCase().includes(query) ||
        app.content.toLowerCase().includes(query) ||
        app.partyType.toLowerCase().includes(query),
    );
  }

  return filtered.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
});

// 상태별 통계
const statusStats = computed(() => {
  const stats = {
    total: allApplications.value.length,
    pending: 0,
    accepted: 0,
    rejected: 0,
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
 * 지원서 승인 처리
 */
const approveApplication = (applicationId: number) => {
  const application = allApplications.value.find((app) => app.id === applicationId);
  if (application) {
    application.status = 'accepted';
    alert(`${application.partyName} 지원서가 승인되었습니다.`);
  }
};

/**
 * 지원서 거절 처리
 */
const rejectApplication = (applicationId: number) => {
  const application = allApplications.value.find((app) => app.id === applicationId);
  if (application) {
    application.status = 'rejected';
    alert(`${application.partyName} 지원서가 거절되었습니다.`);
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
            <span class="stat-item pending">대기 {{ statusStats.pending }}건</span>
            <span class="stat-item accepted">승인 {{ statusStats.accepted }}건</span>
            <span class="stat-item rejected">거절 {{ statusStats.rejected }}건</span>
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
              :class="{ active: selectedStatus === 'pending' }"
              class="filter-button pending"
              @click="selectedStatus = 'pending'"
            >
              ⏳ 대기중 ({{ statusStats.pending }})
            </button>
            <button
              :class="{ active: selectedStatus === 'accepted' }"
              class="filter-button accepted"
              @click="selectedStatus = 'accepted'"
            >
              ✅ 승인됨 ({{ statusStats.accepted }})
            </button>
            <button
              :class="{ active: selectedStatus === 'rejected' }"
              class="filter-button rejected"
              @click="selectedStatus = 'rejected'"
            >
              ❌ 거절됨 ({{ statusStats.rejected }})
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
              <h3 class="party-name">{{ application.partyName }}</h3>
              <div class="party-meta">
                <span class="party-type">{{ application.partyType }}</span>
                <span class="level">Lv.{{ application.level }}</span>
              </div>
            </div>

            <!-- 지원 내용 -->
            <div class="application-content">
              <p>{{ application.content }}</p>
            </div>

            <!-- 대기중인 지원서에 승인/거절 버튼 추가 -->
            <div v-if="application.status === 'pending'" class="card-actions">
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
