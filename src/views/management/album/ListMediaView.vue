<template>
  <div>
    <div class="text-2xl mb-8 flex justify-between items-center">
      <div>
        {{ $t('album') }}
      </div>
    </div>
    <Table :columns="columns" :data-source="dataSource" :loading="isLoading">
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'name'">
          {{ record.media.title }}
        </template>
        <template v-if="column.dataIndex === 'created_at'">
          {{ formatDate(record.media.created_at) }}
        </template>
        <template v-if="column.dataIndex === 'action'">
          <DropdownButton trigger="click" arrow>
            <template #overlay>
              <Menu>
                <Menu.Item danger @click="handleDelete(record)">
                  {{ $t('delete_from_arg', { arg: 'album' }) }}
                </Menu.Item>
              </Menu>
            </template>
            {{ $t('table.action') }}
          </DropdownButton>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </Table>
  </div>
</template>
<script lang="ts" setup>
import requestInstance from '@/utils/axios'
import { formatDate } from '@/utils/common'
import { Table, DropdownButton, Menu, message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { Prisma } from '~/prisma/generated/mysql'

const { t } = useI18n()

const route = useRoute()

type resourceType = Prisma.MediaOnAlbumGetPayload<{
  select: {
    media: true
    albumId: true
  }
}>

const dataSource = ref<resourceType[]>([])

const columns: ColumnType[] = [
  {
    title: t('table.name_arg', { arg: t('song').toLowerCase() }),
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: t('table.created_at'),
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: t('table.action'),
    dataIndex: 'action',
    key: 'action'
  }
]

const isLoading = ref(false)

const loadResource = async () => {
  isLoading.value = true
  requestInstance
    .get<ResponseSuccess<resourceType[]>>(`/studio/album/${route.params.albumId}`)
    .then((res) => {
      dataSource.value = res.data.data
    })
    .finally(() => {
      isLoading.value = false
    })
}

loadResource()

const handleDelete = async (item: any) => {
  isLoading.value = true
  await requestInstance.delete(`/studio/album/${item.albumId}/${item.media.id}`).then(() => {
    message.success(t('delete_successful'))
  })
  loadResource()
}
</script>
