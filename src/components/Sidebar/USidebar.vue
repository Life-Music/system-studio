<template>
  <LayoutSider class="overflow-auto h-screen !fixed left-0 top-0 bottom-0 py-4" theme="light">
    <div class="flex flex-col h-full">
      <div class="flex items-center gap-x-2 justify-center mb-4">
        <div class="logo h-8 w-9 bg-contain bg-center bg-no-repeat" />
        <div class="text-xl">Lifemusic</div>
      </div>
      <div class="flex-auto overflow-auto">
        <Menu mode="inline" v-model:selected-keys="currentRoute">
          <MenuItem v-for="menuItem in menu" :key="menuItem.key" @click="menuItem.onClick">
          <component :is="menuItem.icon" />
          <span class="nav-text">{{ menuItem.text }}</span>
          </MenuItem>
        </Menu>
      </div>
      <div>
        <Menu mode="inline" v-model:selected-keys="currentRoute">
          <MenuItem @click="router.push({
            name: routerNames.PROFILE_EDIT
          })">
          <UserOutlined />
          <span class="nav-text">Cài đặt tài khoản</span>
          </MenuItem>
        </Menu>
      </div>
    </div>
  </LayoutSider>
</template>
<script setup lang="ts">
import { LayoutSider, Menu, MenuItem } from 'ant-design-vue'
import Logo from '@/assets/logo.png'
import { FundOutlined, BulbOutlined, FolderOutlined, YoutubeOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import routerNames from '@/router/routerNames'
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const { t } = useI18n()
const cssLogo = `url('${Logo}')`
const router = useRouter()
const route = useRoute()
const currentRoute = ref([route.matched[route.matched.length - 1]?.name?.toString() ?? ''])

const menu = [
  {
    icon: FundOutlined,
    text: t('dashboard'),
    key: routerNames.HOME,
    onClick: () => {
      router.push({
        name: routerNames.HOME
      })
    }
  },
  {
    icon: BulbOutlined,
    text: t('all_content'),
    key: routerNames.CONTENT,
    onClick: () => {
      router.push({
        name: routerNames.CONTENT
      })
    }
  },
  {
    icon: FolderOutlined,
    text: t('Album'),
    key: routerNames.ALBUM,
    onClick: () => {
      router.push({
        name: routerNames.ALBUM
      })
    }
  },
  {
    icon: YoutubeOutlined,
    text: "Youtube puller",
    key: routerNames.YOUTUBE,
    onClick: () => {
      router.push({
        name: routerNames.YOUTUBE
      })
    }
  }
]
</script>
<style scoped>
.logo {
  background-image: v-bind(cssLogo);
}
</style>
