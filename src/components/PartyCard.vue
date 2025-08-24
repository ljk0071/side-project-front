<script lang="ts" setup>
/**
 * PartyCard 컴포넌트
 *
 * 이 컴포넌트는 파티/이벤트 카드를 보여주며, 마우스 움직임에 따른 틸트 효과를
 * 제공합니다. vueuse/core의 useMouseInElement를 활용하여 인터랙티브한 UI 경험을 제공합니다.
 */
import { useEventListener, useMouseInElement } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { customAlert } from '@/composables/useCustomModal.ts'
import { useAuth } from '@/stores/useAuth.ts'
import { useResume } from '@/stores/useResume.ts'
import { kyWithCustom } from '@/utils/ky/kyWithCustom.ts'
import { fetchParties, parties } from '@/composables/useParty.ts'
import { useMyWebSocket } from '@/composables/useMyWebSocket.ts'
import type { PartyRecruit } from '@/types/response.ts'
import { usePartyOwner } from '@/stores/usePartyOwner.ts'
import { usePartyApplications } from '@/stores/usePartyApplications.ts'
import { useActiveParty } from '@/stores/useActiveParty.ts'

/**
 * Party 타입 정의
 * PartyCard 컴포넌트의 props와 동일한 구조를 가진 타입입니다.
 */
export type Party = PartyRecruit & {
  /** 현재 멤버 수 */
  currentMembers: number;
};

// 컴포넌트 프롭스 정의
const props = defineProps<{
  /** 파티의 설명 텍스트 */
  id: number;
  /** 파티의 설명 텍스트 */
  contents: string;
  /** 현재 멤버 수 */
  currentMembers: number;
  /** 유저 고유 아이디 */
  userUniqueId: number;
  /** 지원 여부 */
  isApplied?: boolean;
  isRejected?: boolean;
}>()

// 상태 관리를 위한 ref 변수들
/** 카드가 확장된 상태인지 여부를 저장 */
const isExpanded = ref(false)
/** 카드 틸트 효과를 위한 DOM 참조 */
const cardTilt = ref<HTMLDivElement | null>(null)
/** 확장된 카드에 대한 DOM 참조 */
const expandedCardRef = ref<HTMLDivElement | null>(null)
/** 마우스 위치 및 요소 관련 데이터를 추적하는 vueuse의 훅 */
const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(cardTilt)

const auth = useAuth()
const resume = useResume()
const webSocket = useMyWebSocket()
const partyOwner = usePartyOwner()
const activeParty = useActiveParty()

// 내 게시글인지 확인하는 computed
const isMyParty = computed(() => {
  return auth.userInfo?.uniqueId == props.userUniqueId
})

partyOwner.isMyParty = isMyParty.value
partyOwner.partyRecruitId = props.id

// 지원 상태 관리
const isApplied = ref(props.isApplied || false)
const isRejected = ref(props.isRejected || false)
const isApplying = ref(false)
const clickPosition = ref({ x: 0, y: 0 })

// 삭제 상태 관리
const isDeleting = ref(false)

// 버튼 텍스트 computed
const buttonText = computed(() => {
  if (isDeleting.value) return '삭제 중...'
  if (isApplied.value) return '지원완료'
  if (isApplying.value) return '지원하기'
  if (isMyParty.value) return '삭제하기'
  if (isRejected.value) return '컷당한 파티'
  return '지원하기'
})

// props 변경 감지
watch(
  () => props.isApplied,
  (newValue: boolean | undefined) => {
    if (newValue !== undefined) {
      isApplied.value = newValue
    }
  }
)

watch(
  () => props.isRejected,
  (newValue: boolean | undefined) => {
    if (newValue !== undefined) {
      isRejected.value = newValue
    }
  }
)

/**
 * 카드의 틸트 효과를 위한 스타일 계산
 * 마우스 위치에 따라 카드의 회전 각도와 그림자 효과를 동적으로 계산합니다.
 */
