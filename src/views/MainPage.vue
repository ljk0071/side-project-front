<script lang="ts" setup>
/**
 * MainPage 컴포넌트
 *
 * 애플리케이션의 메인 페이지를 구성하는 뷰 컴포넌트입니다.
 * 검색 기능, 필터링, 다크 모드 토글 등 주요 기능들을 포함하고 있습니다.
 */
import { inject, onMounted, ref } from 'vue';
import { useDark, useEventListener, useToggle } from '@vueuse/core';
import CardList from '@/components/CardList.vue';
import SearchBar from '@/components/SearchBar.vue';
import FilterBar from '@/components/FilterBar.vue';
import { kyWithCustom } from '@/utils/ky/kyWithCustom.ts';
import { useKyProperties } from '@/stores/useKyProperties.ts';
import { useVisited } from '@/stores/useVisited.ts';

// 상태 관리를 위한 ref 변수들
/** 현재 검색어 */
const searchQuery = ref('');
/** 선택된 필터 배열 (기본값: '전체') */
const selectedFilter = ref(['전체']);
/** SearchBar 컴포넌트에 대한 참조 */
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);
/** 첫 방문 시 정보 텍스트 표시 여부 */
const showInfoText = ref(false);

/** 다크 모드 상태 (vueuse의 useDark 훅 사용) */
const isDark = useDark({ disableTransition: false });
/** 다크 모드 토글 함수 */
const toggleDark = useToggle(isDark);
/** 사용자 상호작용 여부 (애니메이션 효과에 사용) */
const hasInteracted = ref(false);

/**
 * 키보드 이벤트 처리 시 무시할 기능 키 목록
 * 이 키들은 검색창 포커스를 트리거하지 않습니다.
 */
const functionKeys = ['Tab', 'Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * 다크 모드 토글 처리 함수
 * 다크 모드를 전환하고 사용자 상호작용 상태를 기록합니다.
 */
const handleToggleDark = () => {
  toggleDark();
  hasInteracted.value = true;
};

const kyProperties = useKyProperties();
const visited = useVisited();

// 첫 방문 여부 확인
if (!visited.isVisited) {
  showInfoText.value = true;
  visited.isVisited = true;
}

/**
 * 컴포넌트 마운트 시 초기화 및 이벤트 리스너 설정
 */
onMounted(async () => {
  // const info = { userId: 'system', password: 'gmlwls@9833' };
  //
  // const result = await kyWithCustom('post', 'api/sign/in', info).json<{
  //   csrfToken: string;
  //   refreshToken: string;
  // }>();
  //
  // kyProperties.csrfToken = result.csrfToken;
  // kyProperties.refreshToken = result.refreshToken;

  const res4 = await kyWithCustom('get', 'v1/notice/test', {}).json();

  console.log(res4);

  // 키보드 이벤트 리스너 설정 - 타이핑 시 자동으로 검색창 포커스
  useEventListener(document, 'keydown', (e) => {
    // 입력 필드나 텍스트 영역이 이미 포커스된 경우 무시
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // 특수 키 조합 및 기능 키 무시
    if (e.ctrlKey || e.altKey || e.metaKey || functionKeys.includes(e.key)) {
      return;
    }

    // 검색창에 포커스 설정
    searchBarRef.value?.focus();
  });
});
</script>

<template>
  <!-- 헤더 영역 -->
  <header class="header">
    <!-- 로고 및 사이트 타이틀 -->
    <h1>
      <router-link to="/" class="logo"> 메이플 파티</router-link>
    </h1>
    <!-- 첫 방문 시 표시되는 힌트 텍스트 -->
    <span v-if="showInfoText" class="info-text fade-in"
      >💡 타이핑을 하시면 바로 검색이 시작됩니다</span
    >
    <!-- 헤더 우측 영역 (검색창) -->
    <div class="header-right">
      <SearchBar ref="searchBarRef" v-model="searchQuery" />
    </div>
  </header>

  <a href="https://naver.com"> asdasdasd </a>

  <!-- 메인 콘텐츠 영역 -->
  <main class="main">
    <!-- 필터링 및 다크모드 토글 헤더 -->
    <div class="main-header">
      <!-- 필터 컴포넌트 영역 -->
      <div class="filter-container">
        <FilterBar v-model="selectedFilter" />
      </div>

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
    <CardList :search-query="searchQuery" :selected-filter="selectedFilter" />
  </main>
</template>

<style scoped>
/* 헤더 스타일 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 25px;
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--border-color);
  height: 80px;
  max-width: 1440px;
  margin: 0 auto;
  color: var(--text-color);
  transition: background-color 0.5s ease; /* 테마 전환 시 부드러운 효과 */
  overflow: hidden; /* 헤더 내용이 넘치지 않도록 설정 */
}

/* 헤더 우측 영역 스타일 */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 20px; /* 로고와의 간격 추가 */
}

