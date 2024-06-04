<script setup lang="ts">
import { reactive } from 'vue';

const signUpForm = reactive({
  username: '',
  password: '',
})

async function signUp() {
  await fetch('/api/sign-up',
    {
      method: 'POST',
      body: JSON.stringify(signUpForm),
      headers: {
        'Content-Type': 'application/json',
      },
    })

  signUpForm.username = ''
  signUpForm.password = ''
}

const signInForm = reactive({
  username: '',
  password: '',
})

async function signIn() {
  await fetch('/api/sign-in',
    {
      method: 'POST',
      body: JSON.stringify(signInForm),
      headers: {
        'Content-Type': 'application/json',
      },
    })

  signInForm.username = ''
  signInForm.password = ''
}
</script>

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
      @click="signUp"
    >
      Sign up
    </button>
    </div>
  </div>
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
      @click="signIn"
    >
      Sign in
    </button>
    </div>
  </div>

</template>
