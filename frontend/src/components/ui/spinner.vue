<template>
  <div
    :class="[
      'animate-spin rounded-full border-4 border-gray-200',
      sizeClasses[props.size ?? 'md'],
      'border-t-blue-600'
    ]"
  ></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>();

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};
</script> 