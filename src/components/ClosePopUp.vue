<script lang="ts" setup>
/**
 * PopupClose 컴포넌트
 *
 * 팝업 창을 닫는 기능을 담당하는 컴포넌트입니다.
 * 요청이 오면 result가 true일 때 팝업을 자동으로 닫습니다.
 */
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePopUpClosed } from '@/stores/usePopUpClosed.ts';

// Vue Router 인스턴스
const route = useRoute();
const popUpClosed = usePopUpClosed();

let closeIntervalId: number | null = null;

// 팝업 닫기 함수
const closePopup = () => {
  closeIntervalId = setInterval(window.close, 300);
};

// URL 파라미터 확인 함수 (Vue Router 사용)
const checkUrlParams = () => {
  const result = route.query.result === 'true';

  let errorMessage = null;

  if (result) {
    const userInfoResult = {
      userName: route.query.userName,
      userUniqueId: route.query.userUniqueId,
    };
    opener.postMessage(JSON.stringify(userInfoResult), '/');
  } else {
    switch (route.query.error) {
      case 'canceledByUser':
        break;
      case 'codeNotFound':
        errorMessage = '디스코드 인증이 정상적으로 처리되지 않았습니다.';
        break;
      case 'tooManyRequests':
        errorMessage =
          '짧은 시간안에 많은 로그인 시도를 하셨습니다.\n잠시 후에 로그인을 진행 해 주세요.';
        break;
      case 'unknown':
        errorMessage = '알 수 없는 에러가 발생하였습니다.\n개발자에게 연락 해 주세요.';
        break;
    }
  }

  Object.assign(popUpClosed, { init: false, isSucceed: result, errorMessage: errorMessage });
};

Object.assign(popUpClosed, { init: true, isPopUp: true });

// 컴포넌트 마운트 시 URL 파라미터 확인
onMounted(() => {
  checkUrlParams();
  closePopup();
});

onUnmounted(() => {
  if (closeIntervalId) {
    clearInterval(closeIntervalId);
  }
});
</script>

<template>
  <div v-if="popUpClosed.isSucceed" class="popup-close">
    <div class="popup-content">
      <div class="loading-spinner"></div>
      <p>로그인 처리 중...</p>
      <p class="sub-text">잠시만 기다려 주세요.</p>
    </div>
  </div>
  <div v-else class="popup-close">
    <div class="popup-content">
      <div class="loading-spinner"></div>
      <p>로그인 취소 처리 중...</p>
      <p class="sub-text">잠시만 기다려 주세요.</p>
    </div>
  </div>
</template>

<style scoped>
.popup-close {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Inter', sans-serif;
}

.popup-content {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #5865f2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.popup-content p {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.sub-text {
  font-size: 14px !important;
  font-weight: 400 !important;
  color: #666 !important;
  margin: 0 !important;
}
</style>
