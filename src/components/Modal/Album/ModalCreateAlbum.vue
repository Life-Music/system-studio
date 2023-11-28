<template>
  <Modal v-model:open="open" centered :title="album ? $t('edit_album') : $t('new_album')">
    <template #footer>
      <Button key="back" @click="handleBack">{{ $t('return') }}</Button>
      <Button key="submit" type="primary" @click="handleSubmit" :loading="saving">
        {{ $t('done') }}
      </Button>
    </template>
    <div class="p-6">
      <Form :model="formState" layout="vertical" ref="formRef">
        <FormItem
          :label="$t('album_form.name')"
          name="name"
          :rules="[{ required: true, message: $t('please_type_field') }]"
        >
          <Input v-model:value="formState.name" />
        </FormItem>
        <FormItem :label="$t('album_form.description')" name="description">
          <Textarea v-model:value="formState.description" :rows="4" />
        </FormItem>
      </Form>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import {
  Button,
  Modal,
  Form,
  FormItem,
  Input,
  Textarea,
  message,
  type FormInstance
} from 'ant-design-vue'
import { ref, watch } from 'vue'
import requestInstance from '@/utils/axios'
import { useI18n } from 'vue-i18n'
import type { Album } from '~/prisma/generated/mysql'

const { t } = useI18n()

const open = defineModel('open', {
  default: false
})

const props = defineProps<{
  onSave: Function
  album: Album | undefined
}>()

const formRef = ref<FormInstance>()

const formState = ref({
  name: '',
  description: ''
})

const saving = ref(false)

const handleBack = () => {
  open.value = false
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  saving.value = true
  let handler
  if (props.album) {
    handler = requestInstance.patch(`/studio/album/${props.album.id}`, formState.value)
  } else {
    handler = requestInstance.post('/studio/album', formState.value)
  }
  await handler.finally(() => {
    saving.value = false
  })
  message.success(t('save_successful'))
  open.value = false
  props.onSave()
}

watch(
  () => props.album,
  () => {
    if (!props.album) return
    formState.value.name = props.album.name
    formState.value.description = props.album.description ?? ''
  }
)
</script>
