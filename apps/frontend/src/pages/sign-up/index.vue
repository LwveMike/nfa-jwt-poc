<template>
  <div>
    <h3>Sign up</h3>
    <div>
    <div>
      <label for="up-username">Username</label>
      <input type="text" id="up-username" v-model="signUpForm.username" />
    </div>
    <div>
      <label for="up-password">Password</label>
      <input type="password" id="up-password" v-model="signUpForm.password" />
    </div>
    <button
      @click="handleSignUp"
    >
      Sign up
    </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useRouter } from 'vue-router';

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
