import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDiscordAuth = defineStore(
  'discordAuth',
  () => {
    const isClicked = ref<boolean>(false)
    const openDiscordLogin = () => {
      const popupOptions =
        'width=425, height=800, resizable=0, scrollbars=no, status=0, titlebar=0, toolbar=0, left=435, top=250'

      window.open(
        'https://discord.com/oauth2/authorize?client_id=1201514665218420766&response_type=code&redirect_uri=https%3A%2F%2Fmaple-party.com%2Fv1%2Fdiscord%2Fredirect&scope=identify+email&state=apdlvmfvkxl',
        // 'https://discord.com/oauth2/authorize?client_id=1201514665218420766&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fv1%2Fdiscord%2Fredirect&scope=identify+email&state=apdlvmfvkxl',
        '_blank',
        popupOptions
      )
    }

    const openDiscordLoginWithDoubleClickValidation = () => {
      if (!isClicked.value) {
        isClicked.value = true
        openDiscordLogin()
        setTimeout(() => {
          isClicked.value = false
        }, 2000)
      }
    }

    return { isClicked, openDiscordLogin, openDiscordLoginWithDoubleClickValidation }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['isClicked']
    }
  }
)
