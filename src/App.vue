<script lang="ts" setup>
import { usePopUpClosed } from '@/stores/usePopUpClosed.ts'
import SearchBar from '@/components/SearchBar.vue'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ApplicationHistory from '@/components/ApplicationHistory.vue'
import RecruitmentModal from '@/components/RecruitmentModal.vue'
import ResumeModal from '@/components/ResumeModal.vue'
import CustomModal from '@/components/CustomModal.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { inject, onMounted, ref } from 'vue'
import { customError, customSuccess, useCustomModal } from '@/composables/useCustomModal.ts'
import { usePartyOwner } from '@/stores/usePartyOwner.ts'
import { fetchParties, parties } from '@/composables/useParty.ts'
import type { VueCookies } from 'vue-cookies'
import { useRoute } from 'vue-router'
import { useKyProperties } from '@/stores/useKyProperties.ts'
import { useAuth } from '@/stores/useAuth.ts'
import { useDiscordAuth } from '@/stores/useDiscordAuth.ts'
import { useNotFound } from '@/stores/useNotFound.ts'
import { useMyWebSocket } from '@/composables/useMyWebSocket.ts'
import { kyWithCustom } from '@/utils/ky/kyWithCustom.ts'
import type { ApiResponse, PartyApplication, PartyRecruit } from '@/types/response.ts'
import { useDark, useToggle } from '@vueuse/core'
import TermsOfChat from '@/views/TermsOfChat.vue'
import { useTerms } from '@/stores/useTerms.ts'
import { useActiveParty } from '@/stores/useActiveParty.ts'
import { usePartyApplications } from '@/stores/usePartyApplications.ts'

const showRecruitmentModal = ref<boolean>(false)
const showResumeModal = ref<boolean>(false)
const searchQuery = ref<string>('')
const searchEnterTrigger = ref<number>(0)

const auth = useAuth()
const route = useRoute()
const websocket = useMyWebSocket()
const discordAuth = useDiscordAuth()
const popUpClosed = usePopUpClosed()
const kyProperties = useKyProperties()
const notFound = useNotFound()
const terms = useTerms()

const partyApplication = usePartyApplications()

// CustomModal 컴포저블 사용
const { modalState, handleConfirm, handleCancel, handleClose } = useCustomModal()
const activeParty = useActiveParty()
const $cookies = inject<VueCookies>('$cookies')
if (!$cookies) {
  throw new Error('Failed to inject $cookies. Make sure it is provided in app\'s context.')
}

window.addEventListener('storage', async (e) => {
  if (e.key === 'popUpClosed' && route.path !== '/pop-up/close') {
    const newValue = e.newValue ? JSON.parse(e.newValue) : {}
    if (!newValue.init) {
      newValue.isPopUp = false
      if (newValue.isSucceed) {
        newValue.isSucceed = false
        kyProperties.csrfToken = $cookies.get('X-CSRF-TOKEN')
        $cookies.set('X-CSRF-TOKEN', null)
        kyProperties.refreshToken = $cookies.get('REFRESH-TOKEN')
        $cookies.set('REFRESH-TOKEN', null)
      } else {
        if (newValue.errorMessage) {
          customError(newValue.errorMessage)
          newValue.errorMessage = null
        }
      }

      if (auth.isLoggedIn) {
        const res = await kyWithCustom('get', 'v1/party/my').json<ApiResponse<PartyRecruit>>()
        if (res.data) {
          activeParty.setActiveParty(true)
        }
        const resumes = await kyWithCustom('get', 'v1/party/application/my').json<
          ApiResponse<Array<PartyApplication>>
        >()
        if (resumes.data && resumes.data.length > 0) {
          partyApplication.cleanApplications()
          partyApplication.applications = resumes.data
        }
        const response = await kyWithCustom('get', 'v1/party/application').json<
          ApiResponse<Array<PartyApplication>>
        >()
        if (response.data && response.data.length > 0) {
          for (const application of response.data) {
            if (application.status === 'ACCEPTED') {
              await websocket.connect()
              websocket.joinParty(application.partyRecruit.id)
              return
            }
          }
        }
      }
    }
    popUpClosed.$patch(newValue)
  }
})

window.addEventListener('message', async (e) => {
  if (e.origin === 'http://localhost' || e.origin === 'https://maple-party.com') {
    if (typeof e.data === 'string') {
      auth.updateUserInfo(JSON.parse(e.data))
      auth.isLoggedIn = true
    }
  }
})

/**
 * 모집글 모달 닫기
 */
const closeRecruitmentModal = () => {
  showRecruitmentModal.value = false
}

/**
 * 지원서 모달 닫기
 */
const closeResumeModal = () => {
  showResumeModal.value = false
}

/** 다크 모드 상태 (vueuse의 useDark 훅 사용) */
const isDark = useDark({ disableTransition: true })
/** 다크 모드 토글 함수 */
const toggleDark = useToggle(isDark)
/** 사용자 상호작용 여부 (애니메이션 효과에 사용) */
const hasInteracted = ref(false)

/**
 * 다크 모드 토글 처리 함수
 * 다크 모드를 전환하고 사용자 상호작용 상태를 기록합니다.
 */
const handleToggleDark = () => {
  toggleDark()
  hasInteracted.value = true
}

/**
 * SearchBar에서 엔터 키가 눌렸을 때 즉시 검색을 실행하는 핸들러
 */
const handleSearchEnter = () => {
  // 트리거 값을 증가시켜 즉시 검색 실행을 알림
  searchEnterTrigger.value++
}

/**
 * 새 모집글 불러오기 함수
 */
