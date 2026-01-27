import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

import { useNavStackStore } from '@/stores/navStack';
import { useThinkingStore } from '@/stores/thinking';
import type { ProcessStep } from '@/types';
import { DesignSystem, MainPage, ThinkingFlow } from '@/views';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'main' },
  },
  {
    path: '/main',
    name: 'main',
    component: MainPage,
  },
  {
    path: '/flow',
    name: 'flow',
    redirect: { name: 'flow-input' },
    children: [
      {
        path: '/input',
        name: 'flow-input',
        component: ThinkingFlow,
        meta: { flowStep: 'input' },
      },
      {
        path: '/intro',
        name: 'flow-intro',
        component: ThinkingFlow,
        meta: { flowStep: 'intro' },
      },
      {
        path: '/questions',
        name: 'flow-questions',
        component: ThinkingFlow,
        meta: { flowStep: 'questions' },
      },
      {
        path: '/result',
        name: 'flow-result',
        component: ThinkingFlow,
        meta: { flowStep: 'result' },
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
  history: createWebHistory('/thinkcomma/'),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const flowOrder: Record<ProcessStep, number> = {
  input: 0,
  intro: 1,
  questions: 2,
  result: 3,
};

router.beforeEach((to, from) => {
  const toStep = to.meta.flowStep as ProcessStep | undefined;
  const fromStep = from.meta.flowStep as ProcessStep | undefined;

  const thinkingStore = useThinkingStore();
  const navStore = useNavStackStore();

  if (toStep) {
    const hasWorry = !!thinkingStore.state.worryInput;
    const hasIntro = !!thinkingStore.state.framingIntro;
    const hasQuestions = thinkingStore.state.questions.length > 0;
    const hasResult = !!thinkingStore.state.analysisResult;

    const stepReadyMap: Record<ProcessStep, boolean> = {
      input: true,
      intro: hasWorry && hasIntro,
      questions: hasWorry && hasQuestions,
      result: hasWorry && hasResult,
    };

    if (!stepReadyMap[toStep]) {
      return { name: 'flow-input' };
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
  const step = to.meta.flowStep as ProcessStep | undefined;
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
