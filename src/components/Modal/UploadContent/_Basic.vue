<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('basic_information')
      }}</Divider>
      <Form :model="formState" layout="vertical" ref="formRef">
        <FormItem :label="$t('basic_information_form.title')" name="title"
          :rules="[{ required: true, message: $t('please_type_field') }]">
          <Input v-model:value="formState.title" />
        </FormItem>
        <FormItem :label="$t('basic_information_form.description')" name="description"
          :rules="[{ required: true, message: $t('please_type_field') }]">
          <Textarea v-model:value="formState.description" :rows="4" />
        </FormItem>
        <div class="flex gap-x-3">
          <div class="flex-auto">
            <FormItem :label="$t('basic_information_form.thumbnail')" name="thumbnail" v-if="formState.thumbnail">
              <Upload v-model:file-list="formState.thumbnail" list-type="picture-card" :custom-request="handleChangeFile"
                name="file" accept="image/*">
                <div v-if="formState.thumbnail.length < 4">
                  <plus-outlined />
                  <div style="margin-top: 8px">Upload</div>
                </div>
                <template #itemRender="{ originNode, file }">
                  <div class="relative" @click="handleSetThumbnail(file)">
                    <component :is="originNode" />
                    <div class="absolute right-3 top-2">
                      <Tooltip :title="$t('set_thumbnail_primary')">
                        <Checkbox :checked="formState.thumbnailPrimaryId === file.uid"
                          @change="handleSetThumbnail(file)" />
                      </Tooltip>
                    </div>
                  </div>
                </template>
              </Upload>
            </FormItem>
          </div>
          <div class="max-w-[350px]">
            <div class="mb-2 text-right w-full">{{ $t('preview') }}</div>
            <MiniAudioPlayer :artist="{
              name: ''
            }" :name="formState.title" :source="formState.source" :thumbnail="getThumbnailUrlPrimary(mediaInfo?.thumbnails ?? [], formState.thumbnailPrimaryId)
  " v-if="formState.source" />
          </div>
        </div>
        <FormItem :label="$t('basic_information_form.album')" name="album">
          <Select v-model:value="formState.album" style="width: 100%" placeholder="Chọn album..." :options="albums"
            :filter-option="false" show-search @search="searchAlbum"
            :not-found-content="albumFetching ? undefined : null">
            <template v-if="albumFetching" #notFoundContent>
              <Spin size="small" />
            </template>
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
import {
  Divider,
  Form,
  FormItem,
  Input,
  Textarea,
  Upload,
  Select,
  Spin,
  Checkbox,
  Tooltip
} from 'ant-design-vue'
import { ref } from 'vue'
import type { Prisma, Thumbnail } from '~/prisma/generated/mysql'
import type { UploadProps } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { watch } from 'vue'
import MiniAudioPlayer from '@/components/AudioPlayer/MiniAudioPlayer.vue'
import { getAudioSource, getThumbnailUrlPrimary } from '@/utils/common'
import { debounce } from 'lodash-es'
import requestInstance from '@/utils/axios'

const props = defineProps<{
  mediaInfo:
  | (Prisma.MediaGetPayload<{
    include: {
      detail: true
      thumbnails: true
      audioResources: true
      videoResources: true
      mediaOnAlbum: {
        select: {
          album: true
        }
      }
    }
  }> & {
    albumId: string
  })
  | undefined
}>()

const handleSetThumbnail = (e: any) => {
  formState.value.thumbnailPrimaryId = e.uid
}

const handleChangeFile = async (e: any) => {
  const fileSrc: File = e.file
  const url = `/studio/media/${props.mediaInfo?.id}/thumbnail/upload`
  const formData = new FormData()
  formData.append('file', fileSrc)
  const res = await requestInstance.post<ResponseSuccess<Thumbnail>>(url, formData, {
    onUploadProgress(progressEvent) {
      if (!progressEvent.total) return
      e.onProgress({
        percent: Math.round((progressEvent.loaded * 100) / progressEvent.total)
      })
    }
  })
  e.onSuccess(res.data.data, res.request)
}

const formState = ref<{
  title: string
  description: string
  thumbnail: UploadProps['fileList']
  album: string
  source: string
  thumbnailPrimaryId: string
}>({
  title: '',
  description: '',
  thumbnail: [],
  album: '',
  source: '',
  thumbnailPrimaryId: ''
})

const albumFetching = ref(false)
const albums = ref<
  {
    value: string
    label: string
  }[]
>([])

watch(
  () => props.mediaInfo,
  () => {
    if (!props.mediaInfo) {
      formState.value = {
        title: '',
        description: '',
        thumbnail: [],
        album: '',
        source: '',
        thumbnailPrimaryId: ''
      }
      return
    }
    formState.value.title = props.mediaInfo.title
    formState.value.description = props.mediaInfo.detail?.description ?? ''
    if (props.mediaInfo.audioResources[0])
      formState.value.source = getAudioSource(props.mediaInfo.audioResources[0].id)
    if (props.mediaInfo.mediaOnAlbum[0]) {
      formState.value.album = props.mediaInfo.mediaOnAlbum[0].album.id
      albums.value = [
        {
          label: props.mediaInfo.mediaOnAlbum[0].album.name,
          value: props.mediaInfo.mediaOnAlbum[0].album.id
        }
      ]
    }
    else formState.value.album = ''
    formState.value.thumbnail = props.mediaInfo.thumbnails.map((th) => {
      if (th.isPrimary) formState.value.thumbnailPrimaryId = th.id
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
  }> & {
    albumId?: string
    thumbnailId: string
  }
) => {
  return formRef.value.validate().then(() => {
    formData.title = formState.value.title.trim()
    if (formData.detail) formData.detail.description = formState.value.description.trim()
    formData.albumId = formState.value.album
    if (formState.value.thumbnailPrimaryId) {
      formData.thumbnailId = formState.value.thumbnailPrimaryId
    }
  })
}
let controller: AbortController
const searchAlbum = debounce((value: string) => {
  if (controller) controller.abort()
  controller = new AbortController()
  albumFetching.value = true
  albums.value = []
  requestInstance
    .get<ResponseSuccess<any>>('/album/search', {
      signal: controller.signal,
      params: {
        q: value
      }
    })
    .then((res) => {
      albums.value = res.data.data.map((album: any) => ({
        label: album._source.name,
        value: album._source.id
      }))
    })
    .finally(() => {
      albumFetching.value = false
    })
}, 300)

defineExpose({
  validate
})
</script>
