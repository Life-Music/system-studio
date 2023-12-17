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
          {{ $t('new_upload') }}
        </Button>
      </div>
    </div>
    <Table :columns="columns" :data-source="dataSource" :loading="isLoading">
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'title'">
          <div class="text-blue-500 cursor-pointer font-semibold" @click="openModalEdit(record)">
            <div class="flex gap-x-5 items-center">
              <div class="flex-shrink-0">
                <img class="w-10 aspect-square rounded-lg" :src="getThumbnailUrlPrimary(record.thumbnails)" />
              </div>
              <div>{{ text }}</div>
            </div>
          </div>
        </template>
        <template v-if="column.dataIndex === 'created_at'">
          {{ formatDate(record.publishedAt ?? text) }}
        </template>
        <template v-if="column.dataIndex === 'plays'">
          {{ formatNumber(text) }}
        </template>
        <template v-if="column.dataIndex === 'number_comment'">
          {{ formatNumber(record._count.comment) }}
        </template>
      </template>
    </Table>
    <ModalUploadContent v-model:open="isOpenModalUploadContent" :p-media-info="currentMedia" :on-save="loadResource" />
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
import { formatDate, formatNumber, getThumbnailUrlPrimary } from '@/utils/common'

const { t } = useI18n()
const isOpenModalUploadContent = ref(false)
const currentMedia = ref<
  | Prisma.MediaGetPayload<{
    include: {
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

const openModalEdit = (record: any) => {
  isOpenModalUploadContent.value = true
  currentMedia.value = record
}

const columns = ref<ColumnType[]>([
  {
    title: t('song'),
    dataIndex: 'title',
    key: 'title',
    width: 400
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
    key: 'created_at'
  },
  {
    title: t('number_view'),
    dataIndex: 'plays',
    key: 'plays'
  },
  {
    title: t('number_comment'),
    dataIndex: 'number_comment',
    key: 'number_comment'
  },
  {
    title: t('like', { unit: '' }),
    dataIndex: 'like',
    key: 'like',
    customRender({ record }) {
      return formatNumber(record._count.mediaReaction)
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
