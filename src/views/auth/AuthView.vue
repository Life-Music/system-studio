<template>
  <div>
    <template v-if="token">
      <template v-if="userInfo === null">
        <Alert>
          <template #message>
            <div class="space-y-4 text-center p-4">
              <div>
                {{ $t('on_login') }}
              </div>
              <Spin :indicator="indicator" />
            </div>
          </template>
        </Alert>
      </template>
      <template v-else-if="userInfo === false">
        <Alert
          :message="$t('verification_failed')"
          :description="$t('token_wrong')"
          type="error"
          show-icon
        >
          <template #icon>
            <SmileOutlined />
          </template>
        </Alert>
      </template>
      <template v-else>
        <Alert
          :message="$t('verification_success')"
          :description="$t('please_wait')"
          type="success"
          show-icon
        >
          <template #icon>
            <SmileOutlined />
          </template>
        </Alert>
      </template>
    </template>
    <template v-else>
      <Result
        status="403"
        title="403"
        sub-title="Sorry, you are not authorized to access this page."
      >
        <template #extra>
          <Button type="primary">Back Home</Button>
        </template>
      </Result>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Result, Button, Spin, Alert } from 'ant-design-vue'
import { ref, h } from 'vue'
import { LoadingOutlined, SmileOutlined } from '@ant-design/icons-vue'
import { useUserInfoStore } from '@/stores/user'
import type { User } from '~/prisma/generated/mysql'
import { useRouter } from 'vue-router'
import routerNames from '@/router/routerNames'

const {
  query
}: {
  query: {
    token?: string
  }
} = useRoute()

const router = useRouter()

const token = ref(query.token)

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px'
  },
  spin: true
})
const userInfo = ref<User | null | false>(null)

if (token.value) {
  const userStore = useUserInfoStore()
  userStore.init({
    access_token: token.value
  })
  userStore.userInfo?.then((res) => {
    userInfo.value = res
    if (res) {
      localStorage.setItem('access_token', token.value as string)
      setTimeout(() => {
        router.push({
          name: routerNames.HOME
        })
      }, 2000)
    }
  })
}
</script>
