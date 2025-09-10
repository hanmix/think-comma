<template>
  <div class="tc-container">
    <header class="ds-header">
      <h1 class="tc-heading-1">ThinkComma Design System</h1>
      <p class="tc-text-muted tc-readable">
        컴포넌트, 타이포그래피, 브랜드 로고 쇼케이스
      </p>
    </header>

    <!-- Buttons Showcase -->
    <section class="ds-section">
      <h2 class="tc-heading-2">Buttons</h2>
      <div class="row">
        <div class="group">
          <div class="group-title">Variants</div>
          <div class="items">
            <TcButton variant="primary">Primary</TcButton>
            <TcButton variant="secondary">Secondary</TcButton>
            <TcButton variant="outline">Outline</TcButton>
            <TcButton variant="ghost">Ghost</TcButton>
          </div>
        </div>
        <div class="group">
          <div class="group-title">Sizes</div>
          <div class="items">
            <TcButton size="sm">Small</TcButton>
            <TcButton size="md">Medium</TcButton>
            <TcButton size="lg">Large</TcButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Cards Showcase -->
    <section class="ds-section">
      <h2 class="tc-heading-2">Cards</h2>
      <div class="cards-grid">
        <TcCard title="Default Card" :hoverable="true">
          <p>콘텐츠를 담는 기본 카드 컴포넌트입니다.</p>
        </TcCard>
        <TcCard
          variant="primary"
          title="Primary"
          subtitle="브랜드 프라이머리"
          :hoverable="true"
        >
          <p>중요한 정보를 강조합니다.</p>
        </TcCard>
        <TcCard
          variant="secondary"
          title="Secondary"
          subtitle="보조 강조"
          :hoverable="true"
        >
          <p>보조 정보의 강조에 적합합니다.</p>
        </TcCard>
        <TcCard
          variant="info"
          title="Info"
          subtitle="안내/정보"
          :hoverable="true"
        >
          <p>정보성 메시지에 적합합니다.</p>
        </TcCard>
      </div>
    </section>

    <!-- Inputs Showcase -->
    <section class="ds-section">
      <h2 class="tc-heading-2">Inputs</h2>
      <div class="inputs-row">
        <TcInput
          label="이메일"
          type="email"
          placeholder="you@example.com"
          required
        />
        <TcInput label="이름" placeholder="홍길동" />
        <TcInput label="검색" type="search" placeholder="검색어를 입력하세요" />
      </div>
    </section>

    <!-- Typography Showcase -->
    <section class="ds-section">
      <h2 class="tc-heading-2">Typography</h2>
      <div>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p class="tc-text-muted">본문/보조 텍스트 색상 예시</p>
      </div>
    </section>

    <!-- Modal Showcase -->
    <section class="ds-section">
      <h2 class="tc-heading-2">Modal</h2>
      <TcButton variant="primary" @click="showModal = true"
        >Open Modal</TcButton
      >
      <TcModal v-model="showModal" title="예시 모달">
        <p class="tc-body-text">
          디자인 시스템에서 공용 모달을 확인할 수 있습니다.
        </p>
        <template #footer>
          <TcButton variant="ghost" @click="showModal = false">닫기</TcButton>
        </template>
      </TcModal>
    </section>

    <!-- Brand Logo Showcase -->
    <section class="logo-showcase-section">
      <h2 class="tc-heading-2">브랜드 로고 시스템</h2>
      <p class="tc-body-text showcase-description tc-readable">
        4가지 로고 variant와 사이즈/애니메이션 예시
      </p>

      <div class="logo-showcase-grid">
        <div class="logo-showcase-item">
          <div class="showcase-header">
            <h4>기본형</h4>
            <span class="recommended-badge">⭐ 메인 추천</span>
          </div>
          <TcLogo variant="basic" size="xl" :animated="true" />
          <div class="logo-sizes">
            <TcLogo variant="basic" size="sm" :animated="true" />
            <TcLogo variant="basic" size="md" :animated="true" />
            <TcLogo variant="basic" size="lg" :animated="true" />
          </div>
          <p class="tc-small-text tc-text-muted">
            앱 아이콘, 로고, 일반 브랜딩
          </p>
        </div>

        <div class="logo-showcase-item">
          <div class="showcase-header">
            <h4>미니멀형</h4>
          </div>
          <TcLogo variant="minimal" size="xl" :animated="true" />
          <div class="logo-sizes">
            <TcLogo variant="minimal" size="sm" :animated="true" />
            <TcLogo variant="minimal" size="md" :animated="true" />
            <TcLogo variant="minimal" size="lg" :animated="true" />
          </div>
          <p class="tc-small-text tc-text-muted">
            웹사이트 헤더, 명함, 공식 문서
          </p>
        </div>

        <div class="logo-showcase-item">
          <div class="showcase-header">
            <h4>쉼표 강조형</h4>
          </div>
          <TcLogo variant="emphasis" size="xl" :animated="true" />
          <div class="logo-sizes">
            <TcLogo variant="emphasis" size="sm" :animated="true" />
            <TcLogo variant="emphasis" size="md" :animated="true" />
            <TcLogo variant="emphasis" size="lg" :animated="true" />
          </div>
          <p class="tc-small-text tc-text-muted">로딩 화면, 이벤트 배너</p>
        </div>

        <div class="logo-showcase-item">
          <div class="showcase-header">
            <h4>그라데이션형</h4>
          </div>
          <TcLogo variant="gradient" size="xl" :animated="true" />
          <div class="logo-sizes">
            <TcLogo variant="gradient" size="sm" :animated="true" />
            <TcLogo variant="gradient" size="md" :animated="true" />
            <TcLogo variant="gradient" size="lg" :animated="true" />
          </div>
          <p class="tc-small-text tc-text-muted">프리미엄, 스페셜 캠페인</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard, TcInput, TcLogo, TcModal } from '@/components/ui';
import { ref } from 'vue';
import './DesignSystem.scss';
const showModal = ref(false);
</script>
