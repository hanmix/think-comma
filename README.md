# README.md

## 프로젝트 개요

ThinkComma는 사용자의 개인적인 고민을 15분 안에 해결해주는 Vue 3 + TypeScript 애플리케이션입니다. 핵심 컨셉: "고민 때문에 잠 못 이루는 3시간을 15분으로 단축시켜주는 서비스"

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드 (TypeScript 검사 포함)
npm run preview  # 프로덕션 빌드 로컬 미리보기
```

## 아키텍처

### 핵심 플로우 시스템

애플리케이션은 4단계 고민 해결 프로세스를 구현합니다:

1. **WorryInput**: 사용자가 고민 입력 (카테고리 분류 지원)
2. **AI 질문 생성**: 모의 AI 서비스가 상황별 A/B 선택 질문 10개 생성
3. **QuestionFlow**: 진행률 추적과 네비게이션이 있는 대화형 설문
4. **AnalysisResult**: 성향 분석, 추천사항, 행동 단계가 포함된 종합 분석

### 주요 컴포넌트 구조

**메인 플로우 컨트롤러**: `src/components/thinking/ThinkingProcess.vue`

- 전체 프로세스 상태와 네비게이션 관리
- AI 서비스 통합 및 에러 상태 처리
- 세션 관리 및 복구 기능 제공

**UI 시스템**: ThinkComma Design System v2.0 (SCSS 기반)

- 모든 컴포넌트는 `Tc` 접두사 사용 (예: `TcButton`, `TcCard`, `TcInput`, `TcModal`, `TcDialog`)
- 소스: `src/components/ui/`
- 스타일: SCSS 엔트리 `src/styles/index.scss`에서 전역 로드
  - 토큰/믹스인: `src/styles/_variables.scss`, `src/styles/_mixins.scss`
  - 전역 베이스/리셋/유틸: `src/styles/_global.scss`, `src/styles/_utilities.scss`
  - 공용 컴포넌트 유틸: `src/styles/_components.scss` (예: `.tc-hero`, `.tc-section`, `auto-grid`)
  - 디자인 시스템 SCSS: `src/assets/styles/components/*.scss` (typography, buttons, cards, forms)
  - CSS 커스텀 프로퍼티: `src/assets/styles/variables.css` (SCSS에서 `@import`로 포함)

**AI 서비스**: `src/services/aiService.ts`

- 실제 AI 응답을 시뮬레이션하는 모의 구현
- 카테고리별 질문 생성 (진로, 연애, 사업 등)
- 성향 프로파일링을 위한 응답 패턴 분석
- 프로덕션에서는 실제 AI API 엔드포인트로 교체

### 타입 시스템

`src/types/thinking.ts`의 중앙 타입 정의:

- `WorryInput`: 사용자의 초기 문제 제출
- `Question`/`UserResponse`: A/B 선택 설문 시스템
- `AnalysisResult`: 확신도 점수가 있는 최종 추천사항
- `ThinkingSession`: 지속성을 위한 완전한 세션 상태

### 디자인 시스템 (SCSS 구조)

`tc-` 접두사가 있는 BEM 유사 네이밍. SCSS + CSS 변수 혼합 아키텍처:

- 토큰: `src/styles/_variables.scss` (SCSS), `src/assets/styles/variables.css` (런타임 CSS 변수)
- 믹스인/반응형: `src/styles/_mixins.scss` (`respond()`, `container()` 등)
- 전역 유틸: `src/styles/_global.scss`, `src/styles/_utilities.scss`, `src/styles/_components.scss` (예: `.tc-hero`, `.tc-section`, `.tc-divider`, `auto-grid`)
- 디자인 컴포넌트 SCSS: `src/assets/styles/components/{typography,buttons,cards,forms}.scss`
- 페이지/컴포넌트 전용 SCSS: 각 뷰/컴포넌트 옆에 배치 (예: `HomePage.scss`, `DesignSystem.scss`, `QuestionFlow.scss`)
- 브레이크포인트: xs 375, sm 768, md 1024, lg 1440 (respond 믹스인 사용)
- 세이프 에어리어: `env(safe-area-inset-*)` 유틸 포함
- 접근성: 최소 터치 타깃 44px, 포커스 스타일, 모달 포커스 트랩

### 상태 관리

복잡한 상태 관리 없음 - Vue 3 Composition API 사용:

- prop 전달을 통한 세션 기반 데이터 플로우
- 세션 지속성/복구를 위한 LocalStorage
- 유효성 검사가 있는 반응형 폼

## 통합 포인트

메인 라우트 구성:

- `/` → `HomePage` (서비스 설명 요약, 주요 CTA)
- `/example` → `ExamplePage` (랜딩 데모 섹션들)
- `/flow` → `ThinkingFlow` (실제 고민 해결 플로우: WorryInput → QuestionFlow → AnalysisResult)
- `/design` → `DesignSystem` (디자인 시스템 쇼케이스: 버튼/카드/입력/타이포/로고/모달)

디자인은 다음과 함께 "15분 해결" 약속을 강조합니다:

- 플로우 전반의 시간 추정
- 진행 표시기와 확신도 미터
- 즉시 실행 가능한 결과

## 개발 참고사항

- `src/`를 가리키는 `@` 별칭이 있는 Vite 사용
- TypeScript 엄격 모드 활성화
- `<script setup>`을 사용한 Single File Components
- 현재 테스트 프레임워크 구성되지 않음
- 모의 AI 서비스는 현실적인 지연과 상황별 질문 생성을 포함

### Import 규칙

**IMPORTANT**: 모든 import는 `@` 별칭을 사용한 절대 경로로 작성해야 합니다:

```typescript
// ✅ 올바른 방법
import { TcButton } from "@/components/ui";
import { WorryInput } from "@/types/thinking";
import ExamplePage from "@/views/ExamplePage.vue";

// ❌ 잘못된 방법
import { TcButton } from "../ui";
import { WorryInput } from "../../types/thinking";
import ExamplePage from "../views/ExamplePage.vue";
```

VSCode 설정이 자동으로 `@` 별칭을 사용하도록 구성되어 있으며, 새 파일 생성 시 자동 import도 절대 경로를 사용합니다.

## 스타일 가이드: SCSS 사용법

- 전역 주입: `vite.config.ts`의 `css.preprocessorOptions.scss.additionalData`로 `_variables.scss`, `_mixins.scss`가 자동 주입됩니다. 별도 `@use` 없이 `$spacing-*`, `$color-*`, `respond()`를 바로 사용하세요.
- 전역 엔트리: `src/styles/index.scss`는 리셋/유틸/디자인 시스템 SCSS를 모두 로드합니다. 앱 엔트리(`main.ts`)에서 이 파일만 임포트합니다.
- 공용 유틸: 레이아웃/히어로/그리드/디바이더 등은 `_components.scss`의 클래스를 `@extend`하거나 `auto-grid` 믹스인을 사용합니다.
- 레거시 CSS: `src/assets/styles/main.css`와 `components/*.css`는 SCSS로 이관되어 제거되었습니다. 런타임 CSS 변수 파일(`variables.css`)만 유지합니다.

## 공용 모달/다이얼로그

- `TcModal`: 접근성/포커스 트랩/ESC/스크롤 잠금 제공, 텔레포트 사용
- `hideHeader` prop으로 헤더 제거 가능(aria-label 자동 설정)
- `TcDialog`: `TcModal` + `TcCard` 래핑으로 카드 룩앤필 모달 제공
- QuestionFlow의 분석 오버레이는 `TcDialog`로 교체되어 카드 UI를 유지하면서 모달 동작을 제공합니다.
