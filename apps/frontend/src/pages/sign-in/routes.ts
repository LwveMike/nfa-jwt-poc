import SignIn from './index.vue'
import { RouteRecordRaw } from 'vue-router'

export default {
  path: '/sign-in',
  component: SignIn,
  meta: {
    isGuestOnly: true
  }
} satisfies RouteRecordRaw
