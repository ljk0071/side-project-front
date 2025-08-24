import ky, { type Options } from 'ky'
import type { JsonValue } from 'type-fest'
import type { HttpMethod } from '@/utils/ky/type/httpMethod'
import { useKyProperties } from '@/stores/useKyProperties.ts'
import { customError, customSuccess, customWarning } from '@/composables/useCustomModal.ts'
import { useDiscordAuth } from '@/stores/useDiscordAuth.ts'

async function supportsDuplex(): Promise<boolean> {
  try {
    // 1. 필수 API 존재 여부 확인
    if (
      typeof Request === 'undefined' ||
      typeof ReadableStream === 'undefined' ||
      typeof Response === 'undefined'
    ) {
      return false
    }

    // 2. 실제 duplex를 사용하는 Request 생성
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode('test'))
        controller.close()
      }
    })

    const request = new Request('data:,', {
      method: 'POST',
      duplex: 'half',
      body: stream
    } as RequestInit & { duplex: 'half' })

    // 3. 실제로 duplex가 적용되었는지 여러 방법으로 확인

    // 방법 1: request 객체에 duplex 속성이 있는지 확인
    const requestAny = request as unknown as { duplex: string }
    const hasDuplexProperty = 'duplex' in requestAny

    // 방법 2: 실제 fetch를 시도해보고 스트림이 작동하는지 확인
    try {
      const testResponse = await fetch(request)
      // data: URL은 항상 성공하므로, 여기까지 왔다면 duplex 지원
      return true
    } catch (fetchError) {
      // fetch 실패시 duplex 관련 에러인지 확인
      if (fetchError instanceof TypeError && fetchError.message.includes('duplex')) {
        return false
      }
    }

    // 방법 3: Response.body가 ReadableStream인지 확인
    const response = new Response('test')
    const supportsStreaming = response.body instanceof ReadableStream

    return hasDuplexProperty && supportsStreaming
  } catch (error) {
    return false
  }
}

// 인스턴스 캐싱
let kyInstance: ReturnType<typeof ky.create> | null = null

function createKyWithBasicOptions() {
  const kyProperties = useKyProperties()
  kyInstance = ky.create({
    // prefixUrl: `http://localhost/`,
    prefixUrl: `https://maple-party.com/`,
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [413],
      backoffLimit: 3_000
    },
    headers: {
      'X-CSRF-TOKEN': kyProperties.csrfToken ?? ''
    },
    credentials: 'include',
    hooks: {
      beforeError: [
        async (error) => {
          // 에러 응답에서 JSON 메시지 추출
          try {
            // 1. response가 존재하는지 확인
            if (!error.response) {
              await customError('네트워크 오류가 발생했습니다.')
              return error
            }

            // 2. status 확인
            const status = error.response.status
            if (status % 100 === 5) {
              await customError('서버에서 예상치 못한 응답을 받았습니다.')
              return error
            }

            // 3. body가 있는지 확인
            if (!error.response.body) {
              await customError('서버 응답이 비어있습니다.')
              return error
            }

            // 4. JSON 파싱 시도
            const errorData = (await error.response.json()) as { message?: string }

            if (errorData?.message) {
              await customError(errorData.message)
            } else {
              await customError('알 수 없는 오류가 발생했습니다.')
            }
          } catch (parseError) {
            console.error('에러 응답 파싱 실패:', parseError)
            await customError('서버 응답을 처리하는 중 오류가 발생했습니다.')
          }

          // 다른 에러는 그대로 throw
          return error
        }
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            if (response.headers.get('RTR') === 'Y') {
              const result = await kyWithCustom(
                'post',
                'api/auth/refresh',
                {},
                {
                  headers: {
                    'X-CSRF-TOKEN': kyProperties.csrfToken ?? '',
                    'REFRESH-TOKEN': kyProperties.refreshToken ?? ''
                  }
                }
              ).json<{
                csrfToken: string;
                refreshToken: string;
              }>()

              kyProperties.csrfToken = result.csrfToken
              kyProperties.refreshToken = result.refreshToken

              return kyWithCustom(
                request.method,
                // request.url.replace('http://localhost/', ''),
                request.url.replace('https://maple-party.com/', ''),
                await request.json(),
                options
              )
            } else {
              await customWarning('로그인 후 진행 해 주세요.', '로그인 필요')
              useDiscordAuth().openDiscordLogin()
              return
            }
          }

          try {
            if (response.status >= 200 && response.status < 300) {
              const contentType = response.headers.get('content-type')
              if (contentType?.includes('application/json')) {
                const clonedResponse = response.clone()
                const responseData = (await clonedResponse.json()) as { message?: string }
                if (responseData?.message) {
                  customSuccess(responseData.message)
                }
              }
            }
          } catch (parseError) {
            console.error('성공 응답 파싱 실패:', parseError)
          }

          return response
        }
      ]
    }
  })

  supportsDuplex().then((result) => {
    if (result) {
      kyInstance = kyInstance!.extend({
        onDownloadProgress: (progress, _chunk) => {
          console.log(
            `${progress.percent * 100}% - ${progress.transferredBytes} of ${progress.totalBytes} bytes`
          )
        },
        onUploadProgress: (progress, _chunk) => {
          console.log(
            `${progress.percent * 100}% - ${progress.transferredBytes} of ${progress.totalBytes} bytes`
          )
        }
      })
    }
  })

  return kyInstance
}

const kyWithCustom = (
  method: HttpMethod | string,
  url: string,
  data: JsonValue = {},
  options: Options = {}
) => {
  let customOptions = options

  if (data !== null && Object.keys(data).length > 0) {
    if (method === 'get' || method === 'delete') {
      customOptions = { ...options, searchParams: data }
    } else {
      customOptions = { ...options, json: data }
    }
  }

  return createKyWithBasicOptions()(url, {
    method: method,
    ...customOptions
  })
}

export { kyWithCustom }
