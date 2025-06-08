<template>
  <section class="app">
    <RouterView />
  </section>
</template>

<style>
/**
 * 글로벌 스타일 정의
 *
 * 이 파일에서는 앱 전체에서 사용되는 CSS 변수와 기본 스타일을 정의합니다.
 * 라이트 모드와 다크 모드에 대한 테마 색상이 모두 포함되어 있습니다.
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
  --tag2-text-color: #339966;

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
  min-height: 100vh; /* 최소 높이를 뷰포트 높이로 설정 */
  max-width: 1440px; /* 최대 너비 제한 */
  margin: 0 auto; /* 가운데 정렬 */
}
</style>
