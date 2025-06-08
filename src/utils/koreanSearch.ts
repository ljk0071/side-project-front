/**
 * koreanSearch.ts - 한글 검색 유틸리티
 *
 * 이 유틸리티는 한글 초성 검색 기능을 제공합니다.
 * 주요 기능:
 * 1. 한글 텍스트에서 초성만 추출
 * 2. 초성 기반 검색 매칭 확인
 * 3. 일반 문자열 포함 검색과 초성 검색을 결합한 향상된 검색
 */

// 한글 유니코드 관련 상수
const HANGUL_BASE = 0xac00 // 가
const HANGUL_END = 0xd7a3 // 힣
// const CHOSEONG_BASE = 0x1100; // ㄱ
// const JUNGSEONG_BASE = 0x1161; // ㅏ
// const JONGSEONG_BASE = 0x11a7; // ㄱ (종성)
const JONGSEONG_COUNT = 28 // 종성 개수 (없음 포함)
const JUNGSEONG_COUNT = 21 // 중성 개수
// const CHOSEONG_COUNT = 19; // 초성 개수

// 한글 초성 목록 (순서 중요)
const CHOSEONG_LIST = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

/**
 * 한글 텍스트에서 초성만 추출하는 함수
 *
 * @param text - 초성을 추출할 한글 텍스트
 * @returns 추출된 초성 문자열 (한글이 아닌 문자는 그대로 유지)
 */
export function extractChoseong(text: string): string {
  let result = ''

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)

    // 한글 문자인지 확인 ('가'부터 '힣'까지)
    if (charCode >= HANGUL_BASE && charCode <= HANGUL_END) {
      // 초성 인덱스 계산
      // (문자 코드 - 한글 시작 코드) / (중성 개수 * 종성 개수)
      const choseongIndex = Math.floor(
        (charCode - HANGUL_BASE) / (JUNGSEONG_COUNT * JONGSEONG_COUNT),
      )
      result += CHOSEONG_LIST[choseongIndex]
    } else {
      // 한글이 아닌 문자는 그대로 유지
      result += text[i]
    }
  }

  return result
}

/**
 * 초성 기반으로 문자열이 검색어와 일치하는지 확인하는 함수
 *
 * @param text - 검색 대상 문자열
 * @param query - 검색어
 * @returns 초성 기반으로 일치하는지 여부
 */
export function matchesByChoseong(text: string, query: string): boolean {
  // 검색어가 비어있으면 항상 일치로 간주
  if (!query) return true

  // 텍스트와 검색어의 초성 추출 (소문자로 변환하여 대소문자 구분 없애기)
  const textChoseong = extractChoseong(text.toLowerCase())
  const queryChoseong = extractChoseong(query.toLowerCase())

  // 텍스트 초성에 검색어 초성이 포함되는지 확인
  return textChoseong.includes(queryChoseong)
}

/**
 * 일반 문자열 검색과 초성 검색을 결합한 향상된 검색 함수
 *
 * @param text - 검색 대상 문자열
 * @param query - 검색어
 * @returns 일반 검색 또는 초성 검색으로 일치하는지 여부
 */
export function koreanSearch(text: string, query: string): boolean {
  // 검색어가 비어있으면 항상 일치로 간주
  if (!query) return true

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  // 1. 일반 문자열 포함 여부 확인
  if (lowerText.includes(lowerQuery)) {
    return true
  }

  // 2. 초성 매칭 확인
  return matchesByChoseong(text, query)
}
