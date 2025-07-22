<script lang="ts" setup>
import {openDiscordLogin} from '@/utils/discordAuth.ts';
import {usePopUpClosed} from '@/stores/usePopUpClosed.ts';
import SearchBar from '@/components/SearchBar.vue';
import ChatSidebar from '@/components/ChatSidebar.vue';
import ApplicationHistory from '@/components/ApplicationHistory.vue';
import RecruitmentModal from '@/components/RecruitmentModal.vue';
import ResumeModal from '@/components/ResumeModal.vue';
import CustomModal from '@/components/CustomModal.vue';
import {inject, ref} from 'vue';
import {customError, useCustomModal} from '@/composables/useCustomModal.ts';
import type {VueCookies} from 'vue-cookies';
import {useRoute} from 'vue-router';
import {useKyProperties} from '@/stores/useKyProperties.ts';
import {useAuth} from '@/stores/useAuth.ts';
import {useNotFound} from '@/stores/useNotFound.ts';

const popUpClosed = usePopUpClosed();
const showRecruitmentModal = ref(false);
const showResumeModal = ref(false);
const searchQuery = ref('');
const searchEnterTrigger = ref(0);
const route = useRoute();
const kyProperties = useKyProperties();
const auth = useAuth();

// CustomModal 컴포저블 사용
const {modalState, handleConfirm, handleCancel, handleClose} = useCustomModal();
const $cookies = inject<VueCookies>('$cookies');
if (!$cookies) {
  throw new Error("Failed to inject $cookies. Make sure it is provided in app's context.");
}

window.addEventListener('storage', (e) => {
  if (e.key === 'popUpClosed' && route.path !== '/pop-up/close') {
    const newValue = e.newValue ? JSON.parse(e.newValue) : {};
    if (!newValue.init) {
      newValue.isPopUp = false;
      if (newValue.isSucceed) {
        newValue.isSucceed = false;
        kyProperties.csrfToken = $cookies.get('X-CSRF-TOKEN');
        $cookies.set('X-CSRF-TOKEN', null);
        kyProperties.refreshToken = $cookies.get('REFRESH-TOKEN');
        $cookies.set('REFRESH-TOKEN', null);
      } else {
        if (newValue.errorMessage) {
          customError(newValue.errorMessage);
          newValue.errorMessage = null;
        }
      }
    }
    popUpClosed.$patch(newValue);
  }
});

window.addEventListener('message', (e) => {
  if (e.origin === 'http://localhost') {
    auth.updateUserInfo(JSON.parse(e.data));
    auth.isLoggedIn = true;
  }
});

/**
 * 모집글 모달 닫기
 */
const closeRecruitmentModal = () => {
  showRecruitmentModal.value = false;
};

/**
 * 지원서 모달 닫기
 */
const closeResumeModal = () => {
  showResumeModal.value = false;
};

const notFound = useNotFound();

/**
 * SearchBar에서 엔터 키가 눌렸을 때 즉시 검색을 실행하는 핸들러
 */
const handleSearchEnter = () => {
  // 트리거 값을 증가시켜 즉시 검색 실행을 알림
  searchEnterTrigger.value++;
};
</script>

