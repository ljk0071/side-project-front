/**
 * 애플리케이션 메인 엔트리 포인트
 *
 * Vue 애플리케이션을 초기화하고 필요한 플러그인들을 설정합니다.
 * createApp, createPinia, router, VueCookies 등을 통합하여 앱을 구성합니다.
 */

import { createApp } from 'vue'; // Vue 앱 생성 함수 가져오기
import { createPinia } from 'pinia'; // Pinia 상태 관리 스토어 생성 함수 가져오기
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue'; // 루트 컴포넌트 가져오기
import router from './router'; // 라우터 설정 가져오기
import VueCookies from 'vue-cookies'; // 쿠키 관리를 위한 플러그인 가져오기

// Vue 애플리케이션 인스턴스 생성
const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Pinia 상태 관리 스토어 설정
app.use(pinia);
// 라우터 설정
app.use(router);
// 쿠키 플러그인 설정 (만료기간: 1일)
app.use(VueCookies, { expires: '1d' });

// 앱을 DOM에 마운트
app.mount('#app');
