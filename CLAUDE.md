# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**UI 시스템**: ThinkComma Design System v2.0을 따르는 컴포넌트 라이브러리
- 모든 컴포넌트는 `Tc` 접두사 사용 (예: `TcButton`, `TcCard`, `TcInput`)
- `src/components/ui/`에 위치
- `src/assets/styles/`의 CSS 커스텀 프로퍼티 기반 테마

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

### 디자인 시스템
`tc-` 접두사가 있는 BEM 유사 네이밍을 따르는 CSS 아키텍처:
- `src/assets/styles/variables.css`: 디자인 토큰 (색상, 간격, 타이포그래피)
- `src/assets/styles/components/`: 모듈식 컴포넌트 스타일
- 4.5:1+ 대비비를 가진 WCAG AA 준수 색상 시스템
- Sage Green(#27ae60)을 사용한 브랜드 쉼표 강조

### 상태 관리
복잡한 상태 관리 없음 - Vue 3 Composition API 사용:
- prop 전달을 통한 세션 기반 데이터 플로우
- 세션 지속성/복구를 위한 LocalStorage
- 유효성 검사가 있는 반응형 폼

## 통합 포인트

메인 애플리케이션 뷰(`ExamplePage.vue`)는 다음 사이를 전환합니다:
- 서비스 설명이 있는 랜딩 페이지
- 실제 고민 해결을 위한 `ThinkingProcess` 컴포넌트

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
import { TcButton } from '@/components/ui';
import { WorryInput } from '@/types/thinking';
import ExamplePage from '@/views/ExamplePage.vue';

// ❌ 잘못된 방법
import { TcButton } from '../ui';
import { WorryInput } from '../../types/thinking';
import ExamplePage from '../views/ExamplePage.vue';
```

VSCode 설정이 자동으로 `@` 별칭을 사용하도록 구성되어 있으며, 새 파일 생성 시 자동 import도 절대 경로를 사용합니다.