<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      props.variant ? variantClasses[props.variant] : ''
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'danger'
}>();

const variantClasses = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800'
};
</script> 