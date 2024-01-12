<template>
  <div v-if="isLoading">
  </div>
  <div v-else>
    <template v-if="userInfo">
      <div class="w-full h-96 bg-slate-800 rounded-lg flex items-end py-8 px-8 relative">
        <div :style="`background-image: url('${userInfo.cover}')`"
          class="bg-cover bg-center bg-no-repeat absolute inset-0 opacity-50" v-if="userInfo.cover">
        </div>
        <div class="absolute bottom-4 right-4 flex gap-x-4">
          <Button type="primary" @click="handleClickUploadCover" :loading="uploadingCover">
            <template #icon>
              <CloudUploadOutlined />
            </template>
            Tải lên ảnh bìa
          </Button>
        </div>
        <div class="relative group">
          <Avatar :src="userInfo.avatar ?? ''" :size="150" :style="{ backgroundColor: '#00a2ae' }">
            {{ userInfo.firstName[0] }}
          </Avatar>
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 group-hover:block hidden">
            <Button type="primary" @click="handleClickUploadAvatar">
              <template #icon>
                <CloudUploadOutlined />
              </template>
            </Button>
          </div>
        </div>
      </div>
      <div class="mt-8">
        <div class="mx-auto max-w-3xl">
          <div class=" flex gap-x-6 w-full">
            <div class="rounded-lg p-4 bg-white flex-auto space-y-3">
              <div class="text-xs">Gói của bạn</div>
              <div class="text-2xl font-semibold">
                {{ userInfo.productId ? planInfo[userInfo.productId].name : "Lifemusic free" }}
              </div>
            </div>
            <div
              class="rounded-lg p-4 bg-white h-40 w-32 gap-x-4 flex justify-center items-center flex-col cursor-pointer"
              @click="router.push({
                name: routerNames.PAYMENT_PLAN
              })">
              <CrownOutlined class="text-3xl text-blue-600 animate-bounce" />
              <div>Dùng premium</div>
            </div>
          </div>
          <div class="mt-4">
            <Card title="Thanh toán" :bordered="false">
              <RouterLink :to="{
                name: item.routerName,
              }" v-for="(item, i) in listItem" :key="i"
                class="px-4 py-4 flex gap-x-4 items-center text-base hover:bg-slate-200 rounded-lg transition-all duration-150 text-inherit">
                <component :is="item.icon" />
                <div>
                  {{ item.title }}
                </div>
                <div class="ml-auto">
                  <RightOutlined />
                </div>
              </RouterLink>
            </Card>
          </div>
        </div>
        <div class="flex gap-x-8 mt-8">
          <div class="flex-auto p-6 bg-white rounded-lg">
            <h2 class="text-2xl mb-4">Thông tin cơ bản</h2>
            <Form layout="vertical" :model="formState" @finish="handleSubmitBasic">
              <Form.Item label="Họ" name="firstName" :rules="{
                required: true, message: 'Không được để trống'
              }">
                <Input v-model:value="formState.firstName" />
              </Form.Item>
              <Form.Item label="Tên" name="lastName" :rules="{
                required: true, message: 'Không được để trống'
              }">
                <Input v-model:value="formState.lastName" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Form>
          </div>
          <div class="flex-auto p-6 bg-white rounded-lg">
            <h2 class="text-2xl mb-4">Thông tin nâng cao</h2>
            <Form layout="vertical" :model="formState" @finish="handleSubmitAdv">
              <Form.Item label="Mật khẩu hiện tại" name="oldPassword" :rules="{
                required: true, message: 'Không được để trống'
              }">
                <Input v-model:value="formState.oldPassword" type="password" />
              </Form.Item>
              <Form.Item label="Mật khẩu mới" name="password" :rules="{
                required: true, message: 'Không được để trống'
              }">
                <Input v-model:value="formState.password" type="password" />
              </Form.Item>
              <Form.Item label="Nhập lại mật khẩu mới" name="confirmPassword" :rules="{
                required: true, message: 'Không được để trống'
              }">
                <Input v-model:value="formState.confirmPassword" type="password" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </template>
  </div>
  <input type="file" accept="image/*" hidden ref="fileAvatar" @change="handleChangeFileAvatar" />
  <input type="file" accept="image/*" hidden ref="fileCover" @change="handleChangeFileCover" />
