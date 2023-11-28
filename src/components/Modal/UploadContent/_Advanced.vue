<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('advance_information')
      }}</Divider>
      <Form :model="formState" layout="vertical" ref="formRef">
        <FormItem :label="$t('basic_information_form.lyrics')" name="lyrics">
          <Upload list-type="picture-card">
            <plus-outlined />
            <div>Upload</div>
          </Upload>
        </FormItem>
        <FormItem :label="$t('basic_information_form.category')" name="category">
          <Select
            v-model:value="formState.category"
            style="width: 100%"
            placeholder="Chọn chủ đề..."
            mode="multiple"
            :max-tag-count="3"
            :options="categories"
            :filter-option="false"
            show-search
            @search="searchCategory"
            :not-found-content="categoryFetching ? undefined : null"
          >
            <template v-if="categoryFetching" #notFoundContent>
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
import { Divider, Form, FormItem, Upload, Select, Spin } from 'ant-design-vue'
import { ref } from 'vue'
import type { Prisma } from '~/prisma/generated/mysql'
import { PlusOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import requestInstance from '@/utils/axios'
import { watch } from 'vue'

type propType =
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
        mediaOnCategory: {
          select: {
            category: true
          }
        }
      }
    }> & {
      albumId: string
      categoryIds: string[]
    })
  | undefined

const props = defineProps<{
  mediaInfo: propType
}>()

const formState = ref<Record<string, any>>({
  category: []
})

const formRef = ref()
const categoryFetching = ref(false)
const categories = ref<
  {
    value: string
    label: string
  }[]
>([])

watch(
  () => props.mediaInfo,
  () => {
    if (props.mediaInfo) {
      formState.value = {
        category: props.mediaInfo.mediaOnCategory.map(({ category }) => {
          return category.id
        })
      }
      categories.value = props.mediaInfo.mediaOnCategory.map(({ category }) => {
        return {
          label: category.name,
          value: category.id
        }
      })
    }
  },
  {
    immediate: true
  }
)

const validate = (formData: NonNullable<propType>) => {
  return formRef.value.validate().then(() => {
    formData.categoryIds = formState.value.category
  })
}

let controller: AbortController
const searchCategory = debounce((value: string) => {
  if (controller) controller.abort()
  controller = new AbortController()
  categoryFetching.value = true
  categories.value = []
  requestInstance
    .get<ResponseSuccess<any>>('/category/search', {
      signal: controller.signal,
      params: {
        q: value
      }
    })
    .then((res) => {
      categories.value = res.data.data.map((category: any) => ({
        label: category._source.name,
        value: category._source.id
      }))
    })
    .finally(() => {
      categoryFetching.value = false
    })
}, 300)

defineExpose({
  validate
})
</script>
