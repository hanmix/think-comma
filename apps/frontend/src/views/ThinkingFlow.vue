<template>
  <div class="tc_layout flow-root">
    <ThinkingProcess :auto-start="false" />
  </div>
</template>

<script setup lang="ts">
import { ThinkingProcess } from '@/components/thinking';
import './ThinkingFlow.scss';
</script>
