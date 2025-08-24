<script lang="ts" setup>
/**
 * PartyList 컴포넌트
 *
 * 이 컴포넌트는 파티/이벤트 카드 목록을 표시하고 페이지네이션을 관리합니다.
 * 검색어와 선택된 필터에 따라 카드를 필터링하고, 페이지당 일정 수의 카드를 표시합니다.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import PartyCard from './PartyCard.vue';
import { useResume } from '@/stores/useResume.ts';
import { fetchParties, parties } from '@/composables/useParty.ts';
import { usePartyOwner } from '@/stores/usePartyOwner.ts';

// 컴포넌트 프롭스 정의
const props = defineProps<{
  /** 검색어 */
  searchQuery: string;
  /** 선택된 필터 배열 */
  selectedFilter: string[];
  /** 엔터 키 즉시 검색 트리거 */
  searchEnterTrigger?: number;
}>();

/** 현재 페이지 번호 */
const currentPage = ref(1);

const resumeStore = useResume();
const partyOwner = usePartyOwner();

/**
 * 사이드바 유무에 따른 동적 컬럼 수 계산
 */
const columnsCount = computed(() => {
  // 지원서 목록이 숨겨져 있으면 더 많은 컬럼 사용
  return partyOwner.hasCreatedParty ? 3 : 4; // 사이드바 있으면 3열, 없으면 4열
});

/**
 * 동적 페이지당 카드 수 계산
 */
const dynamicCardsPerPage = computed(() => {
  return columnsCount.value * 4; // 4행 기준
});

/**
 * 디바운스된 검색어를 위한 ref
 */
const debouncedSearchQuery = ref('');

/**
 * 검색어 디바운싱 로직
 */
let searchTimeout: number | null = null;
watch(
  () => props.searchQuery,
  (newQuery) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
      debouncedSearchQuery.value = newQuery;
      await fetchParties(newQuery);
    }, 300); // 300ms 디바운스
  },
);

/**
 * 총 페이지 수 계산
 * 필터링된 카드 수와 동적 페이지당 카드 수를 기반으로 계산합니다.
 */
const totalPages = computed(() => {
  return Math.ceil(parties.value.length / dynamicCardsPerPage.value);
});

/**
 * 현재 페이지에 표시할 카드 목록
 * 현재 페이지 번호에 따라 해당 페이지에 표시될 카드들만 추출합니다.
 */
const paginatedParties = computed(() => {
  const startIndex = (currentPage.value - 1) * dynamicCardsPerPage.value;
  const endIndex = startIndex + dynamicCardsPerPage.value;
  return parties.value.slice(startIndex, endIndex);
});

/**
 * 페이지네이션 초기화 함수
 * 검색어나 필터가 변경되었을 때 첫 페이지로 리셋합니다.
 */
const resetPagination = () => {
  currentPage.value = 1;
};

// 디바운스된 검색어나 필터 변경 시 페이지네이션 초기화
watch([debouncedSearchQuery, () => props.selectedFilter], resetPagination);

// 사이드바 상태 변경 시 페이지네이션 초기화 (카드 수가 변경되므로)
watch(() => partyOwner.hasCreatedParty, resetPagination);

/**
 * 엔터 키 즉시 검색 처리
 */
watch(
  () => props.searchEnterTrigger,
  async (newTrigger) => {
    if (newTrigger && newTrigger > 0) {
      // 기존 디바운스 타이머 클리어
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      // 즉시 검색 실행
      debouncedSearchQuery.value = props.searchQuery;
      await fetchParties(props.searchQuery);
      resetPagination();
    }
  },
);

onMounted(async () => {
  // 초기 검색어 설정 및 데이터 로드
  debouncedSearchQuery.value = props.searchQuery;
  parties.value = await fetchParties(props.searchQuery);
  // 파티 목록을 가져온 후 지원 상태도 가져오기
  await resumeStore.fetchAppliedParties();
});

