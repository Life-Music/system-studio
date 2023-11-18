<template>
  <div>
    <div class="text-2xl mb-8 flex justify-between items-center">
      <div>
        {{ $t('content_full') }}
      </div>
      <div>
        <Button type="primary" @click="newUpload">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          Tải lên mới
        </Button>
      </div>
    </div>
    <Table :columns="columns" :data-source="dataSource" :loading="isLoading"></Table>
    <ModalUploadContent
      v-model:open="isOpenModalUploadContent"
      :p-media-info="currentMedia"
      :on-save="loadResource"
    />
  </div>
</template>
<script setup lang="ts">
import { Table, Button } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import ModalUploadContent from '@/components/Modal/UploadContent/ModalUploadContent.vue'
import requestInstance from '@/utils/axios'
import type { Prisma } from '~/prisma/generated/mysql'
import { formatDate, formatNumber } from '@/utils/common'
import { h } from 'vue'

const { t } = useI18n()
const isOpenModalUploadContent = ref(false)
const currentMedia = ref<
  | Prisma.MediaGetPayload<{
      include: {
        detail: true
        audioResources: true
        videoResources: true
        thumbnails: true
      }
    }>
  | undefined
>()
const isLoading = ref<boolean>(true)

const newUpload = () => {
  isOpenModalUploadContent.value = true
  currentMedia.value = undefined
}

const columns = ref<ColumnType[]>([
  {
    title: t('song'),
    dataIndex: 'title',
    key: 'title',
    customRender({ text, record }) {
      return h(
        'div',
        {
          class: 'text-blue-500 cursor-pointer font-semibold',
          onClick() {
            isOpenModalUploadContent.value = true
            currentMedia.value = record
          }
        },
        text
      )
    }
  },
  {
    title: t('view_mode'),
    dataIndex: 'viewMode',
    key: 'viewMode'
  },
  {
    title: t('restrict'),
    dataIndex: 'restrict',
    key: 'restrict'
  },
  {
    title: t('date_publish'),
    dataIndex: 'created_at',
    key: 'created_at',
    customRender({ text, record }) {
      return formatDate(record.publishedAt ?? text)
    }
  },
  {
    title: t('number_view'),
    dataIndex: 'views',
    key: 'views',
    customRender({ text }) {
      return formatNumber(text)
    }
  },
  {
    title: t('number_comment'),
    dataIndex: 'number_comment',
    key: 'number_comment',
    customRender({ record }) {
      return formatNumber(record._count.Comment)
    }
  },
  {
    title: t('like', { unit: '%' }),
    dataIndex: 'like',
    key: 'like',
    customRender({ record }) {
      return formatNumber(record._count.MediaReaction)
    }
  }
])
const dataSource = ref<
  Prisma.MediaGetPayload<{
    include: {
      detail: true
      audioResources: true
      videoResources: true
      thumbnails: true
    }
  }>[]
>([])

const loadResource = async () => {
  isLoading.value = true
  const res = await requestInstance
    .get<
      ResponseSuccessPagination<
        Prisma.MediaGetPayload<{
          include: {
            detail: true
            audioResources: true
            videoResources: true
            thumbnails: true
          }
        }>[]
      >
    >('/studio/media')
    .finally(() => {
      isLoading.value = false
    })
  dataSource.value = res.data.data
}

loadResource()
</script>
