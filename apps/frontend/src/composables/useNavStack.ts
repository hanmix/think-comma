import router from '@/router';
import { useNavStackStore } from '@/stores/navStack';
import type { StackId } from '@/types';
import { DEFAULT_STACK_ID } from '@/types';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { RouteLocationRaw, Router } from 'vue-router';

/**
 * SwiftUI NavigationStack 유사 동작을 제공하는 경량 컴포저블
 * - `route.meta.stackId`별 가상 스택을 운용합니다.
 * - push/replace/pop/popToRoot API와 canGoBack/depth 계산을 제공합니다.
 * - 브라우저 제스처 동기화는 `router/navStackSync`에서 담당합니다.
 */

/**
 * 라우트 목적지로부터 스택 메타 정보 추출
 * @param loc 이동 목적지
 * @returns stackId, isRoot, resolved
 */
const getRouteMeta = (loc: RouteLocationRaw) => {
  const resolved = router.resolve(loc);
  // Use deepest matched record's meta for stack
  const record = resolved.matched[resolved.matched.length - 1];
  const stackId = (record?.meta?.stackId as string) || DEFAULT_STACK_ID;
  const isRoot = Boolean(record?.meta?.isRoot);
  return { stackId, isRoot, resolved };
};

/**
 * 특정 스택의 루트 라우트 목적지 반환
 * @param stackId 스택 식별자
 */
const getRootFor = (stackId: StackId): RouteLocationRaw | null => {
  // Find a route with meta { stackId, isRoot: true }
  const root = router
    .getRoutes()
    .find(r => r.meta?.stackId === stackId && r.meta?.isRoot);
  return root ? { name: root.name as string } : null;
};

/**
 * 네비게이션 스택 API 팩토리
 * - Pinia 스토어는 여기서 지연 접근합니다(app.use(pinia) 이후 보장).
 */
const api = (r: Router) => {
  // Lazily access Pinia store after app.use(pinia)
  const store = useNavStackStore();
  // Pinia 상태를 구조분해 할당해도 반응성을 유지하도록 refs로 노출
  const { stacks, positions } = storeToRefs(store);
  const ensureStack = (stackId: StackId) => store.ensureStack(stackId);
  /** 스택에 푸시 (브라우저 히스토리는 router.push 사용) */
  const push = async (to: RouteLocationRaw) => {
    const { stackId } = getRouteMeta(to);
    ensureStack(stackId);
    return r.push(to);
  };

  /** 스택 최상단 교체 (브라우저 히스토리는 router.replace 사용) */
  const replace = async (to: RouteLocationRaw) => {
    const { stackId } = getRouteMeta(to);
    ensureStack(stackId);
    return r.replace(to);
  };

  /** 한 단계 뒤로가기 (히스토리 go(-1)과 동기) */
  const pop = async (stackId?: StackId) => {
    const current = r.currentRoute.value;
    const activeStackId =
      (current.meta?.stackId as string) || stackId || DEFAULT_STACK_ID;
    ensureStack(activeStackId);
    const stack = store.stacks[activeStackId] || [];
    if (stack.length <= 1) return; // nothing to pop
    // Align with browser history to preserve gesture/back consistency
    return r.go(-1);
  };

  /** 루트까지 모두 뒤로가기 (현재 스택 깊이만큼 go(-(n-1))) */
  const popToRoot = async (stackId?: StackId) => {
    const current = r.currentRoute.value;
    const activeStackId =
      (current.meta?.stackId as string) || stackId || DEFAULT_STACK_ID;
    ensureStack(activeStackId);
    const depth = store.stacks[activeStackId]?.length || 1;
    if (depth <= 1) return;
    // Go back N-1 steps to reach root in browser history as well
    return r.go(-(depth - 1));
  };

  /** 지정 목적지로 대체 이동 (스택 리셋 의도) */
  const resetTo = async (to: RouteLocationRaw) => {
    const { stackId } = getRouteMeta(to);
    ensureStack(stackId);
    // Replace to target; plugin will mark as replace (keeps history index)
    return r.replace(to);
  };

  /** 뒤로가기 가능 여부(스택 깊이 > 1) */
  const canGoBack = computed(() => {
    const current = r.currentRoute.value;
    const activeStackId = (current.meta?.stackId as string) || DEFAULT_STACK_ID;
    ensureStack(activeStackId);
    return store.stacks[activeStackId].length > 1;
  });

  /** 현재 스택 깊이 */
  const depth = computed(() => {
    const current = r.currentRoute.value;
    const activeStackId = (current.meta?.stackId as string) || DEFAULT_STACK_ID;
    ensureStack(activeStackId);
    return store.stacks[activeStackId].length;
  });

  // Initialization is handled by router/navStackSync

  // 구조분해 할당 사용을 고려해 함수/상태를 낱개로 반환
  return {
    // actions
    push,
    replace,
    pop,
    popToRoot,
    resetTo,
    // derived state
    canGoBack,
    depth,
    // raw store and reactive refs (for destructuring)
    store,
    stacks,
    positions,
  };
};

/**
 * 네비게이션 스택 컴포저블 엔트리
 * @returns push, replace, pop, popToRoot, resetTo, canGoBack, depth, state
 */
export const useNavStack = () => api(router);

export type UseNavStack = ReturnType<typeof useNavStack>;
