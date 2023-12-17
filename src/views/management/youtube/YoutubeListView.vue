<template>
  <div>
    <div class="text-2xl mb-8 flex justify-between items-center">
      <div>
        Youtube puller
      </div>
      <div>
        <Button type="primary" @click="redirectToLogin">
          <template #icon>
            <PlusOutlined />
          </template>
          Thêm account
        </Button>
      </div>
    </div>
    <div class="p-4 bg-white rounded-lg">
      <template v-if="userInfo?.SocialAccount.length">
        <Table :columns="columns" :data-source="dataSource" :loading="isLoading">
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'account'">
              <div class="text-blue-500 cursor-pointer font-semibold">
                <div class="flex gap-x-5 items-center">
                  <div class="flex-shrink-0">
                    <img class="w-10 aspect-square rounded-lg" :src="record.avatarUrl" />
                  </div>
                  <div>{{ record.fullName }}</div>
                </div>
              </div>
            </template>
            <template v-if="column.dataIndex === 'createdAt'">
              {{ formatDate(record.createdAt ?? text) }}
            </template>
            <template v-if="column.dataIndex === 'disabledAt'">
              <Tag color="red" v-if="record.disabledAt">{{ "Ngưng hoạt động" }}</Tag>
              <Tag color="green" v-else>{{ "Đang hoạt động" }}</Tag>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <DropdownButton trigger="click" arrow>
                <template #overlay>
                  <Menu>
                    <Menu.Item v-if="record.disabledAt" @click="toggleDisableAccount(record.id)">
                      Bật tự động đồng bộ
                    </Menu.Item>
                    <Menu.Item v-else danger @click="toggleDisableAccount(record.id)">
                      Tắt tự động đồng bộ
                    </Menu.Item>
                  </Menu>
                </template>
                {{ $t('table.action') }}
              </DropdownButton>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </Table>
      </template>
      <template v-else>
        <Result title="Chưa cấu hình tài khoản youtube">
          <template #extra>
            <Button key="config" type="primary" @click="redirectToLogin">Cấu hình</Button>
          </template>
        </Result>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Button, DropdownButton, Menu, Result, Table, Tag } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import requestInstance from '@/utils/axios';
import { ref } from 'vue';
import { formatDate } from '@/utils/common'
import type { Prisma, SocialAccount } from '~/prisma/generated/mysql';
import type { ColumnType } from 'ant-design-vue/es/table';

const userInfo = ref<Prisma.UserGetPayload<{
  include: {
    SocialAccount: true,
  }
}>>()

const isLoading = ref(false)
const columns = ref<ColumnType[]>([
  {
    title: "Tài khoản",
    dataIndex: 'account',
    key: 'account',
    width: 400
  },
  {
    title: "Loại",
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: "Trạng thái",
    dataIndex: 'disabledAt',
    key: 'disabledAt'
  },
  {
    title: "Ngày thêm",
    dataIndex: 'expiredAt',
    key: 'expiredAt'
  },
  {
    title: "Hành động",
    dataIndex: 'action',
    key: 'action'
  },
])

const dataSource = ref<SocialAccount[]>([])

const fetchInfoAccount = async () => {
  isLoading.value = true
  const res = await requestInstance.get<ResponseSuccess<any>>('/me')
    .finally(() => isLoading.value = false)

  userInfo.value = res.data.data
  dataSource.value = res.data.data.SocialAccount
}

fetchInfoAccount()

const redirectToLogin = () => {
  const urlRedirect = window.location.href + "/auth"
  const urlObj = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  const params: Record<string, any> = {
    client_id: import.meta.env.VITE_PUBLIC_GOOGLE_AUTH,
    redirect_uri: urlRedirect,
    access_type: "offline",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile",
    state: "loginToYoutube",
  }

  for (const key in params) {
    urlObj.searchParams.append(key, params[key])
  }

  window.location.href = urlObj.href
}

const toggleDisableAccount = async (id: string) => {
  isLoading.value = true
  await requestInstance.patch<ResponseSuccess<any>>(`/studio/social-account/${id}/disable`)
    .finally(() => isLoading.value = false)

  fetchInfoAccount()
}

</script>