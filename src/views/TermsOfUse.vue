<script setup lang="ts"></script>

<template>
  <div class="terms-overlay">
    <div class="terms-modal">
      <div class="terms-header">
        <h2>이용약관</h2>
        <router-link to="/" class="close-button">
          <span class="close-icon">×</span>
        </router-link>
      </div>

      <div class="terms-content">
        <pre>
  1. 이용약관 페이지
  메이플 파티 이용약관

  제1조 (목적)
  본 약관은 메이플 파티(이하 '회사')가 제공하는 메이플 파티 채팅 서비스(이하 '서비스')의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
  규정함을 목적으로 합니다.

  제2조 (용어의 정의)

  서비스: 회사가 제공하는 실시간 채팅 기능 및 관련 제반 서비스를 의미합니다.
  회원: 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
  게시물: 회원이 서비스를 이용하면서 게시한 부호, 문자, 음성, 영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.

  제3조 (약관의 명시와 개정)

  회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 또는 연결 화면을 통해 게시합니다.[1]
  회사는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서
  본 약관을 개정할 수 있습니다.[1]
  약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.[1] 다만, 회원에게 불리하게 약관 내용을
  변경하는 경우에는 최소한 30일 이상의 사전 유예기간을 두고 공지합니다.[1]
  회원이 개정약관에 동의하지 않는 경우 회원은 이용계약을 해지(회원탈퇴)할 수 있습니다.

  제4조 (서비스의 제공 및 변경)

  회사는 다음과 같은 업무를 수행합니다.
  실시간 채팅 서비스 제공
  기타 회사가 정하는 부가 서비스
  회사는 기술적 사양의 변경이나 운영상의 필요에 의해 제공하는 서비스의 내용을 변경할 수 있습니다. 이 경우에는 변경된 서비스의 내용 및 제공일자를 명시하여 즉시
  공지합니다.[2]

  제5조 (회원의 의무 및 게시물 관리)

  회원은 다음 각 호에 해당하는 행위를 하여서는 안 됩니다.[3]
  타인의 정보를 도용하는 행위
  회사 또는 제3자의 저작권 등 지적재산권을 침해하는 행위
  회사 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위
  음란, 폭력적인 메시지, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위[3]
  청소년보호법에서 규정하는 청소년유해매체물을 게시하는 행위
  관련 법령에 따라 유통이 금지되는 불법 정보를 게시하는 행위[3]
  회사는 회원의 게시물이 위 각 호에 해당한다고 판단되는 경우 사전통지 없이 삭제하거나 이동 또는 등록 거부를 할 수 있으며, 해당 회원의 서비스 이용을 제한하거나 정지,
  이용계약을 해지할 수 있습니다.[3]

  제6조 (손해배상 및 면책)

  회사는 서비스 이용과 관련하여 회사의 고의 또는 과실로 인해 회원에게 손해가 발생한 경우 관련 법령에 따라 책임을 집니다.
  천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.[4]
  회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.

  제7조 (분쟁조정 및 관할법원)

  서비스 이용과 관련하여 회사와 회원 간에 발생한 분쟁에 대해서는 상호 협의하여 해결함을 원칙으로 합니다.[1]
  협의를 통해서도 분쟁이 해결되지 않을 경우, 소송은 민사소송법상의 관할법원에 제기합니다.[1]

  제8조 (운영자 정보)

  운영 주체: 메이플 파티
  연락처 (이메일): sakur35a@icloud.com
  주소: [연락처 이메일로 갈음]

  부칙

  본 약관은 2025년 8월 18일부터 시행됩니다.
        </pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 전체 화면 오버레이 */
.terms-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* 모달 컨테이너 */
.terms-modal {
  background-color: var(--card-bg-color);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

/* 헤더 */
.terms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
  border-radius: 16px 16px 0 0;
}

.terms-header h2 {
  color: var(--text-color);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--close-button-bg);
  border: 1px solid var(--close-button-border);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-button:hover {
  background-color: var(--close-button-hover-bg);
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.close-button:active {
  transform: scale(0.95);
}

.close-icon {
  color: var(--close-button-color);
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  transition: color 0.3s ease;
}

.close-button:hover .close-icon {
  color: #ff4757;
}

/* 콘텐츠 영역 */
.terms-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

pre {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: var(--card-bg-color);
  padding: 30px;
  margin: 0;
  color: var(--text-color);
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* 반응형 */
@media (max-width: 768px) {
  .terms-overlay {
    padding: 10px;
  }

  .terms-modal {
    max-height: 95vh;
    border-radius: 12px;
  }

  .terms-header {
    padding: 20px;
    border-radius: 12px 12px 0 0;
  }

  .terms-header h2 {
    font-size: 20px;
  }

  .close-button {
    width: 32px;
    height: 32px;
  }

  .close-icon {
    font-size: 18px;
  }

  pre {
    padding: 20px;
    font-size: 13px;
  }
}

/* 스크롤바 스타일링 */
.terms-content::-webkit-scrollbar {
  width: 8px;
}

.terms-content::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 4px;
}

.terms-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.terms-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}
</style>