const tiltStyle = computed(() => {
  // 삭제 중일 때는 틸트 효과를 적용하지 않음
  if (isDeleting.value) {
    return {
      transition: 'opacity 0.5s ease-out',
      opacity: 0,
      pointerEvents: 'none'
    }
  }

  // 카드가 확장되었을 때는 틸트 효과를 적용하지 않음
  if (isExpanded.value) {
    return {
      transform: 'perspective(500px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease, box-shadow 0.5s ease',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    }
  }

  // 마우스가 요소 밖에 있을 때 기본 상태로 돌아감
  if (isOutside.value) {
    return {
      transform: 'perspective(500px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease, box-shadow 0.5s ease',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
    }
  }

  // 마우스 위치를 기반으로 틸트 각도 계산
  const tiltX = (elementY.value / elementHeight.value - 0.5) * 20
  const tiltY = (elementX.value / elementWidth.value - 0.5) * -20

  // 틸트 각도에 따른 동적 그림자 계산
  const shadowX = tiltY * 0.5
  const shadowY = tiltX * -0.5
  const shadowBlur = Math.max(Math.abs(tiltX), Math.abs(tiltY)) + 15

  return {
    transform: `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.2)`
  }
})

/**
 * 확장된 카드의 가시성을 제어하는 스타일
 */
const expandedCardStyle = computed(() => {
  return {
    opacity: isExpanded.value ? 1 : 0,
    visibility: isExpanded.value ? ('visible' as const) : ('hidden' as const)
  }
})

/**
 * contents 일부분만 보여주는 계산된 속성
 */
const truncatedDescription = computed(() => {
  const lines = props.contents.split('\n')
  return lines.slice(0, 5).join('\n')
})

const partyApplications = usePartyApplications()

/**
 * 지원하기 버튼 클릭 핸들러 (지원하기 또는 삭제하기)
 */
const handleSupport = async (event: MouseEvent) => {
  if (isApplied.value || isApplying.value || isDeleting.value) return

  // 내 게시글인 경우 삭제 처리
  if (isMyParty.value) {
    try {
      isDeleting.value = true

      await kyWithCustom('delete', `v1/party/${props.id}`).json<void>()
      partyOwner.isMyParty = false
      partyApplications.applications = []
      webSocket.disconnect()
      webSocket.receivePartyMessage = []
      activeParty.resetActiveParty()

      // 삭제 애니메이션 후 목록 새로고침
      setTimeout(async () => {
        await fetchParties()
        parties.value = await fetchParties()
      }, 500)
    } catch (error) {
      console.error('파티 삭제 실패:', error)
      isDeleting.value = false
      await customAlert('파티 삭제에 실패했습니다.')
    }
    return
  }

  if (!auth.isLoggedIn) {
    await customAlert('로그인 및 지원서 작성 후 지원 가능합니다.')
    return
  }

  if (!resume?.resume?.id) {
    await customAlert('지원서 작성 후 지원 가능합니다.')
    return
  }

  // 클릭 위치 저장
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  clickPosition.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  isApplying.value = true

  try {
    await kyWithCustom('post', 'v1/party/application', {
      partyRecruitId: props.id,
      resumeId: resume.resume.id
    }).json<void>()

    isApplied.value = true
    useResume().appliedParties.push(props.id)

    // 지원 성공 시 WebSocket 연결 및 알림 전송
    await webSocket.connect()
    webSocket.subscribeNotify()

    usePartyOwner().partyRecruitId = props.id
  } catch (error) {
    console.error('파티 지원 실패:', error)
    setTimeout(() => (isApplying.value = false), 300)
  }

  setTimeout(() => (isApplying.value = false), 300)
}

/**
 * 컴포넌트가 마운트될 때 이벤트 리스너 설정
 */
onMounted(() => {
  useEventListener(
    document,
    'click',
    (event) => {
      if (
        isExpanded.value &&
        expandedCardRef.value &&
        !expandedCardRef.value.contains(event.target as Node)
      ) {
        isExpanded.value = false
      }
    },
    { passive: true }
  )
  useEventListener(document, 'keydown', (event) => {
    if (event.key === 'Escape') {
      isExpanded.value = false
    }
  })
})
</script>

