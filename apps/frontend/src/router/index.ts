import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

import { FlowRoute } from '@/constants';
import { useNavStackStore, useThinkingStore } from '@/stores';
import type { ProcessStepType } from '@/types';
import { DesignSystem, FlowLayout, MainPage, ThinkingFlow } from '@/views';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main',
    component: MainPage,
  },
  {
    path: '/flow',
    name: 'flow',
    component: FlowLayout,
    redirect: { name: 'input' },
    children: [
      {
        path: 'input',
        name: FlowRoute.Input,
        component: ThinkingFlow,
        meta: { flowStep: FlowRoute.Input },
      },
      {
        path: 'intro',
        name: FlowRoute.Intro,
        component: ThinkingFlow,
        meta: { flowStep: FlowRoute.Intro },
      },
      {
        path: 'questions',
        name: FlowRoute.Questions,
        component: ThinkingFlow,
        meta: { flowStep: FlowRoute.Questions },
      },
      {
        path: 'result',
        name: FlowRoute.Result,
        component: ThinkingFlow,
        meta: { flowStep: FlowRoute.Result },
      },
    ],
  },
  {
    path: '/design',
    name: 'design',
    component: DesignSystem,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const flowOrder: Record<ProcessStepType, number> = {
  input: 0,
  intro: 1,
  questions: 2,
  result: 3,
};

router.beforeEach((to, from) => {
  const toStep = to.meta.flowStep as ProcessStepType | undefined;
  const fromStep = from.meta.flowStep as ProcessStepType | undefined;

  const thinkingStore = useThinkingStore();
  const navStore = useNavStackStore();

  if (toStep) {
    const hasWorry = !!thinkingStore.state.worryInput;
    const hasIntro = !!thinkingStore.state.framingIntro;
    const hasQuestions = thinkingStore.state.questions.length > 0;
    const hasResult = !!thinkingStore.state.analysisResult;

    const stepReadyMap: Record<ProcessStepType, boolean> = {
      input: true,
      intro: hasWorry && hasIntro,
      questions: hasWorry && hasQuestions,
      result: hasWorry && hasResult,
    };

    if (!stepReadyMap[toStep]) {
      return { name: FlowRoute.Input };
    }
  }

  const isBackNavigation =
    !!fromStep && (!toStep || flowOrder[toStep] < flowOrder[fromStep]);

  if (isBackNavigation && navStore.isFlowInProgress) {
    if (navStore.consumeSkipConfirm()) return true;
    const ok = window.confirm(
      '진행 중인 흐름이 초기화될 수 있습니다. 이동할까요?'
    );
    if (!ok) {
      return { path: from.fullPath, replace: true };
    }
  }

  return true;
});

router.afterEach((to, from) => {
  const step = to.meta.flowStep as ProcessStepType | undefined;
  const thinkingStore = useThinkingStore();
  const navStore = useNavStackStore();

  if (!step) {
    if (from.meta.flowStep) navStore.resetFlow();
    return;
  }

  thinkingStore.goToStep(step);
  navStore.setFlowStep(step);
});

export default router;
