<template>
  <div class="tc-container">
    <header class="hero-section">
      <h1 class="tc-heading-1 hero-heading">
        Think<span class="tc-comma-highlight">,</span> 고민을 간단하게
      </h1>
      <p class="tc-body-text hero-description tc-readable">
        고민 때문에 잠 못 이루는 3시간을 3분으로 단축시켜주는 서비스
        <br />
        <span class="tc-text-muted"
          >AI 기반 의사결정 도구 · 체계적 사고 프레임워크</span
        >
      </p>
      <div class="hero-actions">
        <TcButton variant="primary" size="lg" @click="handleGetStarted"
          >3분 만에 고민 해결하기</TcButton
        >
        <TcButton variant="outline" size="lg" @click="handleLearnMore"
          >고민 해결 과정 보기</TcButton
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
          @click="handleFeatureClick('structure')"
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
          @click="handleFeatureClick('solution')"
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
          @click="handleFeatureClick('action')"
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

    <section class="contact-section">
      <TcCard variant="default" size="lg">
        <template #header>
          <h2 class="tc-heading-2">지금 바로 고민 해결해보기</h2>
          <p class="tc-small-text">
            3분만 투자하면 오늘 밤부터 편안하게 잠들 수 있어요
          </p>
        </template>

        <form @submit.prevent="handleSubmit" class="worry-form">
          <div class="form-row">
            <TcInput
              v-model="form.name"
              label="이름"
              placeholder="이름을 입력하세요"
              :required="true"
              :error="errors.name"
            />
            <TcInput
              v-model="form.email"
              type="email"
              label="이메일"
              placeholder="결과를 받을 이메일을 입력하세요"
              :required="true"
              :error="errors.email"
            />
          </div>
          <TcInput
            v-model="form.subject"
            label="고민 카테고리"
            placeholder="예: 진로, 연애, 창업, 이직, 인간관계 등"
            :required="true"
            :error="errors.subject"
          />
          <div class="tc-form-group">
            <label class="tc-form-label tc-form-label--required"
              >현재 고민</label
            >
            <textarea
              v-model="form.message"
              class="tc-textarea"
              rows="6"
              required
            />
            <div v-if="errors.message" class="tc-form-error">
              {{ errors.message }}
            </div>
            <div class="tc-form-help tc-readable">
              💡 구체적으로 적을수록 더 정확한 해결책을 받을 수 있어요
            </div>
          </div>
        </form>

        <template #footer>
          <div class="form-actions">
            <TcButton variant="ghost" @click="resetForm"> 초기화 </TcButton>
            <TcButton variant="primary" @click="handleSubmit">
              🚀 3분 고민 해결 시작하기
            </TcButton>
          </div>
          <div class="guarantee-text">
            <p class="tc-small-text tc-text-muted">
              ✅ 3분 안에 해결되지 않으면 전액 환불 (무료 베타 기간 중)
            </p>
          </div>
        </template>
      </TcCard>
    </section>

    <div v-if="showSuccessMessage">
      <TcCard variant="success" class="success-message">
        <h3>고민 분석 시작! 🎉</h3>
        <p class="tc-readable">
          고민이 접수되었습니다. AI가 지금 분석 중이며, 3분 내에 구조화된
          해결책을 이메일로 보내드립니다.
        </p>
        <div class="tc-small-text tc-text-muted tc-mt-2">
          💌 잠시 후 1차 분석 결과가 도착할 예정입니다
        </div>
      </TcCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard, TcInput } from '@/components/ui';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import './ExamplePage.scss';

type WorryForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
type FormErrors = Partial<Record<keyof WorryForm, string>>;

const form = reactive<WorryForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
});
const errors = reactive<FormErrors>({});
const showSuccessMessage = ref(false);
const router = useRouter();

const validateForm = (): boolean => {
  (Object.keys(errors) as (keyof WorryForm)[]).forEach(k => delete errors[k]);
  if (!form.name.trim()) errors.name = '이름을 입력해주세요.';
  if (!form.email.trim()) errors.email = '이메일을 입력해주세요.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = '올바른 이메일 형식을 입력해주세요.';
  if (!form.subject.trim()) errors.subject = '고민 카테고리를 입력해주세요.';
  if (!form.message.trim()) errors.message = '현재 고민을 입력해주세요.';
  return Object.keys(errors).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) return;
  console.log('Worry analysis started:', { ...form });
  router.push({ name: 'flow' });
  resetForm();
  showSuccessMessage.value = true;
};

const resetForm = () => {
  form.name = '';
  form.email = '';
  form.subject = '';
  form.message = '';
  (Object.keys(errors) as (keyof WorryForm)[]).forEach(k => delete errors[k]);
};

const handleGetStarted = () => {
  router.push({ name: 'flow' });
};
const handleLearnMore = () => {
  document
    .querySelector('.features-section')
    ?.scrollIntoView({ behavior: 'smooth' });
};
const handleFeatureClick = (feature: string) => {
  console.log(`Feature clicked: ${feature}`);
};
</script>