<template>
  <div>
    <!-- 일반 카드 -->
    <div
      ref="cardTilt"
      :style="tiltStyle"
      :class="['card', { 'my-post': isMyParty, deleting: isDeleting }]"
      @click.stop="isExpanded = !isExpanded"
    >
      <!-- 마우스 위치에 따른 빛 효과 -->
      <div
        :style="{
          background: `radial-gradient(circle at ${elementX}px ${elementY}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)`,
          opacity: isOutside ? 0 : 1,
        }"
        class="card-shine"
      ></div>
      <!-- 멤버 수 표시 -->
      <!--      <div class="member-count">-->
      <!--        <span class="current-members">현재: {{ currentMembers }} 명</span>-->
      <!--      </div>-->

      <!-- 카드 컨텐츠 영역 -->
      <div class="card-content">
        <p class="card-description" v-html="truncatedDescription.replace(/\n/g, '<br>')"></p>
        <button
          :class="[
            'support-button',
            {
              applying: isApplying,
              applied: isApplied,
              'my-post': isMyParty,
              deleting: isDeleting,
              rejected: isRejected,
            },
          ]"
          @click.stop="handleSupport"
          :disabled="isApplied || isApplying || isDeleting || isRejected"
        >
          <span class="button-text">{{ buttonText }}</span>
          <span
            v-if="isApplying"
            class="ripple-effect"
            :style="{
              left: clickPosition.x + 'px',
              top: clickPosition.y + 'px',
            }"
          ></span>
        </button>
      </div>
    </div>

    <!-- 카드 확장 시 배경 오버레이 -->
    <div :class="{ active: isExpanded }" class="overlay"></div>

    <!-- 확장된 카드 뷰 -->
    <div ref="expandedCardRef" :style="expandedCardStyle" class="expanded-card" @click.stop>
      <!-- 닫기 버튼 -->
      <button class="close-button" @click.stop="isExpanded = false">
        <span class="close-icon">×</span>
      </button>
      <!-- 확장된 카드 컨텐츠 영역 -->
      <div class="expanded-card-content">
        <p class="expanded-card-description" v-html="contents.replace(/\n/g, '<br>')"></p>
        <button
          v-if="!partyOwner.isMyParty"
          :class="[
            'support-button',
            {
              applying: isApplying,
              applied: isApplied,
              'my-post': partyOwner.isMyParty,
              deleting: isDeleting,
            },
          ]"
          @click="handleSupport"
          :disabled="isApplied || isApplying || isDeleting || isRejected"
        >
          <span class="button-text">{{ buttonText }}</span>
          <span
            v-if="isApplying"
            class="ripple-effect"
            :style="{
              left: clickPosition.x + 'px',
              top: clickPosition.y + 'px',
            }"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 카드 기본 스타일 */
.card {
  width: 100%; /* 그리드 셀 크기에 맞춤 */
  aspect-ratio: 16 / 9; /* 16:9 비율 고정 */
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.2vw;
  padding: 0.3vw;
  transform-style: preserve-3d; /* 3D 효과를 위한 설정 */
  position: relative;
  z-index: 1;
  transition: background-color 0.3s,
  border-color 0.3s,
  opacity 0.3s ease-out,
  transform 0.3s ease-out;
}

/* 삭제 애니메이션 - 유령처럼 사라지는 효과 */
.card.deleting {
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity 0.5s ease-out !important;
}

/* 내 게시글 오로라 이펙트 - 카드 주변에만 */
.card.my-post {
  animation: aurora-glow 8s ease-in-out infinite;
}

@keyframes aurora-glow {
  0% {
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.4),
    0 0 40px rgba(255, 107, 107, 0.2);
  }
  12.5% {
    box-shadow: 0 0 20px rgba(255, 165, 87, 0.4),
    0 0 40px rgba(255, 165, 87, 0.2);
  }
  25% {
    box-shadow: 0 0 20px rgba(255, 215, 87, 0.4),
    0 0 40px rgba(255, 215, 87, 0.2);
  }
  37.5% {
    box-shadow: 0 0 20px rgba(150, 255, 87, 0.4),
    0 0 40px rgba(150, 255, 87, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(87, 255, 196, 0.4),
    0 0 40px rgba(87, 255, 196, 0.2);
  }
  62.5% {
    box-shadow: 0 0 20px rgba(87, 180, 255, 0.4),
    0 0 40px rgba(87, 180, 255, 0.2);
  }
  75% {
    box-shadow: 0 0 20px rgba(150, 87, 255, 0.4),
    0 0 40px rgba(150, 87, 255, 0.2);
  }
  87.5% {
    box-shadow: 0 0 20px rgba(255, 87, 215, 0.4),
    0 0 40px rgba(255, 87, 215, 0.2);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.4),
    0 0 40px rgba(255, 107, 107, 0.2);
  }
}

.card:hover {
  cursor: pointer;
}

