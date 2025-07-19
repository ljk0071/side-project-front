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
const cardsPerPage = 16;

/**
 * 카드 데이터 배열
 * 각 카드는 제목, 설명, 태그, 이미지 색상, 현재 멤버 수, 최대 멤버 수 정보를 포함합니다.
 */
const cards = [
  {
    id: 1,
    title: '시길',
    description:
      '👻 시길4/ 시간의길4👻\n' +
      '  도어O, 렙직업 DM\n' +
      ' 4️⃣ ,5️⃣ 층 : 구인중💚\n' +
      ' 3️⃣ 층 :  구인완!\n' +
      ' 2️⃣ 층 :  구인중💚\n' +
      ' 1️⃣ 층 : 85 자투 프리',
    tags: ['디자인', '개발'],
    imageColor: 'rgba(51, 102, 204, 0.2)',
    currentMembers: 3,
    maxMembers: 6,
  },
  {
    id: 2,
    title: '시길',
    description:
      '⏰ 시간의길1 / 시길1 / 심쩔 /  노예민  ⏰\n' +
      '5️⃣층 :  🟢  39클레 (40)\n' +
      '4️⃣층 :  🟢  40클레 [40]\n' +
      '3️⃣층 :  🟢  42클레[40]\n' +
      '2️⃣층 :  ⭐ 81 풀이속자투프리\n' +
      '1️⃣층 :  🟢  구인중[30]\n' +
      '노예민만 / 편하게 사냥하실분 / 답없구',
    tags: ['데이터', '분석'],
    imageColor: 'rgba(153, 77, 178, 0.2)',
    currentMembers: 4,
    maxMembers: 6,
  },
  {
    id: 3,
    title: '대만 사잇길',
    description:
      '📌대만 사잇길 사이길📌88프리📌완숙만\n' +
      '📌좌 1 (50) : 🔴 77 허밋\n' +
      '📌우 1 (30) : 🔴 77 창맨\n' +
      '📌우 2 (30) : 🟢 구인중\n' +
      '📌우 3 (50) : 🔴 75 레인저\n' +
      '📌버블꾼(어쌔만): 🔴 구인완',
    tags: ['모바일', 'UX'],
    imageColor: 'rgba(51, 178, 128, 0.2)',
    currentMembers: 5,
    maxMembers: 6,
  },
  {
    id: 4,
    title: '도전의 탑',
    description:
      '⚡ 도전의 탑 / 도탑 / 노예민 ⚡\n' +
      '🟢 87층 : 구인중 (88프리)\n' +
      '🟢 85층 : 구인중 (86프리)\n' +
      '🟢 83층 : 구인중 (84프리)\n' +
      '🟢 81층 : 구인중 (82프리)\n' +
      '노예민만 / 편하게 도탑하실분',
    tags: ['마케팅', '전략'],
    imageColor: 'rgba(229, 128, 51, 0.2)',
    currentMembers: 2,
    maxMembers: 4,
  },
  {
    id: 5,
    title: '세르니움 퀘스트라인',
    description:
      '🌟 세르니움 퀘스트라인 / 세르니움 🌟\n' +
      '📝 1차 : 🔴 77 비숍\n' +
      '📝 2차 : 🟢 구인중\n' +
      '📝 3차 : 🔴 75 나이트로드\n' +
      '📝 4차 : 🟢 구인중\n' +
      '퀘스트 도움 필요한 분들 환영',
    tags: ['UI', '컴포넌트'],
    imageColor: 'rgba(51, 102, 204, 0.2)',
    currentMembers: 3,
    maxMembers: 4,
  },
  {
    id: 6,
    title: '아케인포스',
    description:
      '🔮 아케인포스 / 아케인 / 매일 🔮\n' +
      '⏰ 저녁 8시 집결\n' +
      '🟢 VJ : 구인중\n' +
      '🟢 츄츄 : 구인중\n' +
      '🟢 레헬른 : 구인중\n' +
      '🟢 아르카나 : 구인중\n' +
      '매일 8시 아케인포스 함께하실분',
    tags: ['교육', '온라인'],
    imageColor: 'rgba(51, 178, 128, 0.2)',
    currentMembers: 6,
    maxMembers: 8,
  },
  {
    id: 7,
    title: '무릉도장',
    description:
      '🥋 무릉도장 / 무릉 / 주간 🥋\n' +
      '🟢 30층 : 구인중\n' +
      '🟢 35층 : 구인중\n' +
      '🟢 40층 : 구인중\n' +
      '🟢 45층 : 구인중\n' +
      '주간 무릉도장 함께 올라가실분',
    tags: ['소셜', '커뮤니티'],
    imageColor: 'rgba(77, 153, 178, 0.2)',
    currentMembers: 1,
    maxMembers: 1,
  },
  {
    id: 8,
    title: '자쿠움 원정대',
    description:
      '🔥 자쿠움 원정대 / 자쿠움 / 매일 🔥\n' +
      '⏰ 저녁 9시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 9시 자쿠움 원정대 참여하실분',
    tags: ['게임', '개발'],
    imageColor: 'rgba(178, 102, 51, 0.2)',
    currentMembers: 4,
    maxMembers: 6,
  },
  {
    id: 9,
    title: '혼테일 원정대',
    description:
      '🐉 혼테일 원정대 / 혼테일 / 매일 🐉\n' +
      '⏰ 저녁 10시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 10시 혼테일 원정대 참여하실분',
    tags: ['클라우드', '서비스'],
    imageColor: 'rgba(102, 153, 51, 0.2)',
    currentMembers: 5,
    maxMembers: 6,
  },
  {
    id: 10,
    title: '핑크빈 원정대',
    description:
      '💗 핑크빈 원정대 / 핑크빈 / 주간 💗\n' +
      '⏰ 토요일 저녁 8시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '주간 핑크빈 원정대 참여하실분',
    tags: ['AI', '데이터'],
    imageColor: 'rgba(178, 51, 102, 0.2)',
    currentMembers: 3,
    maxMembers: 6,
  },
  {
    id: 11,
    title: '블러디 퀸',
    description:
      '👑 블러디 퀸 / 블퀸 / 매일 👑\n' +
      '⏰ 저녁 11시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 11시 블러디 퀸 참여하실분',
    tags: ['웹', '개발'],
    imageColor: 'rgba(51, 102, 204, 0.2)',
    currentMembers: 2,
    maxMembers: 6,
  },
  {
    id: 12,
    title: '반 레온',
    description:
      '🦁 반 레온 / 반레온 / 매일 🦁\n' +
      '⏰ 밤 12시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 12시 반 레온 참여하실분',
    tags: ['데이터', '분석'],
    imageColor: 'rgba(153, 77, 178, 0.2)',
    currentMembers: 4,
    maxMembers: 6,
  },
  {
    id: 13,
    title: '리부트 월드',
    description:
      '🔄 리부트 월드 / 리부트 / 매일 🔄\n' +
      '⏰ 저녁 7시 집결\n' +
      '🟢 파티원 : 구인중\n' +
      '🟢 길드원 : 구인중\n' +
      '🟢 동반자 : 구인중\n' +
      '리부트 월드에서 함께 성장하실분',
    tags: ['모바일', 'UX'],
    imageColor: 'rgba(51, 178, 128, 0.2)',
    currentMembers: 8,
    maxMembers: 10,
  },
  {
    id: 14,
    title: '베라 월드',
    description:
      '🌍 베라 월드 / 베라 / 매일 🌍\n' +
      '⏰ 저녁 8시 집결\n' +
      '🟢 파티원 : 구인중\n' +
      '🟢 길드원 : 구인중\n' +
      '🟢 동반자 : 구인중\n' +
      '베라 월드에서 함께 성장하실분',
    tags: ['마케팅', '브랜드'],
    imageColor: 'rgba(229, 128, 51, 0.2)',
    currentMembers: 7,
    maxMembers: 10,
  },
  {
    id: 15,
    title: '크로아 월드',
    description:
      '🏰 크로아 월드 / 크로아 / 매일 🏰\n' +
      '⏰ 저녁 9시 집결\n' +
      '🟢 파티원 : 구인중\n' +
      '🟢 길드원 : 구인중\n' +
      '🟢 동반자 : 구인중\n' +
      '크로아 월드에서 함께 성장하실분',
    tags: ['UI', '컴포넌트'],
    imageColor: 'rgba(51, 102, 204, 0.2)',
    currentMembers: 6,
    maxMembers: 10,
  },
  {
    id: 16,
    title: '스카니아 월드',
    description:
      '🌟 스카니아 월드 / 스카니아 / 매일 🌟\n' +
      '⏰ 저녁 10시 집결\n' +
      '🟢 파티원 : 구인중\n' +
      '🟢 길드원 : 구인중\n' +
      '🟢 동반자 : 구인중\n' +
      '스카니아 월드에서 함께 성장하실분',
    tags: ['교육', '온라인'],
    imageColor: 'rgba(51, 178, 128, 0.2)',
    currentMembers: 9,
    maxMembers: 10,
  },
  {
    id: 17,
    title: '엘나스 월드',
    description:
      '❄️ 엘나스 월드 / 엘나스 / 매일 ❄️\n' +
      '⏰ 저녁 11시 집결\n' +
      '🟢 파티원 : 구인중\n' +
      '🟢 길드원 : 구인중\n' +
      '🟢 동반자 : 구인중\n' +
      '엘나스 월드에서 함께 성장하실분',
    tags: ['소셜', '커뮤니티'],
    imageColor: 'rgba(77, 153, 178, 0.2)',
    currentMembers: 5,
    maxMembers: 10,
  },
  {
    id: 18,
    title: '시그너스 원정대',
    description:
      '🦅 시그너스 원정대 / 시그너스 / 매일 🦅\n' +
      '⏰ 밤 1시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 1시 시그너스 원정대 참여하실분',
    tags: ['게임', '개발'],
    imageColor: 'rgba(178, 102, 51, 0.2)',
    currentMembers: 3,
    maxMembers: 6,
  },
  {
    id: 19,
    title: '스우 원정대',
    description:
      '🐉 스우 원정대 / 스우 / 매일 🐉\n' +
      '⏰ 새벽 2시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 2시 스우 원정대 참여하실분',
    tags: ['클라우드', '서비스'],
    imageColor: 'rgba(102, 153, 51, 0.2)',
    currentMembers: 4,
    maxMembers: 6,
  },
  {
    id: 20,
    title: '데미안 원정대',
    description:
      '😈 데미안 원정대 / 데미안 / 매일 😈\n' +
      '⏰ 새벽 3시 집결\n' +
      '🟢 딜러 : 구인중\n' +
      '🟢 힐러 : 구인중\n' +
      '🟢 서포터 : 구인중\n' +
      '매일 3시 데미안 원정대 참여하실분',
    tags: ['AI', '데이터'],
    imageColor: 'rgba(178, 51, 102, 0.2)',
    currentMembers: 5,
    maxMembers: 6,
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
  <div class="card-list-container">
    <!-- 카드 목록 영역 -->
    <div class="card-list-wrapper">
      <div class="card-list">
        <PartyCard
          v-for="card in paginatedCards"
          :key="card.id"
          :current-members="card.currentMembers"
          :description="card.description"
          :image-color="card.imageColor"
          :max-members="card.maxMembers"
          :tags="card.tags"
          :title="card.title"
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
    <div v-if="filteredCards.length === 0" class="no-results">검색 결과가 없습니다.</div>
  </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.card-list-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 170px); /* 헤더, 푸터, 여백 제외 */
  width: 100%;
}

