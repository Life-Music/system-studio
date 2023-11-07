<template>
  <Layout has-sider>
    <Sidebar />
    <Layout class="ml-[200px]">
      <LayoutContent class="p-6 !min-h-screen">
        <slot />
      </LayoutContent>
    </Layout>
  </Layout>
</template>
<script setup lang="ts">
import { Layout, LayoutContent } from 'ant-design-vue'
import Sidebar from '@/components/Sidebar/USidebar.vue'
</script>
