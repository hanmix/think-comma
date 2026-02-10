<template>
  <div class="tc-container" style="padding-top: 64px; padding-bottom: 64px">
    <header
      style="
        text-align: center;
        margin-bottom: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "
    >
      <h1 class="tc-heading-1 hero-heading">
        Think<span class="tc-comma-highlight">,</span> 고민을 3분으로
      </h1>
      <p
        class="tc-body-text tc-text-muted tc-readable"
        style="margin-top: 12px; text-align: center"
      >
        ThinkComma는 복잡한 고민을 구조화하고, 상황 맞춤형 질문과 분석을 통해
        오늘 바로 실행 가능한 해결책을 제시합니다. 아래 버튼을 눌러
        확인해보세요.
      </p>
    </header>

    <div
      style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap"
    >
      <TcButton
        variant="primary"
        size="lg"
        @click="resolveProblem"
        @pointerdown="prefetchExampleOnIntent"
        @keydown.enter="prefetchExampleOnIntent"
        @keydown.space.prevent="prefetchExampleOnIntent"
      >
        고민 해결하러 가기
      </TcButton>
      <TcButton
        variant="outline"
        size="lg"
        @click="goDesign"
        @pointerdown="prefetchDesignOnIntent"
        @keydown.enter="prefetchDesignOnIntent"
        @keydown.space.prevent="prefetchDesignOnIntent"
      >
        디자인 시스템 보기
      </TcButton>
    </div>

    <div class="section-divider" role="separator" aria-hidden="true"></div>

    <!-- 핵심 가치 제안 요약 섹션 (브랜드 메시지 개편) -->
    <section class="features-section">
      <h2 class="tc-heading-2 section-heading">
        끊임없는 고민에<span class="tc-comma-highlight">,</span> 작은 쉼표
        하나면 충분해요
      </h2>

      <ul class="sub-messages">
        <li>“고민 마침표가 아닌, 고민 쉼표를”</li>
        <li>“잠깐, 고민에 쉼표 좀 찍고 갈게요”</li>
        <li>“복잡한 마음도, 쉼표 하나면 정리돼요”</li>
        <li>“고민의 문장, 함께 완성해 나가요”</li>
      </ul>

      <div class="sub-divider" role="separator" aria-hidden="true"></div>

      <p class="flow-caption tc-small-text tc-text-muted">
        질문 시작 → 진행 중 → 결과 화면 → 완료 후
      </p>

      <div class="flow-grid">
        <TcCard
          variant="primary"
          title="1️⃣ 질문 시작"
          subtitle="마음속 이야기, 들려주세요"
          :hoverable="false"
        />

        <TcCard
          variant="secondary"
          title="2️⃣ 진행 중"
          subtitle="차근차근, 하나씩 풀어가요"
          :hoverable="false"
        />

        <TcCard
          variant="info"
          title="3️⃣ 결과 화면"
          subtitle="여기 당신만의 답이 있어요"
          :hoverable="false"
        />

        <TcCard
          variant="success"
          title="4️⃣ 완료 후"
          subtitle="이제 다음 문장을 시작해보세요"
          :hoverable="false"
        />
      </div>
    </section>

    <div
      class="section-divider section-divider--end"
      role="separator"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard } from '@/components/ui';
import { useRouter } from 'vue-router';
import './HomePage.scss';

const router = useRouter();
const resolveProblem = () => router.push({ name: 'main' });
const goDesign = () => router.push({ name: 'design' });

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

const shouldPrefetch = (): boolean => {
  const conn = (navigator as any).connection as NetworkInformation | undefined;
  if (!conn) return true; // 네트워크 정보를 알 수 없으면 허용
  if (conn.saveData) return false; // 데이터 절약 모드 존중
  const slowTypes = new Set(['slow-2g', '2g']);
  if (conn.effectiveType && slowTypes.has(conn.effectiveType)) return false;
  return true;
};

const prefetchExampleOnIntent = () => {
  if (!shouldPrefetch()) return;
  // 사용자 의도 감지 시 라우트와 무거운 컴포넌트 프리패치
  void import('@/views/MainPage.vue');
  void import('@/components/thinking/ThinkingProcess.vue');
};

const prefetchDesignOnIntent = () => {
  if (!shouldPrefetch()) return;
  void import('@/views/DesignSystem.vue');
};
</script>
