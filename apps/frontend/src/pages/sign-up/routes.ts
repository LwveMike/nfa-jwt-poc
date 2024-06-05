import SignUp from './index.vue'
import { RouteRecordRaw } from 'vue-router'

export default {
  path: '/sign-up',
  component: SignUp,
  meta: {
    isGuestOnly: true
  }
} satisfies RouteRecordRaw
