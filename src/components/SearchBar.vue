<script lang="ts" setup>
/**
 * SearchBar 컴포넌트
 *
 * 이 컴포넌트는 파티 검색을 위한 입력 필드를 제공합니다.
 * v-model을 통한 양방향 바인딩을 지원하며, 포커스 상태에 따른 스타일 변화와
 * 외부에서의 포커스 설정을 위한 메소드를 노출합니다.
 */
import {ref, watch} from 'vue';

// 컴포넌트 프롭스 정의
const props = defineProps<{
  /** v-model과 바인딩되는 검색어 값 */
  modelValue: string;
}>();

// 이벤트 정의
const emit = defineEmits<{
  /** v-model 업데이트 이벤트 */
  (e: 'update:modelValue', value: string): void;
  /** 엔터 키 입력 이벤트 */
  (e: 'enter', value: string): void;
}>();

/**
 * 내부 검색어 상태
 */
const searchValue = ref(props.modelValue);

/**
 * props.modelValue 변경 시 내부 상태 동기화
 */
watch(() => props.modelValue, (newValue) => {
  if (searchValue.value !== newValue) {
    searchValue.value = newValue;
  }
});

/**
 * 한국어 완성 문자 여부를 확인하는 함수
 * 자음만 있거나 모음만 있는 경우를 제외하고 완성된 문자인지 확인
 */
const isKoreanCompleteChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  // 한글 완성형 문자 범위 (가-힣): 44032 ~ 55203
  return code >= 44032 && code <= 55203;
};

/**
 * 문자열이 검색 가능한 상태인지 확인
 * 한국어의 경우 완성된 문자가 있거나, 영어/숫자/기타 문자인 경우 true
 */
const isSearchableString = (value: string): boolean => {
  if (!value.trim()) return true; // 빈 문자열은 허용
  
  // 마지막 문자가 한국어인 경우
  const lastChar = value.charAt(value.length - 1);
  const lastCharCode = lastChar.charCodeAt(0);
  
  // 한국어 자음 (ㄱ-ㅎ): 12593 ~ 12622
  // 한국어 모음 (ㅏ-ㅣ): 12623 ~ 12643
  const isKoreanConsonant = lastCharCode >= 12593 && lastCharCode <= 12622;
  const isKoreanVowel = lastCharCode >= 12623 && lastCharCode <= 12643;
  
  // 마지막 문자가 자음이나 모음만 있다면 false (미완성)
  if (isKoreanConsonant || isKoreanVowel) {
    return false;
  }
  
  return true;
};

/** 입력 필드에 대한 참조 */
const inputRef = ref<HTMLInputElement | null>(null);
/** 입력 필드 포커스 상태 */
const isFocused = ref(false);

/**
 * 입력 필드에 포커스를 설정하는 메소드
 * 외부에서 호출할 수 있도록 노출됩니다.
 */
const focus = () => {
  inputRef.value?.focus();
};

/**
 * 입력 필드가 포커스를 받았을 때 상태 업데이트
 */
const handleFocus = () => {
  isFocused.value = true;
};

/**
 * 입력 필드가 포커스를 잃었을 때 상태 업데이트
 */
const handleBlur = () => {
  isFocused.value = false;
};

/**
 * 입력 처리 (한국어 완성 문자 체크)
 */
const handleInput = (target: HTMLInputElement) => {
  const newValue = target.value;
  searchValue.value = newValue;
  
  // 검색 가능한 상태일 때만 emit
  if (isSearchableString(newValue)) {
    emit('update:modelValue', newValue);
  }
};

/**
 * 엔터 키 입력 처리
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // 엔터 키를 누르면 현재 값이 미완성이라도 검색 실행
    emit('update:modelValue', searchValue.value);
    emit('enter', searchValue.value);
  }
};

// 외부에서 접근 가능한 메소드 노출
defineExpose({
  focus,
});
</script>

<template>
  <!-- 검색바 컨테이너 (포커스 상태에 따라 클래스 토글) -->
  <div :class="{ 'search-bar-focused': isFocused }" class="search-bar">
    <!-- 검색 입력 필드 -->
    <input
      ref="inputRef"
      :value="searchValue"
      class="search-input"
      placeholder="파티 검색..."
      type="text"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
      @input="handleInput($event.target as HTMLInputElement)"
    />
  </div>
</template>

<style scoped>
/* 검색바 기본 스타일 */
.search-bar {
  width: 14vw;
  min-width: 200px;
  max-width: 300px;
  height: 40px;
  background-color: #f7f7f7;
  border: 1px solid #cccccc;
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 부드러운 전환 효과 */
  transform-origin: center;
}

/* 검색 입력 필드 스타일 */
.search-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #333333;
  outline: none; /* 포커스 시 기본 윤곽선 제거 */
}

/* 플레이스홀더 텍스트 스타일 */
.search-input::placeholder {
  color: #999999;
}

/* 포커스 상태 애니메이션 정의 */
@keyframes breathe {
  0% {
    box-shadow: 0 0 0 3px rgba(255, 149, 0, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.4);
    transform: scale(1.01);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(255, 149, 0, 0.2);
    transform: scale(1);
  }
}

/* 포커스된 검색바 스타일 */
.search-bar-focused {
  border-color: #ff9500; /* 오렌지색 테두리 */
  animation: breathe 2s infinite ease-in-out; /* 숨쉬는 듯한 애니메이션 적용 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #fffaf0; /* 밝은 배경색으로 변경 */
}

/* 포커스된 입력 필드 스타일 */
.search-input:focus {
  color: #000000; /* 더 진한 텍스트 색상 */
  text-shadow: 0 0 1px rgba(255, 149, 0, 0.1); /* 미세한 그림자 효과 */
  transition: color 0.3s ease;
}

/* 반응형 스타일 - 태블릿 */
@media (max-width: 768px) {
  .search-bar {
    width: 100%; /* 전체 너비로 변경 */
    min-width: 200px; /* 최소 너비 설정 */
    max-width: 300px; /* 최대 너비 제한 */
  }
}

/* 반응형 스타일 - 모바일 */
@media (max-width: 576px) {
  .search-bar {
    height: 36px; /* 모바일에서 조금 더 작게 */
    min-width: 160px; /* 더 작은 화면에서 최소 너비 줄임 */
  }

  .search-input {
    font-size: 14px; /* 작은 화면에서 폰트 크기 줄임 */
  }

  .search-input::placeholder {
    font-size: 14px;
  }
}
</style>
