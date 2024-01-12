<template>
  <div class=" p-7 rounded-lg space-y-4 text-white text-lg" :class="[active ? 'bg-blue-700' : 'bg-blue-400']">
    <div class="flex gap-x-4">
      <div>****</div>
      <div>****</div>
      <div>****</div>
      <div>{{ props.last4Digits }}</div>
    </div>
    <div class="flex justify-between items-center">
      <div>
        {{ cardExp }}
      </div>
      <div class="uppercase font-bold">
        {{ cardBrand }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  last4Digits: string | number,
  cardBrand: string,
  cardExp: string,
  active?: boolean,
}>()

</script>