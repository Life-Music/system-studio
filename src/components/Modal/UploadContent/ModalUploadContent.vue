<template>
  <Modal
    :title="props.pMediaInfo ? $t('edit_publish') : $t('new_publish')"
    v-model:open="open"
    :width="800"
    centered
  >
    <template #footer>
      <Button
        key="delete"
        danger
        type="primary"
        @click="openModalConfirm"
        v-if="props.pMediaInfo"
        >{{ $t('delete') }}</Button
      >
      <Button key="back" @click="handleBack">{{ $t('return') }}</Button>
      <Button key="submit" type="primary" @click="handleSubmit" :loading="saving">
        {{ currentStep < componentSteps.length - 1 ? $t('continue') : $t('done') }}
      </Button>
    </template>
    <div class="p-6">
      <template v-if="isShowInfo">
        <Steps v-model:current="currentStep" :items="items" />
        <div class="mt-8">
          <KeepAlive>
            <component
              :is="componentSteps[currentStep]"
              :media-info="mediaInfo"
              ref="currentComponent"
            />
          </KeepAlive>
        </div>
      </template>
      <Spin size="large" :spinning="isUploading" v-show="!isShowInfo">
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
import {
  Modal,
  Steps,
  Button,
  UploadDragger,
  Spin,
  message,
  notification,
  Progress
} from 'ant-design-vue'
import { ref, defineModel, createVNode } from 'vue'
import { useI18n } from 'vue-i18n'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import Basic from './_Basic.vue'
import Advanced from './_Advanced.vue'
import ViewMode from './_ViewMode.vue'
import type { Media, Prisma, SessionUpload } from '~/prisma/generated/mysql'
import { computed } from 'vue'
import requestInstance from '@/utils/axios'
import { readByChunk, sha256, createResumableUpload, checkAcceptRange } from '@/utils/common'
import { watch } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'

const open = defineModel<boolean>('open')

const props = defineProps<{
  pMediaInfo?: Prisma.MediaGetPayload<{
    include: {
      detail: true
      audioResources: true
      videoResources: true
      thumbnails: true
      mediaOnAlbum: {
        select: {
          album: true
        }
      }
      mediaOnCategory: {
        select: {
          category: true
        }
      }
    }
  }>
  onSave: Function
}>()

const currentComponent = ref()

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
const isShowInfo = ref<boolean>(false)
const saving = ref<boolean>(false)

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

const handleSubmit = async () => {
  if (currentComponent.value) {
    const ctx = currentComponent.value
    await ctx.validate(mediaInfo.value)
  }
  if (currentStep.value < componentSteps.length - 1) {
    currentStep.value++
  } else {
    if (!mediaInfo.value) return
    saving.value = true
    const request = {
      ...mediaInfo.value,
      description: mediaInfo.value.detail?.description ?? ''
    }
    const res = await requestInstance
      .patch<ResponseSuccess<Media>>(`/studio/media/${mediaInfo.value.id}`, request)
      .finally(() => {
        saving.value = false
      })
    if (res.data.success) {
      message.success(t('save_successful'))
      open.value = false
      props.onSave()
    }
  }
}

const handleBack = () => {
  if (currentStep.value) currentStep.value--
}

watch(
  () => props.pMediaInfo,
  () => {
    mediaInfo.value = props.pMediaInfo
    if (!props.pMediaInfo || props.pMediaInfo.status === 'UPLOADING') {
      isShowInfo.value = false
    } else isShowInfo.value = true
  }
)

const handleChangeFile = async (e: any) => {
  const fileSrc: File = e.file
  const hashFile = await sha256(`${fileSrc.name}_${fileSrc.size}`)

  isUploading.value = true

  if (!mediaInfo.value) {
    const media = await requestInstance
      .post<
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
      .finally(() => {
        isUploading.value = false
      })

    mediaInfo.value = media.data.data
  }

  props.onSave()

  const sessionUpload = await requestInstance.post<ResponseSuccess<SessionUpload>>(
    '/studio/media/create-resumable-upload',
    {
      mediaId: mediaInfo.value.id,
      id: hashFile
    }
  )

  isShowInfo.value = true

  sessionUploadUrl.value = sessionUpload.data.data.sessionUploadUrl as string
  const byteStart = await checkAcceptRange(sessionUploadUrl.value)

  const resumableUpload = createResumableUpload(sessionUploadUrl.value)

  const percent = ref(0)

  notification.open({
    message: () => {
      return createVNode(
        'div',
        {
          class: 'text-sm whitespace-nowrap overflow-hidden text-eclipse'
        },
        mediaInfo.value?.title
      )
    },
    description: () => {
      return createVNode(Progress, {
        percent: percent.value
      })
    },
    duration: 0
  })

  let fileId: string
  await readByChunk(fileSrc, {
    byteStart,
    async onRead(data, totalByte, byteStart) {
      percent.value = Math.floor((byteStart / totalByte) * 100)
      const res: {
        id?: string
      } = await resumableUpload(data, byteStart, totalByte)
      if (res.id) {
        fileId = res.id
      }
    },
    onSuccess() {
      if (fileId) {
        requestInstance.post<ResponseSuccess<Media>>(
          `/studio/media/${mediaInfo.value?.id}/upload-done`,
          {
            fileId
          }
        )
        percent.value = 100
        props.onSave()
      }
    }
  })
}

const openModalConfirm = () => {
  Modal.confirm({
    title: t('confirm'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('confirm_delete_content'),
    okText: t('confirm'),
    cancelText: t('return'),
    onOk: () => {
      if (!mediaInfo.value) return
      return requestInstance
        .delete<ResponseSuccess<Media>>(`/studio/media/${mediaInfo.value.id}`)
        .then((res) => {
          if (res.data.success) {
            message.success(t('delete_successful'))
            open.value = false
            props.onSave()
          }
        })
    }
  })
}
</script>
