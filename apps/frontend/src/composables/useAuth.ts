import { ComputedRef, computed, ref } from "vue";

type AuthenticationStatus = 'authenticated' | 'unauthenenticated' | 'error'

type UseAuthReturn = {
  isAuthenticated: ComputedRef<boolean>
  signIn: (username: string, password: string) => void
  signUp: (username: string, password: string) => void
  signOut: () => void
}

function createAuthStore () {
  const status = ref<AuthenticationStatus>('unauthenenticated')

  const isAuthenticated = computed(() => status.value === 'authenticated')

  async function signIn (username: string, password: string) {
    const response = await fetch('/api/sign-in',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

    if (response.status === 200) {
      status.value = 'authenticated'
    }
  }

  async function signUp (username: string, password: string) {
    const response = await fetch('/api/sign-up',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

    if (response.status === 200) {
      status.value = 'authenticated'
    }
  }

  async function signOut () {
    status.value = 'unauthenenticated'
  }

  return function (): UseAuthReturn {
    return {
      isAuthenticated,
      signIn,
      signUp,
      signOut
    }
  }
}

export const useAuth = createAuthStore()
