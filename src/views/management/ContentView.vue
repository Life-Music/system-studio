<template>
  <div>
    <div class="text-2xl mb-8 flex justify-between items-center">
      <div>
        {{ $t('content_full') }}
      </div>
      <div>
        <Button type="primary" @click="isOpenModalUploadContent = true">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          Tải lên mới
        </Button>
      </div>
    </div>
    <Table :columns="columns" :data-source="dataSource"></Table>
    <ModalUploadContent v-model:open="isOpenModalUploadContent" />
  </div>
</template>
<script setup lang="ts">
import { Table, Button } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import ModalUploadContent from '@/components/Modal/UploadContent/ModalUploadContent.vue'

const { t } = useI18n()
const isOpenModalUploadContent = ref(false)
const columns = ref<ColumnType[]>([
  {
    title: t('song'),
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: t('view_mode'),
    dataIndex: 'view_mode',
    key: 'view_mode'
  },
  {
    title: t('restrict'),
    dataIndex: 'restrict',
    key: 'restrict'
  },
  {
    title: t('date_publish'),
    dataIndex: 'date_publish',
    key: 'date_publish'
  },
  {
    title: t('number_view'),
    dataIndex: 'number_view',
    key: 'number_view'
  },
  {
    title: t('number_comment'),
    dataIndex: 'number_comment',
    key: 'number_comment'
  },
  {
    title: t('like', { unit: '%' }),
    dataIndex: 'like',
    key: 'like'
  }
])
const dataSource = ref([])
</script>