/* 마우스 위치에 따른 빛 효과 스타일 */
.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* 마우스 이벤트가 하위 요소로 전달되도록 함 */
  z-index: 10;
  border-radius: 20px;
  transition: opacity 0.3s ease;
}

/* 카드 컨텐츠 영역 스타일 */
.card-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transform: translateZ(10px); /* 3D 공간에서 앞으로 이동 */
  height: 100%;
}

/* 카드 설명 스타일 */
.card-description {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--card-description-color);
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  max-height: 5.6em;
  flex: 1;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 80%;
}

/* 오버레이 스타일 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease,
  visibility 0.3s ease;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 확장된 카드 스타일 */
.expanded-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  background-color: var(--card-bg-color);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 200;
  padding: 20px;
  overflow-y: auto;
  transition: transform 0.3s ease,
  opacity 0.3s ease,
  visibility 0.3s ease;
}

.expanded-card[style*='visible'] {
  transform: translate(-50%, -50%) scale(1);
}

/* 닫기 버튼 스타일 */
.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.close-icon {
  font-size: 18px;
  color: #666;
}

/* 확장된 카드 컨텐츠 영역 */
.expanded-card-content {
  padding: 20px;
}

/* 확장된 카드 설명 */
.expanded-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: var(--card-description-color);
  margin: 0 0 20px 0;
  line-height: 1.6;
  transition: color 0.3s;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 90%;
}

/* 멤버 수 표시 스타일 */
.member-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--member-count-bg, rgba(255, 255, 255, 0.95));
  color: var(--member-count-text, #333);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--member-count-border, rgba(0, 0, 0, 0.1));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

.current-members {
  color: var(--member-current-color, #28a745);
}

.divider {
  color: var(--member-divider-color, #666);
  margin: 0 1px;
}

/* 다크 모드에서 멤버 카운트 스타일 */
:root.dark .member-count {
  --member-count-bg: rgba(0, 0, 0, 0.8);
  --member-count-text: #ffffff;
  --member-count-border: rgba(255, 255, 255, 0.2);
  --member-current-color: #4caf50;
  --member-divider-color: #ffffff;
  --member-max-color: #ffffff;
}

/* 지원하기 버튼 스타일 */
.support-button {
  padding: 10px 20px;
  background-color: #3366cc;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
  margin-left: auto;
  display: block;
  width: fit-content;
  align-self: flex-end;
  position: relative;
  overflow: hidden;
}

.support-button:hover:not(:disabled) {
  background-color: #2855aa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 102, 204, 0.3);
}

.support-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(51, 102, 204, 0.2);
}

.support-button:disabled {
  cursor: default;
}

.support-button.applied {
  background-color: #28a745;
  cursor: default;
}

.support-button.rejected {
  background-color: #acacac;
  cursor: default;
}

.support-button.applied:hover {
  background-color: #28a745;
  transform: none;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.support-button.my-post {
  background-color: #dc3545;
  cursor: pointer;
}

.support-button.my-post:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.support-button.my-post:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
}

.support-button.deleting {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.support-button.deleting:hover {
  background-color: #6c757d;
  transform: none;
  box-shadow: none;
}

.button-text {
  position: relative;
  z-index: 2;
}

.ripple-effect {
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: #28a745;
  transform: translate(-50%, -50%);
  z-index: 1;
  animation: ripple 0.6s ease-out forwards;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0.8;
  }
}

/* WebSocket 연결 상태 표시 */
.websocket-status {
  position: absolute;
  top: 35px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

.websocket-status.connected {
  color: #28a745;
  border-color: rgba(40, 167, 69, 0.3);
}

.websocket-status.connecting {
  color: #ffc107;
  border-color: rgba(255, 193, 7, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.websocket-status.connected .status-dot {
  background-color: #28a745;
  animation: pulse-green 2s infinite;
}

.websocket-status.connecting .status-dot {
  background-color: #ffc107;
  animation: pulse-yellow 1s infinite;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

@keyframes pulse-yellow {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

/* 다크 모드에서 WebSocket 상태 스타일 */
:root.dark .websocket-status {
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

:root.dark .websocket-status.connected {
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.3);
}

:root.dark .websocket-status.connecting {
  color: #ffeb3b;
  border-color: rgba(255, 235, 59, 0.3);
}

/* 내 게시글 표시 스타일 */
</style>
