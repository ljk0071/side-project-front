<script setup lang="ts">
import { useTerms } from '@/stores/useTerms.ts'

const terms = useTerms()
</script>

<template>
  <div class="terms-overlay">
    <div class="terms-modal">
      <div class="terms-header">
        <h2>채팅 이용 안내</h2>
        <button @click="terms.readChatTerms()" class="close-button">
          <span class="close-icon">×</span>
        </button>
      </div>

      <div class="terms-content">
        <div class="terms-text">
          <h3>메이플 파티 채팅 이용 안내</h3>
          <p>메이플 파티는 모두가 즐겁고 안전하게 소통하는 공간을 지향합니다.</p>

          <div class="rules-section">
            <h4>🚫 금지사항</h4>
            <ul>
              <li>욕설, 비방, 차별적 발언 등 타인에게 불쾌감을 주는 행위</li>
              <li>음란물, 도박 등 불법 정보를 공유하거나 홍보하는 행위</li>
              <li>개인정보(이름, 연락처, 주소 등)를 유출하거나 타인의 개인정보를 요구하는 행위</li>
              <li>청소년에게 유해한 내용의 대화나 게시물</li>
            </ul>
          </div>

          <div class="warning-section">
            <h4>⚠️ 주의사항</h4>
            <p>위 규칙을 위반할 경우, 경고 없이 게시물 삭제 및 서비스 이용이 영구적으로 제한될 수 있으며, 관련 법령에 따라 처벌받을 수 있습니다.</p>
          </div>

          <!--          <div class="report-section">-->
          <!--            <h4>📢 신고 안내</h4>-->
          <!--            <p>불법·유해 정보를 발견하시면 즉시 <strong>[신고센터]</strong>를 통해 신고해주시기 바랍니다.</p>-->
          <!--          </div>-->

          <div class="reference-section">
            <p>자세한 내용은
              <router-link to="/terms/use">이용약관</router-link>
              및
              <router-link to="/terms/privacy">개인정보처리방침</router-link>
              을 확인해주세요.
            </p>
          </div>
        </div>
      </div>

      <div class="button-container">
        <button @click.stop="terms.readChatTerms()" class="confirm-button">
          확인
        </button>
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
  max-width: 700px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--close-button-bg);
  border: 1px solid var(--close-button-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.close-button:hover {
  background-color: var(--close-button-hover-bg);
  transform: scale(1.1);
}

.close-icon {
  color: var(--close-button-color);
  font-size: 18px;
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
  padding: 30px;
}

.terms-text h3 {
  color: var(--logo-color);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
}

.terms-text p {
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 15px;
}

.rules-section,
.warning-section,
.report-section,
.reference-section {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.rules-section h4,
.warning-section h4,
.report-section h4 {
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.rules-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-color);
}

.rules-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.warning-section {
  background-color: rgba(255, 71, 87, 0.1);
  border-color: rgba(255, 71, 87, 0.3);
}

.report-section {
  background-color: rgba(0, 123, 255, 0.1);
  border-color: rgba(0, 123, 255, 0.3);
}

.reference-section {
  text-align: center;
  background-color: var(--tag1-bg-color);
  border-color: var(--tag1-text-color);
}

.reference-section a {
  color: var(--logo-color);
  text-decoration: none;
  font-weight: 600;
}

.reference-section a:hover {
  text-decoration: underline;
}

/* 버튼 영역 */
.button-container {
  padding: 20px 30px 30px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
  border-radius: 0 0 16px 16px;
}

.confirm-button {
  background-color: var(--logo-color);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
}

.confirm-button:hover {
  background-color: #ff8800;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 165, 0, 0.5);
}

.confirm-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
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

  .terms-content {
    padding: 20px;
  }

  .terms-text h3 {
    font-size: 18px;
  }

  .rules-section,
  .warning-section,
  .report-section,
  .reference-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .button-container {
    padding: 16px 20px 20px;
    border-radius: 0 0 12px 12px;
  }

  .confirm-button {
    padding: 12px 24px;
    font-size: 14px;
    min-width: 160px;
  }
}

/* 스크롤바 스타일링 */
.terms-content::-webkit-scrollbar {
  width: 6px;
}

.terms-content::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 3px;
}

.terms-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.terms-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}
</style>
