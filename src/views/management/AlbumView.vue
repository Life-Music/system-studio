<template>
  <div>
    <div class="text-2xl mb-8 flex justify-between items-center">
      <div>
        {{ $t('album') }}
      </div>
      <div>
        <Button type="primary" @click="newAlbum">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('new_album') }}
        </Button>
      </div>
    </div>
    <Table :columns="columns" :data-source="dataSource" :loading="isLoading">
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'action'">
          <DropdownButton trigger="click" arrow>
            <template #overlay>
              <Menu>
                <Menu.Item @click="edit(record)">
                  {{ $t('edit') }}
                </Menu.Item>
                <Menu.Item danger @click="openModalConfirm(record)">
                  {{ $t('delete') }}
                </Menu.Item>
              </Menu>
            </template>
            {{ $t('table.action') }}
          </DropdownButton>
        </template>
        <template v-else-if="column.dataIndex === 'name'">
          <RouterLink
            class="text-blue-500 hover:text-blue-600"
            :to="{
              name: routerNames.ALBUM_MEDIA,
              params: {
                albumId: record.id
              }
            }"
          >
            {{ text }}
          </RouterLink>
        </template>
        <template v-else-if="column.dataIndex === 'number_media'">
          {{ formatNumber(record._count.mediaOnAlbum) }}
        </template>
        <template v-else-if="column.dataIndex === 'created_at'">
          {{ formatDate(record.created_at) }}
        </template>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </Table>
    <ModalCreateAlbum v-model:open="openModalAlbum" :on-save="loadResource" :album="currentAlbum" />
  </div>
</template>
<script setup lang="ts">
import requestInstance from '@/utils/axios'
import { formatDate, formatNumber } from '@/utils/common'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { Button, DropdownButton, Menu, Modal, Table, message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { ref } from 'vue'
import type { Album } from '~/prisma/generated/mysql'
import { useI18n } from 'vue-i18n'
import ModalCreateAlbum from '@/components/Modal/Album/ModalCreateAlbum.vue'
import { createVNode } from 'vue'
import routerNames from '@/router/routerNames'

const { t } = useI18n()

const columns: ColumnType[] = [
  {
    title: t('table.name'),
    dataIndex: 'name'
  },
  {
    title: t('table.number_arg', { unit: t('song').toLowerCase() }),
    dataIndex: 'number_media'
  },
  {
    title: t('table.created_at'),
    dataIndex: 'created_at'
  },
  {
    title: t('table.action'),
    dataIndex: 'action'
  }
]

const isLoading = ref(false)
const dataSource = ref<Album[]>([])
const openModalAlbum = ref(false)
const currentAlbum = ref<Album>()

const loadResource = async () => {
  isLoading.value = true
  const res = await requestInstance.get<ResponseSuccess<Album[]>>('/studio/album').finally(() => {
    isLoading.value = false
  })
  dataSource.value = res.data.data
}

const newAlbum = async () => {
  openModalAlbum.value = true
  currentAlbum.value = undefined
}

const edit = async (record: any) => {
  currentAlbum.value = record
  openModalAlbum.value = true
}

const openModalConfirm = (album: any) => {
  Modal.confirm({
    title: t('confirm'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('confirm_delete_content'),
    okText: t('confirm'),
    cancelText: t('return'),
    onOk: () => {
      return requestInstance
        .delete<ResponseSuccess<Album>>(`/studio/album/${album.id}`)
        .then((res) => {
          if (res.data.success) {
            message.success(t('delete_successful'))
            loadResource()
          }
        })
    }
  })
}

loadResource()
</script>
