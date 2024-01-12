<template>
  <div>
    <div class="text-2xl mb-8 flex justify-between items-center">
      Phương thức thanh toán
    </div>

    <div class="max-w-3xl mx-auto p-6 rounded-lg bg-white">
      <Spin :spinning="isLoading">
        <template v-if="methods.length">
          <div class="space-y-4">
            <div v-for="method in methods" :key="method.id" class="cursor-pointer relative"
              @click="changeDefaultPaymentMethod(method.id)">
              <BadgeRibbon v-if="method.id === customerInfo?.invoice_settings.default_payment_method" color="green"
                placement="end" text="Mặc định">
                <CardPayment :card-brand="method.card.brand"
                  :card-exp="`${method.card.exp_month}/${method.card.exp_year}`" :last4-digits="method.card.last4"
                  :active="method.id === customerInfo?.invoice_settings.default_payment_method" />
              </BadgeRibbon>
              <template v-else>
                <CardPayment :card-brand="method.card.brand"
                  :card-exp="`${method.card.exp_month}/${method.card.exp_year}`" :last4-digits="method.card.last4"
                  :active="method.id === customerInfo?.invoice_settings.default_payment_method" />
                <div class="w-7 h-7 rounded-full bg-red-500 absolute top-3 right-3 flex items-center justify-center">
                  <DeleteOutlined class="text-white" @click.stop="deleteCard(method.id)" />
                </div>
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <Empty
            image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
            :image-style="{
              height: '60px',
              display: 'inline-block',
            }">
            <template #description>
              <span>
                Chưa có phương thức thanh toán.
              </span>
            </template>
          </Empty>
        </template>
      </Spin>
      <Divider>
        Hoặc
      </Divider>
      <div class="text-center">
        <Button type="primary" @click="openAddPaymentMethod" :loading="isFetching">Thêm phương thức thanh toán</Button>
      </div>
      <Modal v-model:open="isOpenPaymentAddMethod" title="Thêm phương thức thanh toán" @ok="addPaymentMethod"
        :ok-button-props="{
          loading: isFetching,
        }">
        <div class="py-4">
          <div ref="stripeElementRef"></div>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import requestInstance from '@/utils/axios';
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { Button, Divider, Empty, Modal, message, Spin, BadgeRibbon } from 'ant-design-vue';
import { nextTick } from 'vue';
import { useRoute } from 'vue-router';
import CardPayment from '@/components/Payment/CardPayment.vue';
import { createVNode } from 'vue';

const stripeElementRef = ref()
const isOpenPaymentAddMethod = ref(false)
const methods = ref<Record<string, any>[]>([])
const customerInfo = ref<Record<string, any>>()
const isFetching = ref(false)
const isLoading = ref(false)

const stripeHandle = loadStripe(import.meta.env.VITE_STRIPE_PK);
const route = useRoute()

const getPaymentIntent = async () => {
  const res = await requestInstance.post<ResponseSuccess<any>>('/payment/intent')
  return res.data.data
}

const confirmPayment = async (token: string) => {
  await requestInstance.post<ResponseSuccess<any>>('/payment/methods', { token })
  const url = new URL(window.location.href)
  url.search = ""
  window.location.href = url.href
}

if (route.query.setup_intent) {
  confirmPayment(route.query.setup_intent as string)
}

const getPaymentMethods = async () => {
  isLoading.value = true
  const res = await requestInstance.get<ResponseSuccess<any | null>>('/payment/methods')
    .finally(() => isLoading.value = false)

  if (res.data.data) {
    methods.value = res.data.data.methods.data.map((item: any) => {
      return {
        id: item.id,
        card: item.card,
      }
    })
    customerInfo.value = res.data.data.customer
  }
  return res.data.data
}

getPaymentMethods()

const changeDefaultPaymentMethod = async (id: string) => {
  if (id === customerInfo.value?.invoice_settings.default_payment_method) return
  isLoading.value = true
  await requestInstance.patch<ResponseSuccess<any | null>>('/payment/methods', {
    paymentMethodId: id,
  })
    .finally(() => isLoading.value = false)

  message.success('Đã cập nhật phương thanh toán mặc định.')

  await getPaymentMethods()
}

const deleteCard = async (id: string) => {
  Modal.confirm({
    title: 'Xác nhận xóa thẻ',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'Bạn có chắc muốn xóa thẻ này?',
    onOk: async () => {
      await requestInstance.delete<ResponseSuccess<any | null>>('/payment/methods', {
        params: {
          paymentMethodId: id,
        }
      })
      message.success('Xoá thẻ thành công')
      getPaymentMethods()
    }
  });
}

let elements: any
let paymentElement: any
let setupIntentKey: string

const openAddPaymentMethod = async () => {
  isFetching.value = true
  const stripe = await stripeHandle
  if (!setupIntentKey) {
    const paymentIntent = await getPaymentIntent();
    setupIntentKey = paymentIntent.client_secret
  }
  isOpenPaymentAddMethod.value = true;
  await nextTick()
  if (stripeElementRef.value && stripe) {
    elements ??= stripe.elements({
      clientSecret: setupIntentKey,
    });
    paymentElement ??= elements.create('payment');
    paymentElement.mount(stripeElementRef.value);
  }
  isFetching.value = false
}

const addPaymentMethod = async () => {
  isFetching.value = true
  const stripe = await stripeHandle
  if (stripe) {
    await stripe.confirmSetup({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after the SetupIntent is confirmed.
        return_url: window.location.href,
      },
    })
      .then(function (result) {
        if (result.error) {
          // Inform the customer that there was an error.
          message.error(result.error.message);
        }
      });
  }
  isFetching.value = false
}

</script>