<template>
  <div>
    <div class="text-center space-y-4 my-8">
      <div class="text-4xl font-bold">
        Chọn gói Premium của bạn
      </div>
      <div class="text-lg">Nghe không giới hạn trên thiết bị của bạn.</div>
    </div>
    <div class="max-w-4xl mx-auto">
      <div class="flex gap-x-4 w-full" v-if="userInfo">
        <div class="w-1/2 flex-auto" v-for="(item, i) in items" :key="i">
          <BadgeRibbon v-if="item.trialText" placement="end" color="green" :text="item.trialText">
            <PlanPreview v-bind="item" class="bg-white h-full" @on-ok="buy(item.productId)"
              :text-submit="item.productId === userInfo.productId ? 'Hủy gói' : 'Bắt đầu'"
              :btn-class="[item.productId === userInfo.productId ? '!bg-red-500' : '']"></PlanPreview>
          </BadgeRibbon>
          <PlanPreview v-else v-bind="item" class="bg-white h-full" @on-ok="buy(item.productId)"
            :text-submit="item.productId === userInfo.productId ? 'Hủy gói' : 'Bắt đầu'"
            :btn-class="[item.productId === userInfo.productId ? '!bg-red-500' : '']"></PlanPreview>
        </div>
      </div>
    </div>
    <Modal v-model:open="isOpenPayment" :closable="false" :footer="null" centered :mask-closable="false">
      <div class="h-20 flex justify-center items-center">
        <Spin tip="Đang tiến hành, vui lòng không đóng cửa sổ này" />
      </div>
    </Modal>
  </div>
</template>
<script lang="ts" setup>
import PlanPreview from '@/components/Plan/PlanPreview.vue';
import routerNames from '@/router/routerNames';
import { useUserInfoStore } from '@/stores/user';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import requestInstance from '@/utils/axios';
import { BadgeRibbon, Modal, Spin, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { createVNode } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isOpenPayment = ref(false)
const items = ref([
  {
    title: 'Mini',
    price: 'Từ 2,300₫/ngày',
    items: [
      'Nghe nhạc không quảng cáo.',
      'Nghe trên nhiều thiết bị.',
    ],
    productId: "prod_PMAHwQrNPljOaD",
  },
  {
    title: 'Individual',
    price: 'Từ 59.000₫/tháng',
    items: [
      'Nghe nhạc không quảng cáo.',
      'Nghe trên nhiều thiết bị.',
      'Hỗ trợ Youtube puller cho nghệ sỹ.',
    ],
    productId: "prod_PMAJyqDNOQZcC5",
    trialText: ""
  },
])

const router = useRouter();

const userStore = useUserInfoStore()

const userInfo = ref<Awaited<typeof userStore.userInfo>>()

userStore.init()

userStore.userInfo?.then((res) => {
  userInfo.value = res
  if (res && !res.trialEnd) {
    items.value[1].trialText = `Dùng thử đến ${dayjs().endOf('month').hour(23).minute(59).format("DD/MM/YYYY")}`;
  }
})

const buy = async (productId: string) => {
  const userInfo = await userStore.userInfo
  if (userInfo && userInfo.customerId) {
    if (productId === userInfo.productId) {
      Modal.confirm({
        title: 'Xác nhận hủy',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Bạn có chắc muốn hủy gói cước này?',
        onOk: async () => {
          await requestInstance.delete<ResponseSuccess<any | null>>('/payment/subscription', {
            params: {
              productId,
            }
          })
          window.location.reload()
        }
      });
      return
    }
    isOpenPayment.value = true
    await requestInstance.post('/payment/subscription', {
      productId,
    })
    message.success('Thanh toán thành công!')
    window.location.reload()
    return
  }
  router.push({
    name: routerNames.PAYMENT_METHOD,
  })
}
</script>