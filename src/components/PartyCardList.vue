<script lang="ts" setup>
/**
 * PartyList 컴포넌트
 *
 * 이 컴포넌트는 파티/이벤트 카드 목록을 표시하고 페이지네이션을 관리합니다.
 * 검색어와 선택된 필터에 따라 카드를 필터링하고, 페이지당 일정 수의 카드를 표시합니다.
 */
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import PartyCard from './PartyCard.vue';
// import {koreanSearch} from '@/utils/koreanSearch'; // 서버에서 검색 처리하므로 미사용
import {kyWithCustom} from '@/utils/ky/kyWithCustom.ts';
import type {Party} from '@/components/PartyCard.vue';
import {customSuccess} from "@/composables/useCustomModal.ts";

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
/** 페이지당 카드 수 */
const cardsPerPage = 12; // 3열 x 3행 = 9개

/**
 * 카드 데이터 배열
 * 각 카드는 제목, 설명, 태그, 이미지 색상, 현재 멤버 수, 최대 멤버 수 정보를 포함합니다.
 */
const parties = ref<Array<Party>>([]);

/**
 * 디바운스된 검색어를 위한 ref
 */
const debouncedSearchQuery = ref('');

/**
 * API 응답 타입 정의
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
}


/**
 * API 호출 함수
 */
const fetchParties = async (searchKeyword: string = '') => {
  const queryParams: any = {searchConditions: 'ALL'};

  if (searchKeyword.trim()) {
    queryParams.searchKeyword = searchKeyword.trim();
  }

  console.log()

  const response = await kyWithCustom('get', 'v1/party', queryParams).json() as ApiResponse<Party[]>;
  parties.value = response.data;
};

/**
 * 검색어 디바운싱 로직
 */
let searchTimeout: number | null = null;
watch(() => props.searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    debouncedSearchQuery.value = newQuery;
    await fetchParties(newQuery);
  }, 300); // 300ms 디바운스
});

/**
 * 서버에서 이미 필터링된 데이터를 받으므로 그대로 반환
 */
const filteredParties = computed(() => {
  return parties.value;
});

/**
 * 총 페이지 수 계산
 * 필터링된 카드 수와 페이지당 카드 수를 기반으로 계산합니다.
 */
const totalPages = computed(() => {
  return Math.ceil(filteredParties.value.length / cardsPerPage);
});

/**
 * 현재 페이지에 표시할 카드 목록
 * 현재 페이지 번호에 따라 해당 페이지에 표시될 카드들만 추출합니다.
 */
const paginatedParties = computed(() => {
  const startIndex = (currentPage.value - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  return filteredParties.value.slice(startIndex, endIndex);
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

/**
 * 엔터 키 즉시 검색 처리
 */
watch(() => props.searchEnterTrigger, async (newTrigger) => {
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
});

onMounted(async () => {
  // 초기 검색어 설정 및 데이터 로드
  debouncedSearchQuery.value = props.searchQuery;
  await fetchParties(props.searchQuery);
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
      <div class="card-list">
        <PartyCard
          v-for="party in paginatedParties"
          :key="party.id"
          :id="party.id"
          :contents="party.article.contents"
          :currentMembers="party.currentMembers ?? 1"
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
    <div v-if="filteredParties.length === 0" class="no-results">검색 결과가 없습니다.</div>
  </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.card-list-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* 부모 컨테이너 높이에 맞춤 */
  padding: 20px 0; /* 자연스러운 여백 */
}

/* 카드 목록 래퍼 */
.card-list-wrapper {
  flex: 1; /* 남은 공간 모두 사용 */
  display: flex;
  align-items: center; /* 카드를 세로 중앙에 배치 */
}

/* 카드 목록 그리드 레이아웃 */
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열로 변경하여 카드 크기 증가 */
  gap: 1.5vw; /* 간격을 더 넓게 */
  width: 100%;
  max-width: 1200px; /* 최대 너비 제한으로 가독성 향상 */
  margin: 0 auto; /* 중앙 정렬 */
}

/* 카드 16:9 비율 적용 */
.card-list > * {
  aspect-ratio: 16 / 9; /* 16:9 비율 고정 */
  max-width: 100%;
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
    grid-template-columns: repeat(2, 1fr); /* 태블릿에서 2열 */
    gap: 3vw;
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .card-list {
    grid-template-columns: 1fr; /* 모바일에서 1열 */
    gap: 4vw;
    max-width: 400px;
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
  transition: background-color 0.2s,
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
  transition: background-color 0.2s,
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