/* 로고 스타일 */
.logo {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: var(--logo-color, orange);
  margin: 0;
  /* 확실하게 가로 방향으로 텍스트가 표시되도록 설정 */
  writing-mode: horizontal-tb !important;
  text-orientation: mixed;
  direction: ltr;
  /* 모바일 브라우저 특성을 고려한 추가 설정 */
  display: inline-block;
  white-space: nowrap;
  /* iOS Safari에서 세로 텍스트 방지 */
  -webkit-writing-mode: horizontal-tb !important;
  flex-shrink: 0; /* 로고 크기가 줄어들지 않도록 함 */
  text-decoration: none;
}

/* 정보 텍스트 스타일 (검색 힌트) */
.info-text {
  font-size: 13px; /* 더 작은 폰트 사이즈 */
  color: #3498db; /* 정보를 나타내는 파란색으로 변경 */
  opacity: 0; /* 초기 상태는 투명 */
  display: inline-block; /* 애니메이션을 위해 필요 */
}

/* 모바일 화면에서는 정보 텍스트 숨김 */
@media (max-width: 768px) {
  .info-text {
    display: none;
  }
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

/* 다크모드 토글 컨테이너 스타일 */
.toggle-container {
  cursor: pointer;
  display: flex;
  align-items: center;
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

/* 다크모드 토글 트랙 스타일 */
.toggle-track.dark {
  background-color: #2c3e50;
  background-image: linear-gradient(to right, #2c3e50, #4a5f72);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 토글 애니메이션 */
.toggle-track.dark.animated {
  animation: toDarkTrack 0.5s ease forwards;
}

.toggle-track:not(.dark).animated {
  animation: toLightTrack 0.5s ease forwards;
}

/* 토글 인디케이터 슬라이드 애니메이션 */
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

/* 토글 인디케이터 (슬라이딩 원) 스타일 */
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
  will-change: transform; /* 애니메이션 성능 개선 */
  transform: translateX(0);
  overflow: hidden; /* 내부 아이콘이 넘치지 않도록 */
}

/* 토글 호버 효과 */
.toggle-container:hover .toggle-indicator {
  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 토글 클릭 효과 */
.toggle-container:active .toggle-indicator {
  transform: scale(0.9);
}

.toggle-container:active .toggle-indicator.dark {
  transform: translateX(30px) scale(0.9);
}

/* 다크모드 인디케이터 위치 */
.toggle-indicator.dark {
  transform: translateX(30px);
}

/* 토글 애니메이션 적용 */
.toggle-indicator.dark.animated {
  animation: slideToRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.toggle-indicator:not(.dark).animated {
  animation: slideToLeft 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
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

/* 메인 헤더 영역 (필터 및 토글) */
.main-header {
  display: flex;
  flex-direction: row; /* 가로 방향으로 변경 */
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

/* 필터 컨테이너 스타일 */
.filter-container {
  flex-grow: 1;
  flex-basis: 80%;
}

/* 토글 컨테이너 스타일 (메인 헤더 내) */
.toggle-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 15px; /* 필터와의 간격 */
}

/* 메인 콘텐츠 영역 스타일 */
.main {
  padding: 40px 25px;
  max-width: 1440px;
  margin: 0 auto;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.5s ease; /* 테마 전환 시 부드러운 효과 */
}

/* 모바일 반응형 스타일링 */
@media (max-width: 768px) {
  .header {
    padding: 10px 20px;
    height: 70px;
  }

  .header-right {
    margin-left: 15px;
  }

  .logo {
    font-size: 22px;
  }

  .main {
    padding: 30px 20px;
  }

  .main-header {
    flex-direction: row; /* 모바일에서도 가로 방향 유지 */
    justify-content: space-between; /* 양쪽 끝으로 정렬 */
    align-items: center;
    gap: 10px;
    flex-wrap: wrap; /* 필요시 줄바꿈 허용 */
  }

  .filter-container {
    flex: 1; /* 가용 공간 최대한 활용 */
    min-width: 65%; /* 최소 너비 설정 */
    max-width: 80%; /* 최대 너비 제한 */
    margin: 0; /* 마진 초기화 */
  }

  .toggle-container {
    margin: 0; /* 마진 초기화 */
    order: 0; /* 순서 원래대로 */
  }
}

/* 작은 모바일 디바이스 */
@media (max-width: 576px) {
  .header {
    padding: 8px 15px;
    height: 60px;
  }

  .header-right {
    margin-left: 10px;
  }

  .logo {
    font-size: 20px;
  }

  .main {
    padding: 20px 15px;
  }

  .main-header {
    justify-content: space-between; /* 양쪽 정렬 유지 */
    align-items: center;
    gap: 8px; /* 간격 더 줄임 */
  }

  .filter-container {
    flex: 1; /* 가용 공간 사용 */
    min-width: 60%; /* 최소 너비 줄임 */
  }

  /* 작은 화면용 토글 사이즈 조정 */
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

  .toggle-container:active .toggle-indicator.dark {
    transform: translateX(24px) scale(0.9);
  }

  /* 작은 화면용 애니메이션 조정 */
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

/* 초소형 화면 */
@media (max-width: 375px) {
  .header {
    padding: 5px 10px;
    height: 55px;
  }

  .logo {
    font-size: 18px;
  }
}
</style>
