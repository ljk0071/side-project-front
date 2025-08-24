<script lang="ts" setup>
/**
 * MainPage 컴포넌트
 *
 * 애플리케이션의 메인 페이지를 구성하는 뷰 컴포넌트입니다.
 * 검색 기능, 필터링, 다크 모드 토글 등 주요 기능들을 포함하고 있습니다.
 */
import {computed, ref} from 'vue';
import PartyList from '@/components/PartyCardList.vue';

// 프롭스 정의
const props = defineProps<{
  /** 검색어 (App.vue에서 전달받음) */
  searchQuery?: string;
  /** 엔터 키 즉시 검색 트리거 */
  searchEnterTrigger?: number;
}>();

// 상태 관리를 위한 ref 변수들
/** 현재 검색어 */
const searchQuery = computed(() => props.searchQuery || '');
/** 선택된 필터 배열 (기본값: '전체') */
const selectedFilter = ref(['ALL']);
/** 첫 방문 시 정보 텍스트 표시 여부 */
const showInfoText = ref(false);

</script>

<template>
  <!-- 첫 방문 시 표시되는 힌트 텍스트 -->
  <div v-if="showInfoText" class="info-text fade-in">💡 타이핑을 하시면 바로 검색이 시작됩니다</div>


  <!-- 카드 목록 영역 - 검색어와 필터 전달 -->
  <PartyList :search-query="searchQuery" :selected-filter="selectedFilter" :search-enter-trigger="searchEnterTrigger"/>
</template>

<style scoped>
/* 정보 텍스트 스타일 (검색 힌트) */
.info-text {
  font-size: 13px;
  color: #3498db;
  opacity: 0;
  display: inline-block;
  margin-bottom: 20px;
  text-align: center;
}

/* 정보 텍스트 페이드인 애니메이션 */
@keyframes focusedFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
    text-shadow: 0 0 0 rgba(52, 152, 219, 0);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
    text-shadow: 0 0 10px rgba(52, 152, 219, 0.7);
  }
  75% {
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    text-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  }
}

.fade-in {
  animation: focusedFadeIn 1.5s ease-out forwards;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .info-text {
    display: none;
  }
}
</style>
