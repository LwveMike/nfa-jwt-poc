<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { signUp } = useAuth()

const signUpForm = reactive({
  username: '',
  password: '',
})

async function handleSignUp() {
  await signUp(signUpForm.username, signUpForm.password)

  router.push('/')
}
</script>

<template>
  <div>
    <h3>Sign up</h3>
    <div>
      <div>
        <label for="up-username">Username</label>
        <input id="up-username" v-model="signUpForm.username" type="text">
      </div>
      <div>
        <label for="up-password">Password</label>
        <input id="up-password" v-model="signUpForm.password" type="password">
      </div>
      <button
        @click="handleSignUp"
      >
        Sign up
      </button>
    </div>
  </div>
</template>
