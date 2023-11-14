<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('basic_information')
      }}</Divider>
      <Form :model="mediaInfo" layout="vertical">
        <FormItem
          :label="$t('basic_information_form.title')"
          name="title"
          :rules="[{ required: true, message: $t('please_type_field') }]"
        >
          <Input v-model:value="formState.title" />
        </FormItem>
        <FormItem
          :label="$t('basic_information_form.description')"
          name="description"
          :rules="[{ required: true, message: $t('please_type_field') }]"
        >
          <Textarea v-model:value="formState.description" :rows="4" />
        </FormItem>
        <FormItem :label="$t('basic_information_form.thumbnail')" name="thumbnail" v-if="fileList">
          <Upload v-model:file-list="fileList" list-type="picture-card">
            <div v-if="fileList.length < 4">
              <plus-outlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </Upload>
        </FormItem>
        <FormItem :label="$t('basic_information_form.album')" name="album">
          <Select
            v-model:value="formState.album"
            mode="multiple"
            style="width: 100%"
            placeholder="Select Item..."
            :max-tag-count="3"
            :options="[]"
          >
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
import { Divider, Form, FormItem, Input, Textarea, Upload, Select } from 'ant-design-vue'
import { ref } from 'vue'
import { defineModel } from 'vue'
import type { Media, Prisma } from '~/prisma/generated/mysql'
import type { UploadProps } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const mediaInfo = defineModel<
  Prisma.MediaGetPayload<{
    include: {
      detail: true
    }
  }>
>('mediaInfo', {
  required: true
})
const formState = ref<Record<string, any>>({})

const fileList = ref<UploadProps['fileList']>([])
</script>