const refreshParties = async () => {
  try {
    parties.value = await fetchParties(searchQuery.value)
    customSuccess('새 모집글을 성공적으로 가져왔습니다.')
  } catch (error) {
    console.error('모집글 새로고침 실패:', error)
    await customError('모집글 새로고침에 실패했습니다.')
  }
}

onMounted(async () => {
  popUpClosed.isPopUp = false
  discordAuth.isClicked = false
  notFound.is404 = false
  activeParty.hasActiveParty = false
  partyApplication.cleanApplications()
  if (auth.isLoggedIn) {
    const res = await kyWithCustom('get', 'v1/party/my').json<ApiResponse<PartyRecruit>>()
    if (res.data) {
      activeParty.setActiveParty(true)
    }
    const resumes = await kyWithCustom('get', 'v1/party/application/my').json<
      ApiResponse<Array<PartyApplication>>
    >()
    if (resumes.data && resumes.data.length > 0) {
      partyApplication.applications = resumes.data
    }
    const response = await kyWithCustom('get', 'v1/party/application').json<
      ApiResponse<Array<PartyApplication>>
    >()
    if (response.data && response.data.length > 0) {
      for (const application of response.data) {
        if (application.status === 'ACCEPTED') {
          await websocket.connect()
          websocket.joinParty(application.partyRecruit.id)
          return
        }
      }
    }
  }
})
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
          <button class="refresh-button" @click="refreshParties" title="새 모집글 가져오기">
            <span class="refresh-icon">↻</span>
            새 모집글 가져오기
          </button>
          <button
            :disabled="activeParty.hasActiveParty"
            class="recruitment-button"
            @click="() => (showRecruitmentModal = !showRecruitmentModal)"
          >
            {{ activeParty.hasActiveParty ? '이미 모집중' : '모집글 작성' }}
          </button>
          <button class="resume-button" @click="() => (showResumeModal = !showResumeModal)">
            지원서 작성
          </button>
        </div>
        <div class="header-right">
          <button
            v-show="!auth.isLoggedIn"
            class="discord-login-button"
            @click.stop="discordAuth.openDiscordLoginWithDoubleClickValidation"
          >
            <span class="discord-icon"></span>
            디스코드로 로그인
          </button>
          <span v-show="auth.isLoggedIn" class="user-greeting">
            {{ auth.userInfo.name }}님 안녕하세요.
          </span>
          <button v-show="auth.isLoggedIn" class="logout-button" @click="auth.logout">
            로그아웃
          </button>
          <SearchBar v-model="searchQuery" @enter="handleSearchEnter" />
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 영역 -->
    <div class="main-layout">
      <!-- 왼쪽 사이드바 -->
      <aside v-if="!popUpClosed.isPopUp && !notFound.is404" class="left-sidebar">
        <ChatSidebar />
      </aside>

      <!-- 중앙 컨텐츠 영역 -->
      <main class="main-content">
        <RouterView :search-query="searchQuery" :search-enter-trigger="searchEnterTrigger" />
      </main>

      <!-- 오른쪽 사이드바 (파티 모집글을 작성한 경우에만 표시) -->
      <aside
        v-if="!popUpClosed.isPopUp && !notFound.is404 && activeParty.hasActiveParty"
        class="right-sidebar"
      >
        <ApplicationHistory />
      </aside>
    </div>

    <!-- 푸터 -->
    <footer v-if="!popUpClosed.isPopUp" class="app-footer">
      <div class="footer-content">
        <span class="copyright">&copy; 2025 메이플 파티. All rights reserved.</span>
        <div class="footer-links">
          <router-link to="/terms/use" class="footer-link">이용약관</router-link>
          <router-link to="/terms/privacy" class="footer-link">개인정보 처리방침</router-link>
        </div>
      </div>
    </footer>

    <RecruitmentModal :show="showRecruitmentModal" @close="closeRecruitmentModal" />
    <ResumeModal :show="showResumeModal" @close="closeResumeModal" />

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

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Terms of Chat Modal -->
    <TermsOfChat v-if="auth.isLoggedIn && !terms.getReadStatus()" />
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
  --close-button-border: rgba(0, 0, 0, 0.15);

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
  justify-content: center;
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

.refresh-button,
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
  justify-content: center;
  gap: 0.5vw;
  min-width: 120px;
}

.refresh-button {
  background-color: #17a2b8;
  color: white;
}

.refresh-button:hover {
  background-color: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.refresh-button:active {
  transform: translateY(0);
}

.refresh-icon {
  font-size: 18px;
  display: inline-block;
  transition: transform 0.3s ease;
  font-weight: bold;
}

.refresh-button:hover .refresh-icon {
  transform: rotate(180deg);
}

/* 다크모드 토글 컨테이너 스타일 */
.toggle-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 15px;
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

.recruitment-button {
  background-color: #007bff;
  color: white;
}

.recruitment-button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.recruitment-button:disabled {
  background-color: #6c757d;
  color: #ffffff;
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  min-width: 100px;
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
  padding: 20px 20px 20px 10px; /* 좌측 패딩을 줄임 */
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
  color: var(--text-color);
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 85vw;
  margin: 0 auto;
  padding: 0 2vw;
}

.copyright {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  font-size: 14px;
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.8;
}

.footer-link:hover {
  opacity: 1;
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--logo-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.2);
}

.footer-link:active {
  transform: translateY(0);
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--logo-color);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.footer-link:hover::after {
  width: 80%;
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

  .toggle-container {
    margin: 0;
    order: 0;
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

  .right-sidebar {
    display: none;
  }

  .main-content {
    padding: 15px;
  }

  .footer-content {
    flex-direction: column;
    gap: 15px;
    max-width: 95vw;
  }

  .footer-links {
    gap: 15px;
  }

  .footer-link {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
