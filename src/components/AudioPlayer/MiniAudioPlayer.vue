<template>
  <div class="p-2 rounded-xl flex gap-x-4 items-center bg-music-gradient pr-6 text-sm fill-white">
    <div
      class="bg-no-repeat bg-cover bg-center rounded-lg w-14 aspect-square flex-auto flex-shrink-0"
      :style="`background-image: url('${props.thumbnail}')`"
    ></div>
    <div class="space-y-1 mr-auto">
      <div class="line-clamp-2">{{ props.name }}</div>
      <div>{{ props.artist.name }}</div>
    </div>
    <div>
      {{ currentTime }}
    </div>
    <LoadingOutlined v-if="isLoading" />
    <PauseOutlined v-else-if="isPlaying" @click="togglePlay()" />
    <PlayCircleOutlined v-else @click="togglePlay()" />
  </div>
</template>
<script setup lang="ts">
import { convertDuration } from '@/utils/common'
import { ref } from 'vue'
import { PauseOutlined, PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { watch } from 'vue'
import { onBeforeMount } from 'vue'
const props = withDefaults(
  defineProps<{
    thumbnail: string
    name: string
    artist: {
      name: string
    }
    source: string
    duration?: number
  }>(),
  {
    duration: 0
  }
)

const currentTime = ref('00:00')

const isLoading = ref(false)

const isPlaying = ref(false)

let audio = ref<HTMLAudioElement | null>(null)

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    if (!audio.value) {
      audio.value = new Audio(props.source)
      audio.value.addEventListener('stalled', () => {
        isLoading.value = true
      })
      audio.value.addEventListener('playing', () => {
        isLoading.value = false
      })
      audio.value.addEventListener('timeupdate', () => {
        if (!audio.value) return
        currentTime.value = convertDuration(audio.value.currentTime)
      })
    }
    audio.value.play()
  } else {
    if (audio.value) audio.value.pause()
  }
}

watch(
  () => props.source,
  () => {
    audio.value?.pause()
    audio.value = null
    currentTime.value = '00:00'
  }
)

onBeforeMount(() => {
  audio.value?.pause()
  console.log('OK')
})

defineExpose({
  audio
})
</script>
