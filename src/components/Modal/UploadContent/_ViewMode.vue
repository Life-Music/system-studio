<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('mode_view')
      }}</Divider>
      <Form :model="mediaInfo" layout="vertical">
        <FormItem :label="$t('basic_information_form.schedule')" name="schedule">
          <Switch v-model:checked="formState.schedule" />
        </FormItem>
        <template v-if="formState.schedule">
          <FormItem
            :label="$t('basic_information_form.publish_later')"
            name="schedule_time"
            :rules="[{ required: true, message: $t('please_type_field') }]"
          >
            <DatePicker v-model:value="formState.schedule_time" show-time />
          </FormItem>
        </template>
        <template v-else>
          <FormItem
            :label="$t('basic_information_form.publish_now')"
            name="status"
            :rules="[{ required: true, message: $t('please_type_field') }]"
          >
            <RadioGroup v-model:value="formState.status">
              <Radio v-for="status in statusOption" :key="status.value" :value="status.value" class="flex mb-2">
                {{ status.text }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </template>
      </Form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Divider, Form, FormItem, Switch, DatePicker, RadioGroup, Radio } from 'ant-design-vue'
import { ref } from 'vue'
import { defineModel } from 'vue'
import type { Media, Status } from '~/prisma/generated/mysql'

const mediaInfo = defineModel<Media>('mediaInfo', {
  required: true
})
const formState = ref<Record<string, any>>({})

const statusOption: {
  text: string
  value: Status
}[] = [
  {
    text: 'Công khai',
    value: 'PUBLIC'
  },
  {
    text: 'Riêng tư',
    value: 'PRIVATE'
  }
]
</script>
