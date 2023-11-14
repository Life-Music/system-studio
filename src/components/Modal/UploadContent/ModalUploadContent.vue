<template>
  <Modal :title="$t('new_publish')" v-model:open="open" :width="800" centered>
    <template #footer>
      <Button key="back">{{ $t('return') }}</Button>
      <Button key="submit" type="primary" @click="handleSubmit">
        {{ currentStep < componentSteps.length - 1 ? $t('continue') : $t('done') }}
      </Button>
    </template>
    <div class="p-6">
      <template v-if="mediaInfo">
        <Steps v-model:current="currentStep" :items="items" />
        <div class="mt-8">
          <KeepAlive>
            <component :is="componentSteps[currentStep]" v-model:media-info="mediaInfo" />
          </KeepAlive>
        </div>
      </template>
      <Spin size="large" :spinning="isUploading" v-show="!mediaInfo">
        <UploadDragger
          name="file"
          :custom-request="handleChangeFile"
          class="min-h-[300px] flex items-center"
          accept="video/*,audio/*"
          :show-upload-list="false"
        >
          <p class="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p class="ant-upload-text">{{ $t('click_or_drag_come_here') }}</p>
          <p class="ant-upload-hint">
            {{ $t('support_file_des') }}
          </p>
        </UploadDragger>
      </Spin>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { Modal, Steps, Button, UploadDragger, Spin } from 'ant-design-vue'
import { ref, defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import Basic from './_Basic.vue'
import Advanced from './_Advanced.vue'
import ViewMode from './_ViewMode.vue'
import type { Media, Prisma, SessionUpload } from '~/prisma/generated/mysql'
import { computed } from 'vue'
import requestInstance from '@/utils/axios'
import { readByChunk, sha256 } from '@/utils/common'
import { watch } from 'vue'

const open = defineModel<boolean>('open')

const props = defineProps<{
  pMediaInfo?: Prisma.MediaGetPayload<{
    include: {
      detail: true
      audioResources: true
      videoResources: true
      thumbnails: true
    }
  }>
}>()

const { t } = useI18n()
const currentStep = ref(0)
const mediaInfo = ref<
  | Prisma.MediaGetPayload<{
      include: {
        detail: true
        audioResources: true
        videoResources: true
        thumbnails: true
      }
    }>
  | undefined
>(props.pMediaInfo)
const sessionUploadUrl = ref<string | null>(null)
const isUploading = ref<boolean>(false)
const componentSteps = [Basic, Advanced, ViewMode]
const items = computed(() => [
  {
    description:
      currentStep.value > 0
        ? t('steps_status.finished')
        : currentStep.value === 0
        ? t('steps_status.progressing')
        : t('steps_status.waiting'),
    title: t('basic_information')
  },
  {
    description:
      currentStep.value > 1
        ? t('steps_status.finished')
        : currentStep.value === 1
        ? t('steps_status.progressing')
        : t('steps_status.waiting'),
    title: t('advance_information')
  },
  {
    description:
      currentStep.value > 2
        ? t('steps_status.finished')
        : currentStep.value === 2
        ? t('steps_status.progressing')
        : t('steps_status.waiting'),
    title: t('mode_view')
  }
])

const handleSubmit = () => {
  if (currentStep.value < componentSteps.length - 1) {
    currentStep.value++
  } else {
  }
}

watch(
  () => props.pMediaInfo,
  () => {
    mediaInfo.value = props.pMediaInfo
  }
)

const handleChangeFile = async (e: any) => {
  const fileSrc: File = e.file
  const hashFile = await sha256(`${fileSrc.name}_${fileSrc.size}`)

  isUploading.value = true

  const media = await requestInstance.post<
    ResponseSuccess<
      Prisma.MediaGetPayload<{
        include: {
          detail: true
          audioResources: true
          videoResources: true
          thumbnails: true
        }
      }>
    >
  >('/studio/media', {
    title: fileSrc.name
  })

  const sessionUpload = await requestInstance.post<ResponseSuccess<SessionUpload>>(
    '/studio/media/create-resumable-upload',
    {
      mediaId: media.data.data.id,
      id: hashFile
    }
  )

  mediaInfo.value = media.data.data

  sessionUploadUrl.value = sessionUpload.data.data.sessionUploadUrl

  await readByChunk(fileSrc, {
    onRead(data, totalByte, byteStart) {
      console.log(data, totalByte, byteStart)
    }
  })
}
</script>