</template>
<script setup lang="ts">
import { useUserInfoStore } from '@/stores/user';
import { Avatar, Button, Card, Form, Input, message } from 'ant-design-vue';
import { ref } from 'vue';
import { CloudUploadOutlined, CrownOutlined, TransactionOutlined, BarcodeOutlined, CreditCardOutlined, RightOutlined } from '@ant-design/icons-vue';
import requestInstance from '@/utils/axios';
import { reactive } from 'vue';
import routerNames from '@/router/routerNames';
import { planInfo } from '@/utils/plan';
import { useRouter } from 'vue-router';

const router = useRouter()
const userInfoStore = useUserInfoStore()
const userInfo = ref<Awaited<typeof userInfoStore['userInfo']>>()

const fileAvatar = ref()
const fileCover = ref()
const uploadingCover = ref<boolean>(false)

const isLoading = ref<boolean>(false)

const fetchUserInfo = async () => {
  isLoading.value = true
  await userInfoStore.init()
  userInfo.value = await userInfoStore.userInfo
  if (userInfo.value) {
    formState.firstName = userInfo.value.firstName
    formState.lastName = userInfo.value.lastName
  }
  isLoading.value = false
}

const formState = reactive({
  firstName: "",
  lastName: "",
  oldPassword: "",
  password: "",
  confirmPassword: "",
})

const handleClickUploadAvatar = () => {
  if (fileAvatar.value) {
    fileAvatar.value.click()
  }
}

const handleClickUploadCover = () => {
  if (fileAvatar.value) {
    fileCover.value.click()
  }
}

const handleChangeFileAvatar = async (e: Event) => {
  const currentTarget = e.currentTarget as HTMLInputElement
  if (currentTarget.files && currentTarget.files.length > 0) {
    const formData = new FormData()
    formData.append('file', currentTarget.files[0])
    await requestInstance.post('/studio/me/avatar/upload', formData)
    message.success('Cập nhật avatar thành công!');
    userInfoStore.removeUserInfo()
    fetchUserInfo()
  }
}

const handleChangeFileCover = async (e: Event) => {
  const currentTarget = e.currentTarget as HTMLInputElement
  if (currentTarget.files && currentTarget.files.length > 0) {
    const formData = new FormData()
    formData.append('file', currentTarget.files[0])
    uploadingCover.value = true
    await requestInstance.post('/studio/me/cover/upload', formData)
      .finally(() => {
        uploadingCover.value = false
      })
    message.success('Cập nhật ảnh bìa thành công!');
    userInfoStore.removeUserInfo()
    fetchUserInfo()
  }
}

const handleSubmit = async (data: any) => {
  await requestInstance.patch('/studio/me', data)
  message.success('Cập nhật thông tin thành công!');
  userInfoStore.removeUserInfo()
  fetchUserInfo()
}

const handleSubmitBasic = (data: typeof formState) => {
  handleSubmit({
    firstName: data.firstName,
    lastName: data.lastName,
  })
}

const handleSubmitAdv = (data: typeof formState) => {
  handleSubmit({
    oldPassword: data.oldPassword,
    password: data.password,
    confirmPassword: data.confirmPassword,
  })
}

const listItem = [
  {
    icon: CreditCardOutlined,
    title: 'Phương thức thanh toán',
    routerName: routerNames.PAYMENT_METHOD,
  },
  {
    icon: BarcodeOutlined,
    title: 'Lịch sử mua hàng',
    routerName: routerNames.PAYMENT_INVOICE,
  },
  {
    icon: TransactionOutlined,
    title: 'Đổi gói',
    routerName: routerNames.PAYMENT_PLAN,
  }
]

fetchUserInfo()
</script>