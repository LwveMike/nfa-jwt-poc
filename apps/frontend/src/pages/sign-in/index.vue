<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()

const { signIn } = useAuth()

const signInForm = reactive({
  username: '',
  password: '',
})

async function handleSignIn() {
  await signIn(signInForm.username, signInForm.password)

  router.push('/')
}
</script>

<template>
  <div>
    <h3>Sign in</h3>
    <div>
      <div>
        <label for="in-username">Username</label>
        <input id="in-username" v-model="signInForm.username" type="text">
      </div>
      <div>
        <label for="in-password">Password</label>
        <input id="in-password" v-model="signInForm.password" type="password">
      </div>
      <button
        @click="handleSignIn"
      >
        Sign in
      </button>
    </div>
  </div>
</template>
