<script lang="ts" setup>
/**
 * ApiExample.vue - API 스토어 사용 예제 컴포넌트
 *
 * 이 컴포넌트는 Pinia를 사용하여 kyWithCustom을 호출하는 방법을 보여줍니다.
 * useApiStore를 통해 HTTP 요청을 수행하고 결과를 표시합니다.
 */
import { useApiStore } from '@/stores/useKyProperties.ts';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

// API 스토어 초기화
const apiStore = useApiStore();

// 스토어의 상태 참조 (반응형)
const { loading, error } = storeToRefs(apiStore);

// 데이터 저장을 위한 반응형 변수
const responseData = ref<unknown>(null);
const endpoint = ref('users');
const requestData = ref<Record<string, unknown>>({});
const selectedMethod = ref<'get' | 'post' | 'put' | 'delete'>('get');

// API 요청 수행 함수
async function makeRequest() {
  try {
    responseData.value = null;

    switch (selectedMethod.value) {
      case 'get':
        responseData.value = await apiStore.get(endpoint.value);
        break;
      case 'post':
        responseData.value = await apiStore.post(endpoint.value, requestData.value);
        break;
      case 'put':
        responseData.value = await apiStore.put(endpoint.value, requestData.value);
        break;
      case 'delete':
        responseData.value = await apiStore.delete(endpoint.value, requestData.value);
        break;
    }
  } catch (err) {
    console.error('API 요청 실패:', err);
  }
}

// 컴포넌트 마운트 시 기본 데이터 로드
onMounted(() => {
  // 예제 목적으로 기본 요청 수행
  makeRequest();
});
</script>

<template>
  <div class="api-example">
    <h2>API 요청 예제</h2>

    <div class="request-form">
      <div class="form-group">
        <label for="method">HTTP 메소드:</label>
        <select id="method" v-model="selectedMethod">
          <option value="get">GET</option>
          <option value="post">POST</option>
          <option value="put">PUT</option>
          <option value="delete">DELETE</option>
        </select>
      </div>

      <div class="form-group">
        <label for="endpoint">엔드포인트:</label>
        <input id="endpoint" v-model="endpoint" placeholder="예: users" type="text" />
      </div>

      <div v-if="selectedMethod !== 'get'" class="form-group">
        <label for="request-data">요청 데이터 (JSON):</label>
        <textarea
          id="request-data"
          v-model="requestData"
          placeholder='{ "name": "홍길동", "email": "hong@example.com" }'
          rows="4"
        ></textarea>
      </div>

      <button :disabled="loading" @click="makeRequest">
        {{ loading ? '요청 중...' : '요청 보내기' }}
      </button>
    </div>

    <div class="response-section">
      <h3>응답 결과</h3>

      <div v-if="loading" class="loading">데이터 로딩 중...</div>

      <div v-else-if="error" class="error">오류 발생: {{ error.message }}</div>

      <div v-else-if="responseData" class="response-data">
        <pre>{{ JSON.stringify(responseData, null, 2) }}</pre>
      </div>

      <div v-else class="no-data">아직 데이터가 없습니다. 요청을 보내보세요.</div>
    </div>
  </div>
</template>

<style scoped>
.api-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.request-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.response-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.loading,
.error,
.no-data {
  padding: 15px;
  text-align: center;
}

.error {
  color: #d9534f;
}

.response-data pre {
  background-color: #eee;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
