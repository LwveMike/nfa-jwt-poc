<template>
  <div>
    <h3>Sign in</h3>
    <div>
    <div>
      <label for="in-username">Username</label>
      <input type="text" id="in-username" v-model="signInForm.username" />
    </div>
    <div>
      <label for="in-password">Password</label>
      <input type="password" id="in-password" v-model="signInForm.password" />
    </div>
    <button
      @click="handleSignIn"
    >
      Sign in
    </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useRouter } from 'vue-router';

const router = useRouter()

const { signIn} = useAuth()

const signInForm = reactive({
  username: '',
  password: '',
})

async function handleSignIn() {
  await signIn(signInForm.username, signInForm.password)

  router.push('/')
}
</script>