/* 카드 목록 래퍼 */
.card-list-wrapper {
  flex: 1;
  overflow: hidden; /* 카드가 넘치지 않도록 */
  margin-bottom: 20px; /* 페이지네이션과 간격 */
}

/* 카드 목록 그리드 레이아웃 */
.card-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4열 고정 */
  grid-template-rows: repeat(4, 0.6fr); /* 4행 고정 - 높이를 60%로 줄임 */
  gap: 0.5vw; /* 카드 간 간격 */
  height: 100%; /* 래퍼 높이에 맞춤 */
  width: 100%;
}

/* 페이지네이션 래퍼 */
.pagination-wrapper {
  flex-shrink: 0; /* 크기 고정 */
  height: 60px; /* 페이지네이션 고정 높이 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 반응형 디자인 */
@media (max-width: 1920px) {
  .card-list {
    gap: 0.4vw;
  }

  .card-list-container {
    height: calc(100vh - 150px);
  }
}

@media (max-width: 1440px) {
  .card-list {
    gap: 0.3vw;
  }

  .card-list-container {
    height: calc(100vh - 140px);
  }
}

@media (max-width: 1024px) {
  .card-list {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(6, 0.6fr);
    gap: 0.5vw;
  }

  .card-list-container {
    height: calc(100vh - 130px);
  }
}

@media (max-width: 768px) {
  .card-list {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(8, 0.6fr);
    gap: 0.8vw;
  }

  .card-list-container {
    height: calc(100vh - 110px);
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
