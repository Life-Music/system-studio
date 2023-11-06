import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import routerNames from './routerNames'
import ContentView from "../views/management/ContentView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: routerNames.AUTH,
      component: () => import("../views/auth/AuthView.vue"),
      meta: {
        layout: "AuthLayout",
      }
    },
    {
      path: '/',
      name: routerNames.HOME,
      component: HomeView
    },
    {
      path: '/management',
      children: [
        {
          path: 'content',
          name: routerNames.CONTENT,
          component: ContentView,
        }
      ]
    }
  ]
})

export default router