<template>
  <div class="app">
    <!-- 헤더 -->
    <header v-if="!popUpClosed.isPopUp && !notFound.is404" class="app-header">
      <div class="header-content">
        <h1>
          <router-link class="logo" to="/">메이플 파티</router-link>
        </h1>
        <div class="header-center">
          <button
            class="recruitment-button"
            @click="() => (showRecruitmentModal = !showRecruitmentModal)"
          >
            모집글 작성
          </button>
          <button class="resume-button" @click="() => (showResumeModal = !showResumeModal)">
            지원서 작성
          </button>
        </div>
        <div class="header-right">
          <button v-show="!auth.isLoggedIn" class="discord-login-button" @click="openDiscordLogin">
            <span class="discord-icon"></span>
            디스코드로 로그인
          </button>
          <span v-show="auth.isLoggedIn" class="user-greeting">
            {{ auth.userInfo.name }}님 안녕하세요.
          </span>
          <button v-show="auth.isLoggedIn" class="logout-button" @click="auth.logout">
            로그아웃
          </button>
          <SearchBar v-model="searchQuery" @enter="handleSearchEnter"/>
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 영역 -->
    <div class="main-layout">
      <!-- 왼쪽 사이드바 -->
      <aside v-if="!popUpClosed.isPopUp && !notFound.is404" class="left-sidebar">
        <ChatSidebar/>
      </aside>

      <!-- 중앙 컨텐츠 영역 -->
      <main class="main-content">
        <RouterView :search-query="searchQuery" :search-enter-trigger="searchEnterTrigger"/>
      </main>

      <!-- 오른쪽 사이드바 -->
      <aside v-if="!popUpClosed.isPopUp && !notFound.is404" class="right-sidebar">
        <ApplicationHistory/>
      </aside>
    </div>

    <!-- 푸터 -->
    <footer v-if="!popUpClosed.isPopUp" class="app-footer">
      <p>&copy; 2024 메이플 파티. All rights reserved.</p>
    </footer>

    <RecruitmentModal :show="showRecruitmentModal" @close="closeRecruitmentModal"/>
    <ResumeModal :show="showResumeModal" @close="closeResumeModal"/>

    <!-- CustomModal -->
    <CustomModal
      :cancel-text="modalState.cancelText"
      :confirm-text="modalState.confirmText"
      :icon-type="modalState.iconType"
      :message="modalState.message"
      :show="modalState.show"
      :title="modalState.title"
      :type="modalState.type"
      @cancel="handleCancel"
      @close="handleClose"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style>
/**
 * 글로벌 스타일 정의
 *
 * 이 파일에서는 앱 전체에서 사용되는 CSS 변수와 기본 스타일을 정의합니다.
 * 라이트 모드와 다크 모드에 !대한 테마 색상이 모두 !포함되어 있습니다.
 */

/* Inter 글꼴 가져오기 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* 라이트 모드 테마 변수 정의 */
:root {
  /* 기본 배경 및 레이아웃 색상 */
  --bg-color: #f2f7fa;
  --header-bg-color: #ffffff;
  --border-color: #e6e6e6;
  --text-color: #333333;
  --logo-color: orange;

  /* 카드 관련 색상 */
  --card-bg-color: #ffffff;
  --card-title-color: #333333;
  --card-description-color: #666666;

  /* 닫기 버튼 색상 */
  --close-button-color: #333333;
  --close-button-bg: rgba(0, 0, 0, 0.1);
  --close-button-hover-bg: rgba(0, 0, 0, 0.2);
  --close-button-bordr: rgba(0, 0, 0, 0.15);

  /* 오버레이 색상 */
  --overlay-bg-color: rgba(0, 0, 0, 0.7);

  /* 태그 색상 */
  --tag1-bg-color: rgba(51, 102, 204, 0.1);
  --tag1-text-color: #3366cc;
  --tag2-bg-color: rgba(51, 153, 102, 0.1);
  --tag2-text-color: #33996;

  /* 필터 관련 색상 */
  --filter-label-color: #4d4d4d;
  --filter-text-color: #666666;
  --filter-hover-shadow: rgba(0, 0, 0, 0.1);
  --filter-hover-border: #00ffff;
  --filter-hover-bg: rgba(0, 255, 255, 0.1);
}

/* 다크 모드 테마 변수 정의 */
html.dark {
  /* 기본 배경 및 레이아웃 색상 */
  --bg-color: #1a1a1a;
  --header-bg-color: #2a2a2a;
  --border-color: #444444;
  --text-color: #f0f0f0;
  --logo-color: #ff9933;

  /* 카드 관련 색상 */
  --card-bg-color: #2a2a2a;
  --card-title-color: #f0f0f0;
  --card-description-color: #cccccc;

  /* 닫기 버튼 색상 */
  --close-button-color: #f0f0f0;
  --close-button-bg: rgba(255, 255, 255, 0.1);
  --close-button-hover-bg: rgba(255, 255, 255, 0.2);
  --close-button-border: rgba(255, 255, 255, 0.15);

  /* 오버레이 색상 */
  --overlay-bg-color: rgba(0, 0, 0, 0.8);

  /* 태그 색상 */
  --tag1-bg-color: rgba(51, 102, 204, 0.2);
  --tag1-text-color: #66a3ff;
  --tag2-bg-color: rgba(51, 153, 102, 0.2);
  --tag2-text-color: #66cc99;

  /* 필터 관련 색상 */
  --filter-label-color: #f0f0f0;
  --filter-text-color: #ffffff;
  --filter-hover-shadow: rgba(255, 255, 255, 0.1);
  --filter-hover-border: #00cccc;
  --filter-hover-bg: rgba(0, 204, 204, 0.1);
}

