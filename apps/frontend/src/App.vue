<script setup lang="ts">
import { useCookies } from '@vueuse/integrations/useCookies'
import { computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from './composables/useAuth'

const cookies = useCookies()

const token = computed(() => { return cookies.get('nfa-access-token') })

const decodedToken = computed(() => {
  if (token.value) {
    return jwtDecode(token.value)
  }
})

const { signOut, isAuthenticated, user } = useAuth()
</script>

<template>
  <div class="container">
    <p
      v-if="isAuthenticated === true"
    >
      Hello, {{ user!.username }}
    </p>
    <nav>
      <RouterLink to="/">
        home
      </RouterLink>
      <template
        v-if="isAuthenticated === false"
      >
        <RouterLink to="/sign-in">
          sign-in
        </RouterLink>
        <RouterLink to="/sign-up">
          sign-up
        </RouterLink>
      </template>
      <button
        v-if="isAuthenticated"
        @click="signOut"
      >
        sign-out
      </button>
    </nav>
  </div>
  <RouterView />
  <div>
    <p>Cookie: [nfa-access-token]</p>
    <p>{{ token }}</p>
    <p>Decoded: [nfa-access-token]</p>
    <pre>{{ JSON.stringify(decodedToken, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;

  nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
}
</style>
