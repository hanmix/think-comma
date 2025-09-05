import { defineStore } from "pinia";
import { reactive } from "vue";
import type { RouteLocationRaw } from "vue-router";
import type { StackId } from "@/types/navigation";

/**
 * 네비게이션 스택 스토어 (Pinia / Setup Store)
 * - 목적: SwiftUI NavigationStack 유사한 스택 상태를 보관하고, 브라우저 히스토리 position과 동기화합니다.
 * - 사용처: composable(useNavStack), navStackSync(router.afterEach)에서 접근합니다.
 */

export const useNavStackStore = defineStore("navStack", () => {
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

  /**
   * 스택/포지션 초기화 보장
   * @param stackId 스택 식별자
   */
  const ensureStack = (stackId: StackId) => {
    if (!stacks[stackId]) stacks[stackId] = [];
    if (!positions[stackId]) positions[stackId] = [];
  };

  /**
   * 스택에 푸시 (브라우저 히스토리 index 함께 기록)
   * @param stackId 스택 식별자
   * @param to 이동 목적지(RouteLocationRaw)
   * @param pos 명시적 브라우저 position (미지정 시 window.history.state.position 사용)
   */
  const push = (stackId: StackId, to: RouteLocationRaw, pos?: number) => {
    ensureStack(stackId);
    stacks[stackId].push(to);
    positions[stackId].push(pos ?? (window.history.state?.position ?? 0));
  };

  /**
   * 스택의 최상단을 교체 (브라우저 히스토리 index도 교체)
   * @param stackId 스택 식별자
   * @param to 이동 목적지(RouteLocationRaw)
   * @param pos 명시적 브라우저 position
   */
  const replace = (stackId: StackId, to: RouteLocationRaw, pos?: number) => {
    ensureStack(stackId);
    if (stacks[stackId].length === 0) {
      stacks[stackId].push(to);
      positions[stackId].push(pos ?? (window.history.state?.position ?? 0));
    } else {
      stacks[stackId][stacks[stackId].length - 1] = to;
      if (pos !== undefined) {
        positions[stackId][positions[stackId].length - 1] = pos;
      }
    }
  };

  /**
   * 스택에서 한 단계 팝 (루트는 보존)
   * @param stackId 스택 식별자
   */
  const pop = (stackId: StackId) => {
    ensureStack(stackId);
    if (stacks[stackId].length > 1) {
      stacks[stackId].pop();
      positions[stackId].pop();
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
    positions[stackId] = [pos ?? (window.history.state?.position ?? 0)];
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
    ensureStack(stackId);
    stacks[stackId] = stacks[stackId].slice(0, length);
    positions[stackId] = positions[stackId].slice(0, length);
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
