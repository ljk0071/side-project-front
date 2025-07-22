<script lang="ts" setup>
/**
 * MainPage 컴포넌트
 *
 * 애플리케이션의 메인 페이지를 구성하는 뷰 컴포넌트입니다.
 * 검색 기능, 필터링, 다크 모드 토글 등 주요 기능들을 포함하고 있습니다.
 */
import {computed, ref} from 'vue';
import {useDark, useToggle} from '@vueuse/core';
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

/** 다크 모드 상태 (vueuse의 useDark 훅 사용) */
const isDark = useDark({disableTransition: true});
/** 다크 모드 토글 함수 */
const toggleDark = useToggle(isDark);
/** 사용자 상호작용 여부 (애니메이션 효과에 사용) */
const hasInteracted = ref(false);

/**
 * 다크 모드 토글 처리 함수
 * 다크 모드를 전환하고 사용자 상호작용 상태를 기록합니다.
 */
const handleToggleDark = () => {
  toggleDark();
  hasInteracted.value = true;
};
</script>

<template>
  <!-- 첫 방문 시 표시되는 힌트 텍스트 -->
  <div v-if="showInfoText" class="info-text fade-in">💡 타이핑을 하시면 바로 검색이 시작됩니다</div>

  <!-- 필터링 및 다크모드 토글 헤더 -->
  <div class="main-header">
    <!-- 필터 컴포넌트 영역 -->
    <!--    <div class="filter-container">
          <FilterBar v-model="selectedFilter" />
        </div>-->

    <!-- 다크 모드 토글 스위치 -->
    <div
      class="toggle-container"
      @click="handleToggleDark()"
      @touchend.prevent="handleToggleDark()"
    >
      <div :class="{ dark: isDark, animated: hasInteracted }" class="toggle-track">
        <div :class="{ dark: isDark, animated: hasInteracted }" class="toggle-indicator">
          <span v-if="!isDark" :class="{ animated: hasInteracted }" class="toggle-icon sun"
          >☀️</span
          >
          <span v-else :class="{ animated: hasInteracted }" class="toggle-icon moon">🌙</span>
        </div>
      </div>
    </div>
  </div>

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

/* 메인 헤더 영역 (필터 및 토글) */
.main-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

/* 다크모드 토글 컨테이너 스타일 */
.toggle-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 15px;
}

/* 다크모드 트랙 전환 애니메이션 */
@keyframes toDarkTrack {
  0% {
    background-color: #e0e0e0;
    background-image: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  100% {
    background-color: #2c3e50;
    background-image: linear-gradient(to right, #2c3e50, #4a5f72);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

@keyframes toLightTrack {
  0% {
    background-color: #2c3e50;
    background-image: linear-gradient(to right, #2c3e50, #4a5f72);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  100% {
    background-color: #e0e0e0;
    background-image: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

/* 토글 트랙 (배경) 스타일 */
.toggle-track {
  width: 60px;
  height: 30px;
  background-color: #e0e0e0;
  border-radius: 15px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-track.dark {
  background-color: #2c3e50;
  background-image: linear-gradient(to right, #2c3e50, #4a5f72);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-track.dark.animated {
  animation: toDarkTrack 0.5s ease forwards;
}

.toggle-track:not(.dark).animated {
  animation: toLightTrack 0.5s ease forwards;
}

/* 토글 인디케이터 스타일 */
.toggle-indicator {
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  will-change: transform;
  transform: translateX(0);
  overflow: hidden;
}

.toggle-indicator.dark {
  transform: translateX(30px);
}

.toggle-indicator.dark.animated {
  animation: slideToRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.toggle-indicator:not(.dark).animated {
  animation: slideToLeft 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes slideToRight {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(30px);
  }
}

@keyframes slideToLeft {
  0% {
    transform: translateX(30px);
  }
  100% {
    transform: translateX(0);
  }
}

/* 토글 아이콘 스타일 */
.toggle-icon {
  font-size: 14px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .info-text {
    display: none;
  }

  .main-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .toggle-container {
    margin: 0;
    order: 0;
  }
}

@media (max-width: 576px) {
  .main-header {
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .toggle-track {
    width: 50px;
    height: 26px;
  }

  .toggle-indicator {
    width: 20px;
    height: 20px;
  }

  .toggle-indicator.dark {
    transform: translateX(24px);
  }

  @keyframes slideToRight {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(24px);
    }
  }

  @keyframes slideToLeft {
    0% {
      transform: translateX(24px);
    }
    100% {
      transform: translateX(0);
    }
  }
}
</style>
