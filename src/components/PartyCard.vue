<script lang="ts" setup>
/**
 * PartyCard 컴포넌트
 *
 * 이 컴포넌트는 파티/이벤트 카드를 보여주며, 마우스 움직임에 따른 틸트 효과를
 * 제공합니다. vueuse/core의 useMouseInElement를 활용하여 인터랙티브한 UI 경험을 제공합니다.
 */
import {useEventListener, useMouseInElement} from '@vueuse/core';
import {computed, onMounted, ref} from 'vue';
import {useCustomModal} from '@/composables/useCustomModal.ts';

/**
 * Party 타입 정의
 * PartyCard 컴포넌트의 props와 동일한 구조를 가진 타입입니다.
 */
export type Party = {
  /** 파티의 고유 ID */
  id: number;
  /** 파티의 설명 텍스트 */
  article: Article;
  /** 현재 멤버 수 */
  currentMembers: number;
};

export type Article = {
  title: string;
  contents: string;
};

// 컴포넌트 프롭스 정의
const props = defineProps<{
  /** 파티의 설명 텍스트 */
  id: number;
  /** 파티의 설명 텍스트 */
  contents: string;
  /** 현재 멤버 수 */
  currentMembers: number;
}>();

const {customSuccess} = useCustomModal();

// 상태 관리를 위한 ref 변수들
/** 카드가 확장된 상태인지 여부를 저장 */
const isExpanded = ref(false);
/** 카드 틸트 효과를 위한 DOM 참조 */
const cardTilt = ref<HTMLDivElement | null>(null);
/** 확장된 카드에 대한 DOM 참조 */
const expandedCardRef = ref<HTMLDivElement | null>(null);
/** 마우스 위치 및 요소 관련 데이터를 추적하는 vueuse의 훅 */
const {elementX, elementY, isOutside, elementHeight, elementWidth} = useMouseInElement(cardTilt);

/**
 * 카드의 틸트 효과를 위한 스타일 계산
 * 마우스 위치에 따라 카드의 회전 각도와 그림자 효과를 동적으로 계산합니다.
 */
const tiltStyle = computed(() => {
  // 카드가 확장되었을 때는 틸트 효과를 적용하지 않음
  if (isExpanded.value) {
    return {
      transform: 'perspective(500px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease, box-shadow 0.5s ease',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    };
  }

  // 마우스가 요소 밖에 있을 때 기본 상태로 돌아감
  if (isOutside.value) {
    return {
      transform: 'perspective(500px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease, box-shadow 0.5s ease',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    };
  }

  // 마우스 위치를 기반으로 틸트 각도 계산
  const tiltX = (elementY.value / elementHeight.value - 0.5) * 20;
  const tiltY = (elementX.value / elementWidth.value - 0.5) * -20;

  // 틸트 각도에 따른 동적 그림자 계산
  const shadowX = tiltY * 0.5;
  const shadowY = tiltX * -0.5;
  const shadowBlur = Math.max(Math.abs(tiltX), Math.abs(tiltY)) + 15;

  return {
    transform: `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.2)`,
  };
});

/**
 * 확장된 카드의 가시성을 제어하는 스타일
 */
const expandedCardStyle = computed(() => {
  return {
    opacity: isExpanded.value ? 1 : 0,
    visibility: isExpanded.value ? ('visible' as const) : ('hidden' as const),
  };
});

/**
 * contents 일부분만 보여주는 계산된 속성
 */
const truncatedDescription = computed(() => {
  const lines = props.contents.split('\n');
  return lines.slice(0, 5).join('\n');
});

/**
 * 지원하기 버튼 클릭 핸들러
 */
const handleSupport = async () => {
  await customSuccess('지원이 완료되었습니다!');
};

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
        isExpanded.value = false;
      }
    },
    {passive: true},
  );
  useEventListener(document, 'keydown', (event) => {
    if (event.key === 'Escape') {
      isExpanded.value = false;
    }
  });
});
</script>

<template>
  <div>
    <!-- 일반 카드 -->
    <div ref="cardTilt" :style="tiltStyle" class="card" @click.stop="isExpanded = !isExpanded">
      <!-- 마우스 위치에 따른 빛 효과 -->
      <div
        :style="{
          background: `radial-gradient(circle at ${elementX}px ${elementY}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)`,
          opacity: isOutside ? 0 : 1,
        }"
        class="card-shine"
      ></div>
      <!-- 멤버 수 표시 -->
      <div class="member-count">
        <span class="current-members">현재: {{ currentMembers }} 명</span>
      </div>

      <!-- 카드 컨텐츠 영역 -->
      <div class="card-content">
        <p class="card-description" v-html="truncatedDescription.replace(/\n/g, '<br>')"></p>
        <button class="support-button" @click.stop="handleSupport">지원하기</button>
      </div>
    </div>

    <!-- 카드 확장 시 배경 오버레이 -->
    <div :class="{ active: isExpanded }" class="overlay"></div>

    <!-- 확장된 카드 뷰 -->
    <div ref="expandedCardRef" :style="expandedCardStyle as any" class="expanded-card" @click.stop>
      <!-- 닫기 버튼 -->
      <button class="close-button" @click.stop="isExpanded = false">
        <span class="close-icon">×</span>
      </button>
      <!-- 확장된 카드 컨텐츠 영역 -->
      <div class="expanded-card-content">
        <p class="expanded-card-description" v-html="contents.replace(/\n/g, '<br>')"></p>
        <button class="support-button" @click="handleSupport">지원하기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 카드 기본 스타일 */
.card {
  width: 100%; /* 그리드 셀 크기에 맞춤 */
  height: 100%; /* 그리드 셀 높이에 맞춤 */
  min-height: unset; /* 최소 높이 제거 */
  max-height: unset; /* 최대 높이 제거 */
  min-width: 120px; /* 최소 너비만 유지 */
  max-width: unset; /* 최대 너비 제거 */
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px; /* 크기에 맞게 줄임 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.2vw;
  padding: 0.3vw;
  transform-style: preserve-3d; /* 3D 효과를 위한 설정 */
  position: relative;
  z-index: 1;
  transition: background-color 0.3s,
  border-color 0.3s;
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
}

.support-button:hover {
  background-color: #2855aa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 102, 204, 0.3);
}

.support-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(51, 102, 204, 0.2);
}
</style>
