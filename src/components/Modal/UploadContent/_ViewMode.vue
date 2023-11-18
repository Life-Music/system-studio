<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('mode_view')
      }}</Divider>
      <Form :model="mediaInfo" layout="vertical" ref="formRef">
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
              <Radio
                v-for="status in statusOption"
                :key="status.value"
                :value="status.value"
                class="flex mb-2"
              >
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
import { watch } from 'vue'
import { ref } from 'vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { Prisma, Status } from '~/prisma/generated/mysql'

const props = defineProps<{
  mediaInfo:
    | Prisma.MediaGetPayload<{
        include: {
          detail: true
          thumbnails: true
          audioResources: true
          videoResources: true
        }
      }>
    | undefined
}>()

const formState = ref<{
  schedule: boolean
  schedule_time: Dayjs
  status: Status
}>({
  schedule: false,
  schedule_time: dayjs(),
  status: 'PUBLIC'
})

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

watch(
  () => props.mediaInfo,
  () => {
    if (!props.mediaInfo) {
      formState.value = {
        schedule: false,
        schedule_time: dayjs(),
        status: 'PUBLIC'
      }
      return
    }
    if (props.mediaInfo.publishedAt) {
      formState.value.schedule = true
      formState.value.status = 'PUBLIC'
      formState.value.schedule_time = dayjs(props.mediaInfo.publishedAt)
      return
    }

    formState.value.status = props.mediaInfo.viewMode
    formState.value.schedule = false
    formState.value.schedule_time = dayjs()
  },
  {
    immediate: true
  }
)

const formRef = ref()

const validate = (formData: typeof props.mediaInfo) => {
  return formRef.value?.validate().then(() => {
    if (!formData) return
    if (formState.value.schedule) {
      formData.publishedAt = dayjs(formState.value.schedule_time).toDate()
      formData.viewMode = 'PUBLIC'
      return
    }
    formData.publishedAt = null
    formData.viewMode = formState.value.status
  })
}

defineExpose({
  validate
})
</script>
