<script lang="ts" setup>
/**
 * CardList 컴포넌트
 *
 * 이 컴포넌트는 파티/이벤트 카드 목록을 표시하고 페이지네이션을 관리합니다.
 * 검색어와 선택된 필터에 따라 카드를 필터링하고, 페이지당 일정 수의 카드를 표시합니다.
 */
import { computed, ref, watch } from 'vue';
import PartyCard from './PartyCard.vue';
import { koreanSearch } from '@/utils/koreanSearch';

// 컴포넌트 프롭스 정의
const props = defineProps<{
  /** 검색어 */
  searchQuery: string;
  /** 선택된 필터 배열 */
  selectedFilter: string[];
}>();

/** 현재 페이지 번호 */
const currentPage = ref(1);
/** 페이지당 카드 수 */
const cardsPerPage = 8;

/**
 * 카드 데이터 배열
 * 각 카드는 제목, 설명, 태그, 이미지 색상 정보를 포함합니다.
 */
const cards = [
  {
    id: 1,
    title: '프로젝트 타이틀',
    description:
      '이것은 프로젝트에 대한 간략한 설명입니다. 이 카드에는 프로젝트의 주요 정보가 포함되어 있습니다.',
    tags: ['디자인', '개발'],
    imageColor: 'rgba(51, 102, 204, 0.2)',
  },
  {
    id: 2,
    title: '분석 대시보드',
    description:
      '데이터 시각화와 분석을 위한 대시보드입니다. 다양한 차트와 그래프를 통해 데이터를 효과적으로 표현합니다.',
    tags: ['데이터', '분석'],
    imageColor: 'rgba(153, 77, 178, 0.2)',
  },
  {
    id: 3,
    title: '모바일 앱',
    description:
      '사용자 친화적인 모바일 애플리케이션입니다. 직관적인 인터페이스와 빠른 반응 속도가 특징입니다.',
    tags: ['모바일', 'UX'],
    imageColor: 'rgba(51, 178, 128, 0.2)',
  },
  {
    id: 4,
    title: '마케팅 캠페인',
    description:
      '효과적인 마케팅 전략을 위한 캠페인 기획입니다. 타겟 고객층과 시장 분석 데이터를 활용합니다.',
    tags: ['마케팅', '전략'],
    imageColor: 'rgba(229, 128, 51, 0.2)',
  },
  {
    id: 5,
    title: 'UI 디자인 시스템',
    description:
      '일관된 사용자 경험을 제공하기 위한 디자인 시스템입니다. 재사용 가능한 컴포넌트와 스타일 가이드를 포함합니다.',
    tags: ['UI', '컴포넌트'],
    imageColor: 'rgba(51, 102, 204, 0.2)',
  },
  {
    id: 6,
    title: '교육 컨텐츠',
    description:
      '온라인 학습을 위한 교육 컨텐츠입니다. 접근성이 높고 상호작용 가능한 학습 경험을 제공합니다.',
    tags: ['교육', '온라인'],
    imageColor: 'rgba(51, 178, 128, 0.2)',
  },
  {
    id: 7,
    title: '소셜 네트워크',
    description:
      '사용자 간 소통과 정보 공유를 위한 소셜 네트워크 플랫폼입니다. 다양한 커뮤니티 기능을 제공합니다.',
    tags: ['소셜', '커뮤니티'],
    imageColor: 'rgba(77, 153, 178, 0.2)',
  },
  {
    id: 8,
    title: '게임 개발',
    description:
      '인터랙티브한 게임 개발 프로젝트입니다. 다양한 게임 메커니즘과 그래픽 요소를 포함합니다.',
    tags: ['게임', '개발'],
    imageColor: 'rgba(178, 102, 51, 0.2)',
  },
  {
    id: 9,
    title: '클라우드 서비스',
    description:
      '확장 가능한 클라우드 기반 서비스입니다. 안정적인 인프라와 보안 기능을 제공합니다.',
    tags: ['클라우드', '서비스'],
    imageColor: 'rgba(102, 153, 51, 0.2)',
  },
  {
    id: 10,
    title: 'AI 솔루션',
    description:
      '인공지능 기반 비즈니스 솔루션입니다. 데이터 분석과 예측 모델을 활용한 의사결정 지원 시스템입니다.',
    tags: ['AI', '데이터'],
    imageColor: 'rgba(178, 51, 102, 0.2)',
  },
];

/**
 * 검색어와 필터에 따라 필터링된 카드 목록
 * 한국어 초성 검색 및 태그 기반 필터링을 지원합니다.
 */
const filteredCards = computed(() => {
  return cards.filter((card) => {
    // 검색어 매칭 - 제목, 설명, 태그에서 검색
    const matchesSearch =
      koreanSearch(card.title, props.searchQuery) ||
      koreanSearch(card.description, props.searchQuery) ||
      card.tags.some((tag) => koreanSearch(tag, props.searchQuery));

    // 필터 매칭 - '전체'가 선택되었거나, 카드의 태그 중 하나라도 선택된 필터에 포함됨
    const matchesFilter =
      props.selectedFilter.includes('전체') ||
      card.tags.some((tag) => props.selectedFilter.includes(tag));

    // 검색어와 필터 모두 만족해야 함
    return matchesSearch && matchesFilter;
  });
});

/**
 * 총 페이지 수 계산
 * 필터링된 카드 수와 페이지당 카드 수를 기반으로 계산합니다.
 */
const totalPages = computed(() => {
  return Math.ceil(filteredCards.value.length / cardsPerPage);
});

/**
 * 현재 페이지에 표시할 카드 목록
 * 현재 페이지 번호에 따라 해당 페이지에 표시될 카드들만 추출합니다.
 */
const paginatedCards = computed(() => {
  const startIndex = (currentPage.value - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  return filteredCards.value.slice(startIndex, endIndex);
});

/**
 * 페이지네이션 초기화 함수
 * 검색어나 필터가 변경되었을 때 첫 페이지로 리셋합니다.
 */
const resetPagination = () => {
  currentPage.value = 1;
};

// 검색어나 필터 변경 시 페이지네이션 초기화
watch([() => props.searchQuery, () => props.selectedFilter], resetPagination);
</script>

<template>
  <div>
    <!-- 카드 목록 -->
    <div class="card-list">
      <PartyCard
        v-for="card in paginatedCards"
        :key="card.id"
        :description="card.description"
        :image-color="card.imageColor"
        :tags="card.tags"
        :title="card.title"
      />
    </div>

    <!-- 페이지네이션 컨트롤 -->
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

    <!-- 검색 결과가 없을 때 메시지 -->
    <div v-if="filteredCards.length === 0" class="no-results">검색 결과가 없습니다.</div>
  </div>
</template>

<style scoped>
/* 카드 목록 그리드 레이아웃 */
.card-list {
  display: flex;
  flex-wrap: wrap; /* 여러 줄에 걸쳐 표시 */
  gap: 24px; /* 카드 간 간격 */
  padding: 20px 0;
  justify-content: center; /* 중앙 정렬 */
  min-height: 200px; /* 카드가 적을 때도 일관된 높이 유지 */
}

/* 페이지네이션 컨테이너 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  gap: 15px;
  /* 카드가 2열로 표시될 때와 동일한 위치에 고정 */
  position: relative;
  width: 100%;
  max-width: 768px; /* 2열 카드의 너비 */
  margin-left: auto;
  margin-right: auto;
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
