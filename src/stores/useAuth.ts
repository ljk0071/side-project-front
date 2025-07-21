import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { kyWithCustom } from '@/utils/ky/kyWithCustom.ts';
import { useKyProperties } from './useKyProperties.ts';
import { openDiscordLogin } from '@/utils/discordAuth.ts';
import { customConfirm } from '@/composables/useCustomModal.ts';

export interface UserInfo {
  name: string | null;
  uniqueId: number | null;
}

export const useAuth = defineStore(
  'auth',
  () => {
    const kyProperties = useKyProperties();

    const userInfo = ref<UserInfo>({
      name: null,
      uniqueId: null,
    });

    const isLoggedIn = ref(false);
    const loginError = ref<string | null>('');
    const isLoading = ref(false);

    const isAuthenticated = computed(() => isLoggedIn.value && userInfo.value.uniqueId !== null);

    const login = async () => {
      try {
        isLoading.value = true;
        loginError.value = '';

        const result = await kyWithCustom('post', 'api/sign/in').json<{
          csrfToken: string;
          refreshToken: string;
          userUniqueId: number;
          userName: string;
        }>();

        kyProperties.csrfToken = result.csrfToken;
        kyProperties.refreshToken = result.refreshToken;

        updateUserInfo(result);

        isLoggedIn.value = true;
        loginError.value = null;

        return true;
      } catch (error) {
        loginError.value = '로그인에 실패했습니다. ID와 비밀번호를 확인해주세요.';
        console.error('Login error:', error);
        return false;
      } finally {
        isLoading.value = false;
      }
    };

    const updateUserInfo = (result: { userName: string; userUniqueId: number }) => {
      userInfo.value = {
        name: result.userName,
        uniqueId: result.userUniqueId,
      };
    };

    const logout = async () => {
      await kyWithCustom('post', 'api/sign/out');
      userInfo.value = {
        name: null,
        uniqueId: null,
      };
      isLoggedIn.value = false;
      loginError.value = null;
      kyProperties.csrfToken = null;
      kyProperties.refreshToken = null;
    };

    const clearError = () => {
      loginError.value = '';
    };

    const checkSignIn = async () => {
      if (!isAuthenticated.value) {
        const confirmed = await customConfirm({
          title: '로그인 필요',
          message: '디코로 3초면 끝남.\n지금 바로 등록 ㄱㄱ',
          confirmText: '네',
          cancelText: '아니요',
          iconType: 'info',
        });

        if (confirmed) {
          openDiscordLogin();
        }

        return false;
      }

      return true;
    };

    return {
      userInfo,
      isLoggedIn,
      loginError,
      isLoading,
      isAuthenticated,
      login,
      logout,
      clearError,
      updateUserInfo,
      checkSignIn,
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['userInfo', 'isLoggedIn'],
    },
  },
);
