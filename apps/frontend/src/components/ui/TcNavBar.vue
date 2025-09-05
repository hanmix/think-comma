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
        <!-- Reserved for future actions -->
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { TcButton, TcLogo } from "@/components/ui";
import { useRouter } from "vue-router";
import { useNavStack } from "@/composables/useNavStack";
import "./TcNavBar.scss";

const router = useRouter();
const { canGoBack, pop, popToRoot } = useNavStack();

const goBack = () => {
  if (canGoBack.value) pop();
  else router.push({ name: "home" });
};

const goHome = () => {
  // 앱스러운 동작: 현재 스택을 루트(홈)까지 pop
  popToRoot();
};
</script>
