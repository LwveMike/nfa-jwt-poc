import type { RouteRecordRaw } from 'vue-router'
import SignIn from './index.vue'

export default {
  path: '/sign-in',
  component: SignIn,
  meta: {
    isGuestOnly: true,
  },
} satisfies RouteRecordRaw
