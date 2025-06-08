<script setup lang="ts">
/**
 * PartyCard3 컴포넌트
 *
 * 이 컴포넌트는 파티/이벤트 카드를 보여주며, 마우스 움직임에 따른 틸트 효과와
 * 카드 확장 기능을 제공합니다. vueuse/core의 useMouseInElement와 useEventListener를
 * 활용하여 인터랙티브한 UI 경험을 제공합니다.
 */
import { useEventListener, useMouseInElement } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

// 컴포넌트 프롭스 정의
defineProps<{
  /** 카드의 제목 */
  title: string;
  /** 카드의 설명 텍스트 */
  description: string;
  /** 카드에 표시될 태그 배열 */
  tags: string[];
  /** 카드 이미지 배경 색상 */
  imageColor: string;
}>();

// 상태 관리를 위한 ref 변수들
/** 카드가 확장된 상태인지 여부를 저장 */
const isExpanded = ref(false);
/** 카드 틸트 효과를 위한 DOM 참조 */
const cardTilt = ref<HTMLDivElement | null>(null);
/** 확장된 카드에 대한 DOM 참조 */
const expandedCardRef = ref<HTMLDivElement | null>(null);
/** 마우스 위치 및 요소 관련 데이터를 추적하는 vueuse의 훅 */
const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement(cardTilt);

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
 * 타입스크립트 타입 에러 방지를 위해 as const를 사용하여 리터럴 타입 지정
 */
const expandedCardStyle = computed(() => {
  return {
    opacity: isExpanded.value ? 1 : 0,
    visibility: isExpanded.value ? ('visible' as const) : ('hidden' as const),
  };
});

/**
 * 컴포넌트가 마운트될 때 이벤트 리스너 설정
 * 확장된 카드 외부를 클릭하면 카드가 닫히도록 함
 */
onMounted(() => {
  // 확장된 카드 외부 클릭 시 닫기 처리
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
    { passive: true }, // 성능 최적화를 위해 passive 이벤트 리스너 사용
  );
});
</script>

<template>
  <div>
    <!-- 확장 가능한 일반 카드 -->
    <div ref="cardTilt" :style="tiltStyle" class="card" @click.stop="isExpanded = !isExpanded">
      <!-- 마우스 위치에 따른 빛 효과 -->
      <div
        :style="{
          background: `radial-gradient(circle at ${elementX}px ${elementY}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)`,
          opacity: isOutside ? 0 : 1,
        }"
        class="card-shine"
      ></div>
      <!-- 카드 이미지 영역 -->
      <div
        :class="{ 'rgb-breath': true }"
        :style="{ '--base-color': imageColor }"
        class="card-image"
      ></div>
      <!-- 카드 컨텐츠 영역 -->
      <div class="card-content">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-description">{{ description }}</p>
        <div class="card-tags">
          <span
            v-for="(tag, index) in tags"
            :key="index"
            :style="{
              backgroundColor: index === 0 ? 'var(--tag1-bg-color)' : 'var(--tag2-bg-color)',
              color: index === 0 ? 'var(--tag1-text-color)' : 'var(--tag2-text-color)',
              transition: 'background-color 0.3s, color 0.3s',
            }"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
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
      <!-- 확장된 카드 이미지 영역 -->
      <div :style="{ '--base-color': imageColor }" class="expanded-card-image"></div>
      <!-- 확장된 카드 컨텐츠 영역 -->
      <div class="expanded-card-content">
        <h2 class="expanded-card-title">{{ title }}</h2>
        <p class="expanded-card-description">{{ description }}</p>
        <div class="expanded-card-tags">
          <span
            v-for="(tag, index) in tags"
            :key="index"
            :style="{
              backgroundColor: index === 0 ? 'var(--tag1-bg-color)' : 'var(--tag2-bg-color)',
              color: index === 0 ? 'var(--tag1-text-color)' : 'var(--tag2-text-color)',
              transition: 'background-color 0.3s, color 0.3s',
            }"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 카드 기본 스타일 */
.card {
  width: 320px;
  height: 380px;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
  transform-style: preserve-3d; /* 3D 효과를 위한 설정 */
  position: relative;
  z-index: 1;
  transition:
    background-color 0.3s,
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

/* 카드 이미지 영역 스타일 */
.card-image {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  transform: translateZ(20px); /* 3D 공간에서 앞으로 이동 */
}

/* RGB 호흡 효과 스타일 */
.rgb-breath {
  animation: rgbBreath 8s infinite ease-in-out;
  background-color: var(--base-color);
  position: relative;
  overflow: hidden;
}

/* RGB 호흡 효과를 위한 오버레이 */
.rgb-breath::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 0, 128, 0) 0%,
    rgba(255, 0, 128, 0.3) 50%,
    rgba(0, 128, 255, 0.3) 75%,
    rgba(128, 255, 0, 0.3) 100%
  );
  animation: rgbGlow 8s infinite alternate cubic-bezier(0.455, 0.03, 0.515, 0.955);
  mix-blend-mode: overlay; /* 색상 블렌딩 모드 */
  border-radius: 12px;
}

