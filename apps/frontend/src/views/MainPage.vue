<template>
  <div class="tc-container">
    <header class="hero-section">
      <h1 class="tc-heading-1 hero-heading">
        Think<span class="tc-comma-highlight">,</span> 고민을 간단하게
      </h1>
      <p class="tc-body-text hero-description tc-readable">
        <span class="tc-text-muted"
          >ThinkComma는 복잡한 고민을 구조화하고, 상황 맞춤형 질문과 분석을 통해
          오늘 바로 실행 가능한 해결책을 제시합니다.
        </span>
      </p>
      <div class="hero-actions">
        <TcButton variant="primary" size="lg" @click="handleGetStarted"
          >3분 만에 고민 해결하기</TcButton
        >
      </div>
    </header>

    <section class="features-section">
      <h2 class="tc-heading-2">3시간 → 3분, 어떻게 가능할까요?</h2>
      <div class="features-grid">
        <TcCard
          variant="primary"
          title="🧠 고민 구조화"
          subtitle="복잡한 고민을 간단한 요소로 분해"
          :hoverable="true"
        >
          <p class="tc-readable">
            머릿속 복잡한 고민을 5단계 프레임워크로 정리합니다. 무엇이 진짜
            문제인지 명확하게 파악하세요.
          </p>
          <div class="tc-text-muted tc-mt-2">평균 1분 소요</div>
        </TcCard>

        <TcCard
          variant="secondary"
          title="⚡ AI 솔루션 생성"
          subtitle="맞춤형 해결책 즉시 제공"
          :hoverable="true"
        >
          <p class="tc-readable">
            구조화된 고민을 바탕으로 AI가 실행 가능한 3가지 해결책을 제시합니다.
          </p>
          <div class="tc-text-muted tc-mt-2">평균 1분 소요</div>
        </TcCard>

        <TcCard
          variant="info"
          title="✅ 행동계획 수립"
          subtitle="오늘 당장 실행할 수 있는 단계별 가이드"
          :hoverable="true"
        >
          <p class="tc-readable">
            선택한 해결책을 구체적인 행동 단계로 변환합니다. 더 이상 막막하지
            않아요.
          </p>
          <div class="tc-text-success tc-mt-2">
            ✨ 평균 1분 소요 → 총 3분 완성!
          </div>
        </TcCard>
      </div>
    </section>

    <section class="stats-section">
      <TcCard variant="success" size="lg">
        <template #header>
          <h2 class="tc-heading-2">📊 실제 사용자들의 고민 해결 시간</h2>
          <p class="tc-small-text">ThinkComma를 사용하기 전과 후 비교</p>
        </template>

        <div class="stats-grid">
          <div class="stat-item">
            <h4 class="tc-text-primary">진로 고민</h4>
            <div class="time-comparison">
              <span class="before">이전: 5일 → </span
              ><span class="after">현재: 20분</span>
            </div>
            <p class="tc-small-text tc-text-muted">
              머릿속이 정리되니 답이 보였어요
            </p>
          </div>

          <div class="stat-item">
            <h4 class="tc-text-secondary">연애 고민</h4>
            <div class="time-comparison">
              <span class="before">이전: 2주 → </span
              ><span class="after">현재: 12분</span>
            </div>
            <p class="tc-small-text tc-text-muted">
              객관적으로 정리하니 결정할 수 있었어요
            </p>
          </div>

          <div class="stat-item">
            <h4 class="tc-text-navy">창업 아이디어</h4>
            <div class="time-comparison">
              <span class="before">이전: 3개월 → </span
              ><span class="after">현재: 30분</span>
            </div>
            <p class="tc-small-text tc-text-muted">
              이제 체계적으로 평가할 수 있어요
            </p>
          </div>

          <div class="stat-item">
            <h4 class="tc-text-error">이직 결정</h4>
            <div class="time-comparison">
              <span class="before">이전: 6개월 → </span
              ><span class="after">현재: 25분</span>
            </div>
            <p class="tc-small-text tc-text-muted">
              3분만에 명확한 계획을 세울 수 있었어요
            </p>
          </div>
        </div>
      </TcCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard } from '@/components/ui';
import { useRouter } from 'vue-router';
import './MainPage.scss';

const router = useRouter();

const handleGetStarted = () => {
  router.push({ name: 'flow-input' });
};
</script>
