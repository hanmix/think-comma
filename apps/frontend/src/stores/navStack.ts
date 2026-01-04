import type { StackId } from '@/types';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

/**
 * 네비게이션 스택 스토어 (Pinia / Setup Store)
 * - 목적: SwiftUI NavigationStack 유사한 스택 상태를 보관하고, 브라우저 히스토리 position과 동기화합니다.
 * - 사용처: composable(useNavStack), navStackSync(router.afterEach)에서 접근합니다.
 */

export const useNavStackStore = defineStore('navStack', () => {
  const getHistoryPosition = () => {
    if (typeof window === 'undefined') return 0;
    const state = window.history.state;
    if (typeof state === 'object' && state !== null && 'position' in state) {
      const position = (state as { position?: unknown }).position;
      return typeof position === 'number' ? position : 0;
    }
    return 0;
  };

  /**
   * 스택 목록: 스택 ID별 라우트 목적지 배열
   * - 각 요소는 해당 시점의 목적지(RouteLocationRaw)
   */
  const stacks = reactive<Record<StackId, RouteLocationRaw[]>>({});

  /**
   * 브라우저 히스토리 position 목록: 스택 ID별로 각 엔트리가 쌓인 시점의 `history.state.position`
   * - 제스처/뒤로가기 판단과 동기화에 사용
   */
  const positions = reactive<Record<StackId, number[]>>({});

  const getStack = (stackId: StackId) => {
    if (!stacks[stackId]) stacks[stackId] = [];
    return stacks[stackId]!;
  };

  const getPositions = (stackId: StackId) => {
    if (!positions[stackId]) positions[stackId] = [];
    return positions[stackId]!;
  };

  const ensureStack = (stackId: StackId) => {
    getStack(stackId);
    getPositions(stackId);
  };

  /**
   * 스택에 푸시 (브라우저 히스토리 index 함께 기록)
   * @param stackId 스택 식별자
   * @param to 이동 목적지(RouteLocationRaw)
   * @param pos 명시적 브라우저 position (미지정 시 window.history.state.position 사용)
   */
  const push = (stackId: StackId, to: RouteLocationRaw, pos?: number) => {
    const stack = getStack(stackId);
    const posList = getPositions(stackId);
    stack.push(to);
    posList.push(pos ?? getHistoryPosition());
  };

  /**
   * 스택의 최상단을 교체 (브라우저 히스토리 index도 교체)
   * @param stackId 스택 식별자
   * @param to 이동 목적지(RouteLocationRaw)
   * @param pos 명시적 브라우저 position
   */
  const replace = (stackId: StackId, to: RouteLocationRaw, pos?: number) => {
    const stack = getStack(stackId);
    const posList = getPositions(stackId);
    if (stack.length === 0) {
      stack.push(to);
      posList.push(pos ?? getHistoryPosition());
    } else {
      stack[stack.length - 1] = to;
      if (pos !== undefined) {
        posList[posList.length - 1] = pos;
      }
    }
  };

  /**
   * 스택에서 한 단계 팝 (루트는 보존)
   * @param stackId 스택 식별자
   */
  const pop = (stackId: StackId) => {
    const stack = getStack(stackId);
    const posList = getPositions(stackId);
    if (stack.length > 1) {
      stack.pop();
      posList.pop();
    }
  };

  /**
   * 스택을 루트 한 개의 엔트리로 설정
   * @param stackId 스택 식별자
   * @param to 루트 목적지
   * @param pos 브라우저 position
   */
  const setRoot = (stackId: StackId, to: RouteLocationRaw, pos?: number) => {
    stacks[stackId] = [to];
    positions[stackId] = [pos ?? getHistoryPosition()];
  };

  /**
   * 스택을 지정 목적지 하나로 리셋 (루트 대체)
   * @param stackId 스택 식별자
   * @param to 목적지
   * @param pos 브라우저 position
   */
  const resetTo = (stackId: StackId, to: RouteLocationRaw, pos?: number) => {
    setRoot(stackId, to, pos);
  };

  /**
   * 스택/포지션 배열을 지정 길이로 자르기 (동기화 보조)
   * @param stackId 스택 식별자
   * @param length 남길 길이
   */
  const trimToLength = (stackId: StackId, length: number) => {
    stacks[stackId] = getStack(stackId).slice(0, length);
    positions[stackId] = getPositions(stackId).slice(0, length);
  };

  return {
    stacks,
    positions,
    ensureStack,
    push,
    replace,
    pop,
    setRoot,
    resetTo,
    trimToLength,
  };
});