onUnmounted(() => {
  // 컴포넌트 언마운트 시 타이머 정리
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<template>
  <div class="card-list-container">
    <!-- 카드 목록 영역 -->
    <div class="card-list-wrapper">
      <div class="card-list" :class="partyOwner.hasCreatedParty ? 'has-sidebar' : 'no-sidebar'">
        <PartyCard
          v-for="party in paginatedParties"
          :key="party.id"
          :id="party.id"
          :contents="party.article.contents"
          :currentMembers="party.currentMembers ?? 1"
          :userUniqueId="party.userUniqueId"
          :isApplied="resumeStore.appliedParties.includes(party.id)"
          :isRejected="resumeStore.rejectedParties.includes(party.id)"
        />
      </div>
    </div>

    <!-- 페이지네이션 영역 -->
    <div class="pagination-wrapper">
      <div v-if="totalPages > 1" class="pagination">
        <!-- 이전 페이지 버튼 -->
        <button :disabled="currentPage === 1" class="pagination-button" @click="currentPage--">
          &lt;
        </button>

        <!-- 페이지 번호 목록 -->
        <div class="page-numbers">
          <span
            v-for="page in totalPages"
            :key="page"
            :class="{ active: page === currentPage }"
            class="page-number"
            @click="currentPage = page"
          >
            {{ page }}
          </span>
        </div>

        <!-- 다음 페이지 버튼 -->
        <button
          :disabled="currentPage === totalPages"
          class="pagination-button"
          @click="currentPage++"
        >
          &gt;
        </button>
      </div>
    </div>

    <!-- 검색 결과가 없을 때 메시지 -->
    <div v-if="parties.length === 0" class="no-results">검색 결과가 없습니다.</div>
  </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.card-list-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* 부모 컨테이너 높이에 맞춤 */
  padding: 20px 0 20px 20px; /* 상하 여백만, 좌우 여백 제거 */
}

/* 카드 목록 래퍼 */
.card-list-wrapper {
  flex: 1; /* 남은 공간 모두 사용 */
  display: flex;
  align-items: flex-start; /* 카드를 상단부터 배치 */
  justify-content: flex-start; /* 왼쪽 정렬 */
}

/* 카드 목록 플렉스 레이아웃 */
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5vw; /* 간격을 더 넓게 */
  width: 100%;
  max-width: 1400px; /* 최대 너비를 늘려서 4열 수용 */
  margin: 0; /* 왼쪽 정렬로 변경 */
  align-items: flex-start; /* 카드를 상단 정렬 */
  justify-content: flex-start; /* 왼쪽 정렬 명시 */
}

/* 사이드바가 있을 때 - 3열 배치 */
.card-list.has-sidebar > * {
  flex: 0 0 calc(33.333% - 1vw);
  max-width: calc(33.333% - 1vw);
}

/* 사이드바가 없을 때 - 4열 배치 */
.card-list.no-sidebar > * {
  flex: 0 0 calc(25% - 1.125vw);
  max-width: calc(25% - 1.125vw);
}

/* 페이지네이션 래퍼 */
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  flex-shrink: 0; /* 크기 고정 */
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .card-list {
    gap: 3vw;
    max-width: 800px;
  }

  .card-list.has-sidebar > *,
  .card-list.no-sidebar > * {
    flex: 0 0 calc(50% - 1.5vw); /* 태블릿에서 2열 */
    max-width: calc(50% - 1.5vw);
  }
}

@media (max-width: 768px) {
  .card-list {
    gap: 4vw;
    max-width: 400px;
  }

  .card-list.has-sidebar > *,
  .card-list.no-sidebar > * {
    flex: 0 0 100%; /* 모바일에서 1열 */
    max-width: 100%;
  }

  .card-list-container {
    padding: 10px 0;
  }
}

@media (max-width: 480px) {
  .card-list {
    gap: 5vw;
    max-width: 350px;
  }
}

/* 페이지네이션 컨테이너 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  width: 100%;
}

/* 페이지네이션 버튼 스타일 */
.pagination-button {
  padding: 8px 16px;
  background-color: var(--button-bg-color, #f0f0f0);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px; /* 가시성을 위해 글꼴 크기 증가 */
  font-weight: bold; /* 가시성을 위해 굵게 표시 */
  color: var(--text-color, #333);
  transition:
    background-color 0.2s,
    color 0.2s;
}

/* 페이지네이션 버튼 호버 효과 */
.pagination-button:hover:not(:disabled) {
  background-color: var(--button-hover-bg-color, #e0e0e0);
}

/* 비활성화된 페이지네이션 버튼 */
.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed; /* 클릭 불가 커서 */
}

/* 다크 모드에서 버튼 가시성 향상 */
:root.dark .pagination-button {
  background-color: #2c3e50;
  color: #ffffff;
  border-color: #4a5f72;
}

:root.dark .pagination-button:hover:not(:disabled) {
  background-color: #3a4d61;
}

/* 페이지 번호 컨테이너 */
.page-numbers {
  display: flex;
  gap: 8px;
}

/* 개별 페이지 번호 스타일 */
.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%; /* 원형 모양 */
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color, #333);
  transition:
    background-color 0.2s,
    color 0.2s;
}

/* 페이지 번호 호버 효과 */
.page-number:hover {
  background-color: var(--button-hover-bg-color, #e0e0e0);
}

/* 현재 활성화된 페이지 번호 */
.page-number.active {
  background-color: var(--primary-color, #3366cc);
  color: white;
}

/* 다크 모드에서 페이지 번호 가시성 향상 */
:root.dark .page-number {
  color: #ffffff;
}

:root.dark .page-number:hover {
  background-color: #3a4d61;
}

:root.dark .page-number.active {
  background-color: #4a90e2; /* 다크 모드에서 더 밝은 파란색으로 가시성 향상 */
  color: white;
}

/* 검색 결과 없음 메시지 */
.no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--text-color, #666);
  font-size: 16px;
}
</style>
