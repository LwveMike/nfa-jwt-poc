import { createRouter, createWebHistory } from 'vue-router'
import signInRoutes from './pages/sign-in/routes'
import signUpRoutes from './pages/sign-up/routes'
import homeRoutes from './pages/home/routes'
import 'vue-router'
import { useAuth } from './composables/useAuth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    isGuestOnly?: boolean
  }
}


const router = createRouter({
  history: createWebHistory(),
  routes: [
    signInRoutes,
    signUpRoutes,
    homeRoutes,
  ] 
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth === undefined && to.meta.isGuestOnly === undefined) {
    return next()
  }

  if (to.meta.requiresAuth === true && isAuthenticated.value === true) {
    return next()
  }

  if (to.meta.isGuestOnly === true && isAuthenticated.value === false) {
    return next()
  }

  return next('/')
})

export default router
