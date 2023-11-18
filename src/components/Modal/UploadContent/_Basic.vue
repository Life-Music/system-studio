<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('basic_information')
      }}</Divider>
      <Form :model="formState" layout="vertical" ref="formRef">
        <FormItem
          :label="$t('basic_information_form.title')"
          name="title"
          :rules="[{ required: true, message: $t('please_type_field') }]"
        >
          <Input v-model:value="formState.title" />
        </FormItem>
        <FormItem
          :label="$t('basic_information_form.description')"
          name="description"
          :rules="[{ required: true, message: $t('please_type_field') }]"
        >
          <Textarea v-model:value="formState.description" :rows="4" />
        </FormItem>
        <div class="flex gap-x-3">
          <div class="flex-auto">
            <FormItem
              :label="$t('basic_information_form.thumbnail')"
              name="thumbnail"
              v-if="formState.thumbnail"
            >
              <Upload v-model:file-list="formState.thumbnail" list-type="picture-card">
                <div v-if="formState.thumbnail.length < 4">
                  <plus-outlined />
                  <div style="margin-top: 8px">Upload</div>
                </div>
              </Upload>
            </FormItem>
          </div>
          <div class="max-w-[350px]">
            <div class="mb-2 text-right w-full">{{ $t('preview') }}</div>
            <MiniAudioPlayer
              :artist="{
                name: ''
              }"
              :name="formState.title"
              :source="formState.source"
              thumbnail="/images/audio/default.png"
              v-if="formState.source"
            />
          </div>
        </div>
        <FormItem :label="$t('basic_information_form.album')" name="album">
          <Select
            v-model:value="formState.album"
            mode="multiple"
            style="width: 100%"
            placeholder="Select Item..."
            :max-tag-count="3"
            :options="[]"
          >
            <template #maxTagPlaceholder="omittedValues">
              <span style="color: red">+ {{ omittedValues.length }} ...</span>
            </template>
          </Select>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Divider, Form, FormItem, Input, Textarea, Upload, Select } from 'ant-design-vue'
import { ref } from 'vue'
import type { Prisma } from '~/prisma/generated/mysql'
import type { UploadProps } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { watch } from 'vue'
import MiniAudioPlayer from '@/components/AudioPlayer/MiniAudioPlayer.vue'
import { getAudioSource } from '@/utils/common'

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
  title: string
  description: string
  thumbnail: UploadProps['fileList']
  album: string[]
  source: string
}>({
  title: '',
  description: '',
  thumbnail: [],
  album: [],
  source: ''
})

watch(
  () => props.mediaInfo,
  () => {
    if (!props.mediaInfo) {
      formState.value = {
        title: '',
        description: '',
        thumbnail: [],
        album: [],
        source: ''
      }
      return
    }
    formState.value.title = props.mediaInfo.title
    formState.value.description = props.mediaInfo.detail?.description ?? ''
    formState.value.source = getAudioSource(props.mediaInfo.audioResources[0].id)
    formState.value.thumbnail = props.mediaInfo.thumbnails.map((th) => {
      return {
        uid: th.id,
        name: th.url,
        status: 'done',
        url: th.url
      }
    })
    formState.value.title = props.mediaInfo.title
  },
  {
    immediate: true
  }
)

const formRef = ref()

const validate = (
  formData: Prisma.MediaGetPayload<{
    include: {
      detail: true
      audioResources: true
      videoResources: true
      thumbnails: true
    }
  }>
) => {
  return formRef.value.validate().then(() => {
    formData.title = formState.value.title.trim()
    if (formData.detail) formData.detail.description = formState.value.description.trim()
  })
}

defineExpose({
  validate
})
</script>
