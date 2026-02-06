# 아키텍처 개요

프론트엔드의 주요 플로우와 디렉터리 구조를 요약합니다.

## 전체 흐름(Flow)
1) 입력: `WorryInput` – 사용자의 고민 입력 및 검증  
2) 프레이밍(1단계): 구조적 축/근거 추출 → `axisA/axisB`, `rationaleA/B`  
3) 프레이밍(2단계): axis 기반 A/B 라벨·힌트 생성  
4) 질문: axis 기반 10개 A/B 질문 생성(가중치 순서 유지)  
5) 분석: axis + 응답을 결합해 성향/결정요인/조언(guidance) 생성  
6) 점수: 응답 점수(70%) + axis 정합도(30%)로 scoreA/scoreB 산출  
7) 결과: `AnalysisResult` – 성향/결정요인/추천/행동계획  
8) 컨트롤러: `ThinkingProcess` – 단계 전환, 세션/에러/로딩 관리

## 디렉터리 구조 요약
```
src/
  components/
    thinking/   # WorryInput, QuestionFlow, AnalysisResult, ThinkingProcess
      result/   # AnalysisResultHeader, Recommendation, Insights, History, ActionGuide
    ui/         # Tc* UI 컴포넌트 (Button, Card, Input, Modal, Dialog, ...)
  composables/  # 재사용 가능한 Composition API 훅 (예: useNavStack)
  views/        # 페이지 단위 컴포넌트 (Home, Example, DesignSystem, ThinkingFlow)
  styles/       # SCSS 엔트리와 전역 유틸 (_variables, _mixins, _global, _utilities, _components)
  assets/styles # 디자인 시스템 CSS 변수 + DS 컴포넌트 SCSS
  services/     # aiService (API), aiClient(스위치), aiMock(모의)
  types/        # thinking.ts (핵심 타입)
  stores/       # Pinia 스토어 (예: navStack)
  router/       # index.ts (라우팅), navStackSync.ts (스택 동기화 훅)
```

## 라우팅
- `/` → `HomePage`
- `/example` → `ExamplePage`
- `/flow` → `ThinkingFlow`
- `/design` → `DesignSystem`

## 상태/세션
- Vue 3 Composition API 표준 사용. 전역 상태는 Pinia(Setup Store)로 최소한만 사용
- `src/stores/navStack.ts`에 네비게이션 스택 상태를 보관(Setup Store)
- `ThinkingProcess`가 세션 로딩/저장/복구를 담당하며, 로딩/에러는 `thinking` 스토어 액션에서 관리
- LocalStorage 활용 (필요 시 교체 용이)

## 네비게이션(스택 모델)
- 목표: 스택 기반 내비게이션을 웹에서 일관되게 구현
- 구성 요소
  - `src/composables/useNavStack.ts`: `push/replace/pop/popToRoot/resetTo` API 제공, `canGoBack/depth` 계산
  - `src/stores/navStack.ts`: 스택과 히스토리 position 추적(Pinia Setup Store)
  - `src/router/navStackSync.ts`: `router.afterEach`로 브라우저 제스처(뒤/앞)와 스택 동기화
  - 라우트 메타: `meta.stackId`로 스택 식별, `meta.isRoot`로 루트 라우트 지정
- 동작 원리
  - 일반 이동은 Router를 호출하고, afterEach 훅이 `history.state.position`을 읽어 스택을 갱신
  - `pop()`은 `router.go(-1)`, `popToRoot()`는 현재 스택 깊이만큼 `router.go(-(n-1))`로 브라우저 히스토리와 일치
  - 기본 스택 ID는 `main`이며, 홈 라우트는 `isRoot: true`

## 타입 시스템 (`src/types/thinking.ts`)
- `WorryInput`, `Question`, `UserResponse`, `FramingIntro`, `AnalysisResult`, `ThinkingSession`
- `FramingIntro.axis`: `axisA/axisB`, `rationaleA/B`, `keywords`
- `AnalysisResult.guidance`, `axisAlignment`

## 서비스
- `src/services/aiService.ts`: 네트워크 API 전용 클라이언트
- `src/services/aiMock.ts`: 목 데이터/도메인 로직(질문/분석/프레이밍)
- `src/services/aiClient.ts`: `VITE_USE_MOCK_AI`에 따라 실/목 클라이언트 선택
  - 질문 생성: `worry + axis` 전달
  - 분석 요청: `worry + questions + responses + labels + axis` 전달

## 접근성(A11y)
- 포커스 가시성(`:focus-visible`)과 최소 터치 타깃(44px)
- 모달(`TcModal`) 포커스 트랩/ESC/스크롤 잠금
- 입력 레이블/aria 속성/에러 메시지 연결

## 코드 규칙
- `@` 별칭 절대 경로 사용
- `<script setup lang="ts">` + SFC 사용
- UI 컴포넌트는 `Tc` 접두사
- 페이지/컴포넌트 스타일은 옆에 `.scss` 파일로 분리

## 테스트/빌드
- Vite + TypeScript (strict)
- 빌드 전 `vue-tsc -b`
- 테스트 프레임워크 미구성 (추가 예정 시 `vitest` 권장)
