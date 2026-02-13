<template>
  <nav class="tc-navbar" role="navigation" aria-label="Main">
    <div class="tc-container nav-inner">
      <div class="nav-left">
        <TcButton
          v-if="canGoBack"
          variant="ghost"
          size="sm"
          class="nav-back-btn"
          @click="goBack"
          aria-label="뒤로가기"
        >
          <span class="chevron" aria-hidden="true">‹</span>
        </TcButton>
      </div>
      <div class="nav-center">
        <TcLogo
          variant="basic"
          size="sm"
          :animated="false"
          :clickable="true"
          @click="goHome"
        />
      </div>
      <div class="nav-right">
        <!-- 향후 액션을 위한 자리 -->
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { TcButton, TcLogo } from '@/components/common/ui';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import './TcNavBar.scss';

const router = useRouter();
const route = useRoute();
const canGoBack = computed(
  () => window.history.length > 1 && route.fullPath !== '/main'
);

const goBack = () => {
  if (canGoBack.value) router.back();
  else router.push({ name: 'main' });
};

const goHome = () => {
  router.push({ name: 'main' });
};
</script>
