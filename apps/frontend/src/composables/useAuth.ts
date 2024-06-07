import { useCookies } from '@vueuse/integrations/useCookies'
import { jwtDecode } from 'jwt-decode'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

interface User {
  id: number
  username: string
}

interface UseAuthReturn {
  isAuthenticated: ComputedRef<boolean>
  signIn: (username: string, password: string) => void
  signUp: (username: string, password: string) => void
  signOut: () => void
  user: ComputedRef<User | null>
}

function createAuthStore() {
  const cookies = useCookies()

  const user = computed<User | null>(() => {
    const cookie = cookies.get('nfa-access-token')

    if (cookie === undefined) {
      return null
    }

    const decodedJwt = jwtDecode(cookie)

    if (typeof decodedJwt === 'string') {
      console.error('Handle this if this happens')
      return null
    }

    return decodedJwt as { id: number, username: string }
  })

  const isAuthenticated = computed(() => user.value !== null)

  async function signIn(username: string, password: string) {
    await fetch('/api/sign-in', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async function signUp(username: string, password: string) {
    await fetch('/api/sign-up', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async function signOut() {
    if (isAuthenticated.value === false) {
      return
    }

    cookies.remove('nfa-access-token')
  }

  return function (): UseAuthReturn {
    return {
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      user,
    }
  }
}

export const useAuth = createAuthStore()
