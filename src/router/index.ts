import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import routerNames from './routerNames'
import ContentView from "../views/management/ContentView.vue"
import AlbumView from '@/views/management/AlbumView.vue'
import ListMediaView from '@/views/management/album/ListMediaView.vue'

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
        },
        {
          path: 'album',
          children: [
            {
              path: '',
              name: routerNames.ALBUM,
              component: AlbumView,
            },
            {
              path: ':albumId/media',
              name: routerNames.ALBUM_MEDIA,
              component: ListMediaView,
            }
          ]
        }
      ]
    }
  ]
})

export default router
