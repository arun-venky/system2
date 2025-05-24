<template>
  <button
    :class="[
      'btn',
      variantClass,
      sizeClass,
      { 'w-full': fullWidth },
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'accent', 'success', 'danger', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const variantClass = computed(() => ({
  'btn-primary': props.variant === 'primary',
  'btn-secondary': props.variant === 'secondary',
  'btn-accent': props.variant === 'accent',
  'btn-success': props.variant === 'success',
  'btn-danger': props.variant === 'danger',
  'btn-ghost': props.variant === 'ghost'
}))

const sizeClass = computed(() => ({
  'text-sm px-3 py-1.5': props.size === 'sm',
  'text-base px-4 py-2': props.size === 'md',
  'text-lg px-6 py-3': props.size === 'lg'
}))
</script> 