<template>
  <div class="tc_layout flow-root">
    <Suspense>
      <template #default>
        <ThinkingProcess :auto-start="false" />
      </template>
      <template #fallback>
        <div style="text-align: center; padding: 48px 0">로딩 중...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import "./ThinkingFlow.scss";

const ThinkingProcess = defineAsyncComponent(
  () => import("@/components/thinking/ThinkingProcess.vue")
);
</script>
