import ky, { type Options } from 'ky';
import type { JsonValue } from 'type-fest';
import type { HttpMethod } from '@/utils/ky/type/httpMethod';
import { useKyProperties } from '@/stores/useKyProperties.ts';

async function supportsDuplex(): Promise<boolean> {
  try {
    // 1. 필수 API 존재 여부 확인
    if (
      typeof Request === 'undefined' ||
      typeof ReadableStream === 'undefined' ||
      typeof Response === 'undefined'
    ) {
      return false;
    }

    // 2. 실제 duplex를 사용하는 Request 생성
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('test'));
        controller.close();
      },
    });

    const request = new Request('data:,', {
      method: 'POST',
      duplex: 'half',
      body: stream,
    } as RequestInit & { duplex: 'half' });

    // 3. 실제로 duplex가 적용되었는지 여러 방법으로 확인

    // 방법 1: request 객체에 duplex 속성이 있는지 확인
    const requestAny = request as any;
    const hasDuplexProperty = 'duplex' in requestAny;

    // 방법 2: 실제 fetch를 시도해보고 스트림이 작동하는지 확인
    try {
      const testResponse = await fetch(request);
      // data: URL은 항상 성공하므로, 여기까지 왔다면 duplex 지원
      return true;
    } catch (fetchError) {
      // fetch 실패시 duplex 관련 에러인지 확인
      if (fetchError instanceof TypeError && fetchError.message.includes('duplex')) {
        return false;
      }
    }

    // 방법 3: Response.body가 ReadableStream인지 확인
    const response = new Response('test');
    const supportsStreaming = response.body instanceof ReadableStream;

    return hasDuplexProperty && supportsStreaming;
  } catch (error) {
    return false;
  }
}

// 인스턴스 캐싱
let kyInstance: ReturnType<typeof ky.create> | null = null;

function createKyWithBasicOptions() {
  const kyProperties = useKyProperties();
  kyInstance = ky.create({
    headers: {
      Authorization: 'adkjhdfsjkhfsjdksjdkfhjks',
    },
    prefixUrl: 'http://localhost:8080/',
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [413],
      backoffLimit: 3_000,
    },
    credentials: 'include',
    hooks: {
      beforeError: [
        async (error) => {
          if (error.response?.status === 401) {
            const result = await kyWithCustom(
              'post',
              'api/auth/refresh',
              {},
              {
                headers: {
                  'X-CSRF-TOKEN': kyProperties.csrfToken,
                  'REFRESH-TOKEN': kyProperties.refreshToken,
                },
              },
            ).json<{
              csrfToken: string;
              refreshToken: string;
            }>();

            kyProperties.csrfToken = result.csrfToken;
            kyProperties.refreshToken = result.refreshToken;

            return;
          }

          // 다른 에러는 그대로 throw
          return error;
        },
      ],
    },
  });

  supportsDuplex().then((result) => {
    if (result) {
      kyInstance = kyInstance.extend({
        onDownloadProgress: (progress, chunk) => {
          console.log(
            `${progress.percent * 100}% - ${progress.transferredBytes} of ${progress.totalBytes} bytes`,
          );
        },
        onUploadProgress: (progress, chunk) => {
          console.log(
            `${progress.percent * 100}% - ${progress.transferredBytes} of ${progress.totalBytes} bytes`,
          );
        },
      });
    }
  });

  return kyInstance;
}

// Getter 함수 - 인스턴스가 없을 때만 생성
const getKyWithBasicOptions = () => {
  if (!kyInstance) {
    kyInstance = createKyWithBasicOptions();
  }

  return kyInstance;
};

const kyWithCustom = (
  method: HttpMethod,
  url: string,
  data: JsonValue = {},
  options: Options = {},
) => {
  let customOptions = options;

  if (data !== null && Object.keys(data).length > 0) {
    customOptions = { ...options, json: data };
  }

  return getKyWithBasicOptions()(url, {
    method: method,
    ...customOptions,
  });
};

export { kyWithCustom };