/* 기본 리셋 스타일 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 글꼴 설정 및 부드러운 렌더링 */
body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased; /* 웹킷 기반 브라우저에서 글꼴 렌더링 개선 */
  -moz-osx-font-smoothing: grayscale; /* Firefox에서 글꼴 렌더링 개선 */
}

/* 앱 컨테이너 스타일 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.5s ease;
}

/* 헤더 스타일 */
.app-header {
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  position: relative;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  max-width: 85vw;
  margin: 0 auto;
  padding: 0 2vw;
  gap: 1vw;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 1vw;
  justify-self: center;
}

.logo {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: var(--logo-color, orange);
  text-decoration: none;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1vw;
  justify-self: end;
}

.recruitment-button,
.resume-button,
.discord-login-button {
  padding: 0.6vw 1.2vw;
  border: none;
  border-radius: 6px;
  font-size: 0.9vw;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5vw;
  min-font-size: 12px;
}

.recruitment-button {
  background-color: #007bff;
  color: white;
}

.recruitment-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.resume-button {
  background-color: #28a745;
  color: white;
}

.resume-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.discord-login-button {
  background-color: #5865f2;
  color: white;
}

.discord-login-button:hover {
  background-color: #4752c4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
}

.discord-login-button:active {
  transform: translateY(0);
}

.discord-icon {
  background-image: url('/images/Discord-Symbol-White.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 18px;
  height: 18px;
  display: inline-block;
}

.user-greeting {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
}

.logout-button {
  padding: 0.6vw 1.2vw;
  border: none;
  border-radius: 6px;
  font-size: 0.9vw;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  background-color: #dc3545;
  color: white;
  min-font-size: 12px;
}

.logout-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* 메인 레이아웃 */
.main-layout {
  display: flex;
  flex: 1;
  max-width: 85vw;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 63px);
}

/* 왼쪽 사이드바 */
.left-sidebar {
  width: 20vw;
  min-width: 300px;
  padding: 20px;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  height: calc(100vh - 80px);
  display: flex;
  justify-content: flex-end;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  padding: 20px;
  background-color: var(--bg-color);
  overflow-y: hidden; /* 스크롤 제거 */
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

/* 오른쪽 사이드바 */
.right-sidebar {
  width: 20vw;
  min-width: 300px;
  padding: 20px;
  background-color: var(--bg-color);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  height: calc(100vh - 80px);
}

/* 푸터 */
.app-footer {
  background-color: var(--header-bg-color);
  border-top: 1px solid var(--border-color);
  padding: 20px 0;
  text-align: center;
  color: var(--text-color);
}

.app-footer p {
  max-width: 60vw;
  margin: 0 auto;
  font-size: 14px;
}

/* 16:9 비율 최적화 */
@media (min-aspect-ratio: 16/9) {
  .header-content {
    max-width: 90vw;
  }

  .main-layout {
    max-width: 90vw;
  }

  .recruitment-button,
  .resume-button,
  .discord-login-button,
  .logout-button {
    font-size: clamp(12px, 0.8vw, 16px);
    padding: clamp(6px, 0.5vw, 10px) clamp(12px, 1vw, 18px);
  }
}

/* 작은 화면 최적화 */
@media (max-width: 1440px) {
  .header-content {
    max-width: 95vw;
    padding: 0 1vw;
  }

  .main-layout {
    max-width: 95vw;
  }

  .recruitment-button,
  .resume-button,
  .discord-login-button,
  .logout-button {
    font-size: clamp(11px, 1vw, 14px);
    padding: clamp(5px, 0.6vw, 8px) clamp(10px, 1.2vw, 16px);
  }
}

@media (max-width: 1024px) {
  .left-sidebar {
    display: none;
  }

  .main-layout {
    flex-direction: column;
  }

  .right-sidebar {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .header-right {
    flex-wrap: wrap;
    justify-content: center;
  }

  .recruitment-button,
  .resume-button,
  .discord-login-button,
  .logout-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .right-sidebar {
    display: none;
  }

  .main-content {
    padding: 15px;
  }
}
</style>
