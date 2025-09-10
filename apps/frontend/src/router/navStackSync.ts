import { useNavStackStore } from '@/stores/navStack';
import { DEFAULT_STACK_ID } from '@/types/navigation';
import type { RouteLocationNormalized, Router } from 'vue-router';

/**
 * 네비게이션 스택 동기화 훅
 * - 목적: 브라우저 히스토리 제스처(뒤/앞)와 Pinia 스택 상태를 일치시킵니다.
 * - 원리: Vue Router의 afterEach에서 `history.state.position`을 읽어
 *   push/forward(증가), replace(동일), back(감소)을 감지하여 스토어를 갱신합니다.
 */

/**
 * 현재 라우트를 스택에 저장 가능한 목적지 형태로 변환
 */
const toLoc = (r: RouteLocationNormalized) => ({
  name: r.name as string,
  params: r.params,
  query: r.query,
});

/**
 * navStack 동기화 설치
 * @param router Vue Router 인스턴스
 */
export function installNavStackSync(router: Router) {
  const store = useNavStackStore();

  /**
   * 라우트에서 스택 메타 추출
   * @returns stackId(없으면 기본값), isRoot
   */
  const getStackMeta = (r: RouteLocationNormalized) => {
    const record = r.matched[r.matched.length - 1];
    const stackId = (record?.meta?.stackId as string) || DEFAULT_STACK_ID;
    const isRoot = Boolean(record?.meta?.isRoot);
    return { stackId, isRoot };
  };

  /**
   * 단일 라우트 전이 시 Pinia 스택과 동기화
   * - pos: 브라우저 히스토리 인덱스(history.state.position)
   * - 규칙:
   *   - 루트 진입: 해당 스택을 루트 1개로 설정
   *   - pos 증가: push/forward → 스택에 push
   *   - pos 동일: replace → 스택 top 교체
   *   - pos 감소: back → 기존 pos 위치까지 잘라내고 top 교체
   */
  const sync = (to: RouteLocationNormalized) => {
    const { stackId, isRoot } = getStackMeta(to);
    const pos =
      (window.history.state && (window.history.state as any).position) || 0;
    store.ensureStack(stackId);

    const positions = store.positions[stackId];
    const lastPos = positions[positions.length - 1];

    if (isRoot) {
      store.setRoot(stackId, toLoc(to), pos);
      return;
    }

    if (lastPos === undefined) {
      // Seed: if there is a known root, add it with pos-1 for stable back detection
      const root = router
        .getRoutes()
        .find(r => r.meta?.stackId === stackId && r.meta?.isRoot);
      if (root && root.name !== to.name) {
        store.setRoot(stackId, { name: root.name as string }, pos - 1);
        store.push(stackId, toLoc(to), pos);
      } else {
        store.setRoot(stackId, toLoc(to), pos);
      }
      return;
    }

    if (pos > lastPos) {
      // forward/push
      store.push(stackId, toLoc(to), pos);
    } else if (pos === lastPos) {
      // replace
      store.replace(stackId, toLoc(to), pos);
    } else {
      // back: trim to this position if it exists; otherwise reset
      const idx = positions.findIndex(p => p === pos);
      if (idx !== -1) {
        store.trimToLength(stackId, idx + 1);
        store.replace(stackId, toLoc(to), pos);
      } else {
        store.setRoot(stackId, toLoc(to), pos);
      }
    }
  };

  // Initial sync (after router is ready)
  if ((router as any).isReady) {
    router.isReady().then(() => sync(router.currentRoute.value));
  } else {
    // Fallback immediate sync
    sync(router.currentRoute.value);
  }

  router.afterEach(to => {
    sync(to);
  });
}
