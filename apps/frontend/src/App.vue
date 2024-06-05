<script setup lang="ts">
</script>

<template>
  <nav>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/sign-in">sign-in</RouterLink>
    <RouterLink to="/sign-up">sign-up</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
  nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
</style>
