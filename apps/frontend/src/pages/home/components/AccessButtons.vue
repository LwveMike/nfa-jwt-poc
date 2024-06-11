<script lang="ts" setup>
import { defineProps } from 'vue'

type Route = 'protected' | 'books' | 'books/hello' | 'random'

interface Props {
  route: Route
}

const props = defineProps<Props>()

function createHandlers() {
  return ['GET', 'POST']
    .map((method) => {
      return async function () {
        await fetch(`/api/${props.route}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    })
}

const [getHandler, postHandler] = createHandlers()
</script>

<template>
  <div class="container">
    <button @click="getHandler">
      GET {{ route }}
    </button>
    <button @click="postHandler">
      POST {{ route }}
    </button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding-block: 0.5rem;
}
</style>