/* RGB 호흡 애니메이션 정의 */
@keyframes rgbBreath {
  0%,
  100% {
    background-color: var(--base-color);
    transform: scale(1);
  }
  25% {
    background-color: rgba(255, 0, 128, 0.8); /* 핑크 */
    transform: scale(1.02);
  }
  50% {
    background-color: rgba(0, 128, 255, 0.8); /* 파랑 */
    transform: scale(1);
  }
  75% {
    background-color: rgba(128, 255, 0, 0.8); /* 그린 */
    transform: scale(1.02);
  }
}

/* RGB 글로우 애니메이션 정의 */
@keyframes rgbGlow {
  0% {
    opacity: 0.5;
    background-position: 0 50%;
  }
  50% {
    opacity: 0.8;
    background-position: 100% 50%;
  }
  100% {
    opacity: 0.5;
    background-position: 0 50%;
  }
}

/* 카드 컨텐츠 영역 스타일 */
.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform: translateZ(10px); /* 3D 공간에서 앞으로 이동 */
}

/* 카드 제목 스타일 */
.card-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--card-title-color);
  margin: 0;
  transition: color 0.3s;
}

/* 카드 설명 스타일 */
.card-description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--card-description-color);
  margin: 0;
  line-height: 1.5;
  transition: color 0.3s;
}

/* 카드 태그 컨테이너 스타일 */
.card-tags {
  display: flex;
  gap: 8px;
  padding: 10px 0;
}

/* 개별 태그 스타일 */
.tag {
  padding: 4px 12px;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
}

/* 확장 버튼 스타일 */
.expand-button {
  padding: 8px 16px;
  background-color: #3366cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  margin-bottom: 10px;
  transition: background-color 0.2s ease;
}

.expand-button:hover {
  background-color: #2855a8;
}

/* 오버레이 스타일 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay-bg-color);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease,
    background-color 0.3s;
}

/* 활성화된 오버레이 스타일 */
.overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 확장된 카드 스타일 */
.expanded-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9); /* 중앙 정렬 및 초기 크기 설정 */
  width: 80%;
  max-width: 800px;
  height: auto;
  max-height: 90vh;
  background-color: var(--card-bg-color);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 200;
  padding: 20px;
  overflow: auto; /* 내용이 많을 경우 스크롤 가능하도록 설정 */
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    visibility 0.3s ease,
    background-color 0.3s;
}

/* 확장된 카드가 보일 때 스타일 */
.expanded-card[style*='visible'] {
  transform: translate(-50%, -50%) scale(1); /* 완전히 표시될 때 원래 크기로 */
}

/* 닫기 버튼 스타일 */
.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: var(--close-button-bg);
  border: 1px solid var(--close-button-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px); /* 배경 블러 효과 */
  padding: 0;
}

/* 닫기 버튼 호버 스타일 */
.close-button:hover {
  background-color: var(--close-button-hover-bg);
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

/* 닫기 아이콘 스타일 */
.close-icon {
  color: var(--close-button-color);
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  display: inline-block;
  transform: translateY(-1px);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

/* 닫기 아이콘 호버 스타일 */
.close-button:hover .close-icon {
  transform: translateY(-1px) scale(1.2);
}

/* 확장된 카드 이미지 스타일 */
.expanded-card-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  background-color: var(--base-color);
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

/* 확장된 카드 이미지 오버레이 */
.expanded-card-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 0, 128, 0) 0%,
    rgba(255, 0, 128, 0.3) 50%,
    rgba(0, 128, 255, 0.3) 75%,
    rgba(128, 255, 0, 0.3) 100%
  );
  animation: rgbGlow 8s infinite alternate cubic-bezier(0.455, 0.03, 0.515, 0.955);
  mix-blend-mode: overlay;
  border-radius: 12px;
}

/* 확장된 카드 컨텐츠 영역 스타일 */
.expanded-card-content {
  padding: 0 20px 20px;
}

/* 확장된 카드 제목 스타일 */
.expanded-card-title {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: var(--card-title-color);
  margin: 0 0 15px 0;
  transition: color 0.3s;
}

/* 확장된 카드 설명 스타일 */
.expanded-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: var(--card-description-color);
  margin: 0 0 20px 0;
  line-height: 1.6;
  transition: color 0.3s;
}

/* 확장된 카드 태그 컨테이너 스타일 */
.expanded-card-tags {
  display: flex;
  flex-wrap: wrap; /* 여러 줄로 태그 표시 가능 */
  gap: 10px;
}
</style>
