
<template>
  <div class="flex items-center justify-center w-full">
    <div class="bg-white rounded-lg max-w-lg flex-auto aspect-square flex justify-center items-center">
      <div class="flex-auto relative h-full flex items-center justify-center">
        <Spin :spinning="isLoading">
          <div class="space-y-8 text-center" v-if="userInfo">
            <Avatar :size="128" :src="userInfo.avatarUrl" />

            <div class="font-semibold text-lg">
              {{ userInfo.fullName }}
            </div>
          </div>
        </Spin>
        <div class="absolute bottom-4 right-4" v-if="userInfo">
          <Button type="primary" @click="continuePage">Tiếp tục</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import routerNames from '@/router/routerNames';
import requestInstance from '@/utils/axios';
import { Avatar, Button, Spin } from 'ant-design-vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import type { SocialAccount } from '~/prisma/generated/mysql';

type SocialAccountType = SocialAccount
const route = useRoute()
const router = useRouter()
const isLoading = ref(false);
const userInfo = ref()

const checkUserInfo = async () => {
  const code = route.query.code
  isLoading.value = true;
  const res = await requestInstance.post<ResponseSuccess<SocialAccountType>>('/studio/google/auth-info', {
    code,
  })
    .finally(() => {
      isLoading.value = false;
    })

  userInfo.value = res.data.data

}

const continuePage = () => {
  router.push({
    name: routerNames.YOUTUBE,
  })
}

checkUserInfo()

</script>