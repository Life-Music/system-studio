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
      <template v-else>
        <UploadDragger
          name="file"
          @change="handleChangeFile"
          class="min-h-[300px] flex items-center"
        >
          <p class="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p class="ant-upload-text">{{ $t('click_or_drag_come_here') }}</p>
          <p class="ant-upload-hint">
            {{ $t('support_file_des') }}
          </p>
        </UploadDragger>
      </template>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { Modal, Steps, Button, UploadDragger } from 'ant-design-vue'
import { ref, defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import Basic from './_Basic.vue'
import Advanced from './_Advanced.vue'
import ViewMode from './_ViewMode.vue'
import type { Media } from '~/prisma/generated/mysql'
import { computed } from 'vue'

const open = defineModel<boolean>('open')

const { t } = useI18n()
const currentStep = ref(0)
const mediaInfo = ref<Media | null>({
  id: '1',
  createdAt: new Date(),
  duration: 170,
  lockedAt: null,
  status: 'UPLOADING',
  title: 'Video 2023 06 17 214436',
  updatedAt: new Date(),
  userId: 1,
  views: 1,
  view_mode: 'PRIVATE'
})
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

const handleChangeFile = (e: any) => {
  const file = e.fileList[0]
  const fileSrc: File = file.originFileObj
  // mediaInfo.value = {}
}
</script>
