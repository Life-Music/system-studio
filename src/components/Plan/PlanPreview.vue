<template>
  <div class="p-4 rounded-lg shadow-lg flex flex-col">
    <div class="space-y-2">
      <div class="text-lg font-bold">
        {{ props.title }}
      </div>
      <div class="text-base">
        {{ props.price }}
      </div>
      <div class="text-base">
        1 tài khoản
      </div>
    </div>
    <Divider />
    <div class="flex-auto text-base">
      <slot>
        <div class="space-y-4">
          <div class="flex gap-x-3 items-center" v-for="item in props.items" :key="item">
            <CheckOutlined />
            <div>{{ item }}</div>
          </div>
        </div>
      </slot>
    </div>
    <div class="mt-8">
      <button class="w-full py-3 rounded-2xl text-white bg-slate-900 text-base font-semibold" :class="props.btnClass"
        @click="emits('onOk')">
        {{ textSubmit }}
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Divider } from 'ant-design-vue';
import { CheckOutlined } from '@ant-design/icons-vue';

const props = withDefaults(defineProps<{
  title: string,
  price: string,
  items?: string[],
  textSubmit: string,
  btnClass?: string | string[],
}>(), {
  items: () => [],
})

const emits = defineEmits([
  'onOk'
])

</script>