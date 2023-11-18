<template>
  <div>
    <div class="mb-4 text-lg">
      <Divider orientation="left" style="border-color: #bdbdbd; font-size: inherit">{{
        $t('advance_information')
      }}</Divider>
      <Form :model="mediaInfo" layout="vertical" ref="formRef">
        <FormItem :label="$t('basic_information_form.lyrics')" name="lyrics">
          <Upload list-type="picture-card">
            <plus-outlined />
            <div>Upload</div>
          </Upload>
        </FormItem>
        <FormItem :label="$t('basic_information_form.category')" name="category">
          <Select
            v-model:value="formState.category"
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
import { Divider, Form, FormItem, Upload, Select } from 'ant-design-vue'
import { ref } from 'vue'
import { defineModel } from 'vue'
import type { Media } from '~/prisma/generated/mysql'
import { PlusOutlined } from '@ant-design/icons-vue'

const mediaInfo = defineModel<Media>('mediaInfo', {
  required: true
})
const formState = ref<Record<string, any>>({})

const formRef = ref()

const validate = () => {
  return formRef.value.validate()
}

defineExpose({
  validate
})
</script>
