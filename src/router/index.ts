import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import routerNames from './routerNames'
import ContentView from "../views/management/ContentView.vue"
import AlbumView from '@/views/management/AlbumView.vue'
import ListMediaView from '@/views/management/album/ListMediaView.vue'
import YoutubeListView from '@/views/management/youtube/YoutubeListView.vue'
import YoutubeAuth from '@/views/management/youtube/YoutubeAuth.vue'
import UpdateProfileView from '@/views/profile/UpdateProfileView.vue'
import PaymentMethodView from '@/views/profile/payment/PaymentMethodView.vue'
import PaymentPlanView from '@/views/profile/payment/PaymentPlanView.vue'
import PaymentInvoicesView from '@/views/profile/payment/PaymentInvoiceView.vue'

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
        },
        {
          path: 'youtube-puller',
          children: [
            {
              path: '',
              name: routerNames.YOUTUBE,
              component: YoutubeListView,
            },
            {
              path: 'auth',
              name: routerNames.YOUTUBE_AUTH,
              component: YoutubeAuth,
            }
          ]
        }
      ]
    },
    {
      path: '/profile',
      name: routerNames.PROFILE_EDIT,
      component: UpdateProfileView,
    },
    {
      path: '/payment',
      children: [
        {
          path: 'methods',
          name: routerNames.PAYMENT_METHOD,
          component: PaymentMethodView,
        },
        {
          path: 'invoices',
          name: routerNames.PAYMENT_INVOICE,
          component: PaymentInvoicesView,
        },
        {
          path: 'plans',
          name: routerNames.PAYMENT_PLAN,
          component: PaymentPlanView,
        }
      ]
    }
  ]
})

export default router
