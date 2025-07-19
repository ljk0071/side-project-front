<script lang="ts" setup>
/**
 * NotFoundPage 컴포넌트
 *
 * 404 에러 페이지로, 메이플스토리 테마에 맞는 재미있는 디자인을 제공합니다.
 */
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotFound } from '@/stores/useNotFound.ts';

const router = useRouter();
const isAnimated = ref(false);

/**
 * 홈으로 돌아가기
 */
const goHome = () => {
  notFound.is404 = false;
  router.push('/');
};

const notFound = useNotFound();

notFound.is404 = true;

/**
 * 컴포넌트 마운트 시 애니메이션 시작
 */
onMounted(() => {
  setTimeout(() => {
    isAnimated.value = true;
  }, 100);
});
</script>

<template>
  <div class="not-found-page">
    <div :class="{ animated: isAnimated }" class="content-container">
      <!-- 404 숫자 -->
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit portal">🌀</span>
        <span class="digit">4</span>
      </div>

      <!-- 메인 메시지 -->
      <div class="main-message">
        <h1 class="title">페이지를 찾을 수 없습니다!</h1>
        <p class="subtitle">🍄 이 곳은 아직 발견되지 않은 숨겨진 맵인 것 같네요...</p>
      </div>

      <!-- 메이플 캐릭터 느낌의 메시지 -->
      <div class="character-message">
        <div class="speech-bubble">
          <p>💬 "어라? 여기는 어디지?"</p>
          <p>🗺️ 올바른 길을 찾아 파티원들과 함께 모험을 떠나보세요!</p>
        </div>
      </div>

      <!-- 버튼들 -->
      <div class="action-buttons">
        <button class="home-button" @click="goHome">🏠 홈으로 돌아가기</button>
        <button class="search-button" @click="goHome">🔍 파티 찾기</button>
      </div>

      <!-- 장식 요소들 -->
      <div class="decorations">
        <div class="floating-item item-1">🍄</div>
        <div class="floating-item item-2">⭐</div>
        <div class="floating-item item-3">💎</div>
        <div class="floating-item item-4">🍀</div>
        <div class="floating-item item-5">✨</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 전체 스타일 */
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* 배경 패턴 */
.not-found-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: backgroundFloat 20s ease-in-out infinite;
}

@keyframes backgroundFloat {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(1deg);
  }
}

/* 메인 컨테이너 */
.content-container {
  text-align: center;
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 60px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-container.animated {
  transform: translateY(0);
  opacity: 1;
}

/* 404 에러 코드 */
.error-code {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.digit {
  font-size: 120px;
  font-weight: 900;
  color: #ff6b6b;
  text-shadow:
    3px 3px 0px #ff5252,
    6px 6px 10px rgba(255, 107, 107, 0.3);
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

.digit:nth-child(1) {
  animation-delay: 0s;
}

.digit:nth-child(3) {
  animation-delay: 0.4s;
}

.portal {
  font-size: 100px !important;
  animation: portal-spin 3s linear infinite !important;
  filter: hue-rotate(0deg);
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes portal-spin {
  0% {
    transform: rotate(0deg) scale(1);
    filter: hue-rotate(0deg);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    filter: hue-rotate(180deg);
  }
  100% {
    transform: rotate(360deg) scale(1);
    filter: hue-rotate(360deg);
  }
}

/* 메인 메시지 */
.main-message {
  margin-bottom: 30px;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 18px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

/* 캐릭터 메시지 */
.character-message {
  margin: 40px 0;
}

.speech-bubble {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
  padding: 25px 30px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 5px 15px rgba(116, 185, 255, 0.3);
}

.speech-bubble::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid #0984e3;
}

.speech-bubble p {
  margin: 10px 0;
  font-size: 16px;
  line-height: 1.5;
}

/* 액션 버튼들 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.home-button,
.search-button {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  display: inline-block;
}

.home-button {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.search-button {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.search-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
}

/* 장식 요소들 */
.decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-item {
  position: absolute;
  font-size: 24px;
  animation: float 6s ease-in-out infinite;
  opacity: 0.7;
}

.item-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.item-2 {
  top: 25%;
  right: 15%;
  animation-delay: 1s;
}

.item-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.item-4 {
  bottom: 20%;
  right: 10%;
  animation-delay: 3s;
}

.item-5 {
  top: 45%;
  left: 5%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .content-container {
    padding: 40px 30px;
    margin: 20px;
  }

  .digit {
    font-size: 80px;
  }

  .portal {
    font-size: 70px !important;
  }

  .title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .home-button,
  .search-button {
    width: 100%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 30px 20px;
  }

  .digit {
    font-size: 60px;
  }

  .portal {
    font-size: 50px !important;
  }

  .title {
    font-size: 24px;
  }

  .error-code {
    gap: 10px;
    margin-bottom: 30px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .content-container {
    background: rgba(42, 42, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .title {
    color: #ecf0f1;
  }

  .subtitle {
    color: #bdc3c7;
  }
}
</style>
