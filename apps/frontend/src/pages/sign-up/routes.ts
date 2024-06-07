import type { RouteRecordRaw } from 'vue-router'
import SignUp from './index.vue'

export default {
  path: '/sign-up',
  component: SignUp,
  meta: {
    isGuestOnly: true,
  },
} satisfies RouteRecordRaw
