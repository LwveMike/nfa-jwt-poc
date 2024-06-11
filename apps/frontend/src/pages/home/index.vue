<script lang="ts" setup>
import AccessButtons from './components/AccessButtons.vue'

const routes = ['protected', 'books', 'books/hello', 'random']
</script>

<template>
  <div>
    <h3>Home</h3>
    <AccessButtons
      v-for="route in routes"
      :key="route"
      :route="route"
    />
  </div>
</template>
