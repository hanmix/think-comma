# 디자인 시스템 · SCSS 가이드

디자인 시스템 규칙과 SCSS 사용 기준을 요약합니다.

## 핵심 원칙
- 토큰 중심: SCSS 변수 + CSS 커스텀 프로퍼티 혼합 사용
- 모바일 우선: 반응형은 `respond()` 믹스인으로 명시적 설계
- 접근성: 포커스/터치/명도 대비 준수
- 공용화: 레이아웃/그리드/히어로/디바이더/모달 패턴 표준화

## 토큰/믹스인 소스
- SCSS 토큰: `src/styles/_variables.scss`
- CSS 변수: `src/assets/styles/variables.css` (SCSS에서 `@import`)
- 믹스인: `src/styles/_mixins.scss` (`respond()`, `container()` 등)
- 전역 유틸: `src/styles/_global.scss`, `src/styles/_utilities.scss`, `src/styles/_components.scss`

## 브레이크포인트
- xs: 375px, sm: 768px, md: 1024px, lg: 1440px
- 사용 예: `@include respond(sm) { ... }` (max-width: 767px), `@include respond(md, up) { ... }` (min-width: 1024px)

## 레이아웃 유틸
- 섹션 간격: `.tc-section`
- 히어로: `.tc-hero`, `.tc-hero-heading`, `.tc-hero-actions`
- 디바이더: `.tc-divider`, `.tc-divider--spaced`, `.tc-sub-divider`
- 그리드: `@mixin auto-grid($min, $gap)` → `@include auto-grid(280px, $spacing-xl);`
- 2열 폼: `.tc-form-row-2` (모바일 1열)

## 디자인 시스템 SCSS
- `src/assets/styles/components/typography.scss`
- `src/assets/styles/components/buttons.scss`
- `src/assets/styles/components/cards.scss`
- `src/assets/styles/components/forms.scss`

## 컴포넌트 스타일링
- SFC 인라인 `<style scoped>` 대신 옆의 `.scss` 파일 사용
- 예) `QuestionFlow.vue` ↔ `QuestionFlow.scss`
- Teleport된 요소(TcModal/TcDialog 컨텐츠)는 전역 선택자로 별도 처리 필요
  - 예) `.tc-dialog-card .analyzing-content { ... }`

## 모달/다이얼로그 가이드
- TcModal: 접근성/포커스 트랩/ESC/스크롤 잠금
  - `hideHeader`로 헤더 숨기고 `aria-label` 자동 설정
- TcDialog: 모달 + 카드 래퍼 (카드 룩앤필 유지)
  - 슬롯: `header`/default/`footer`

### 예제 – TcDialog

```vue
<TcDialog v-model="open" title="알림">
  <p class="tc-body-text">완료되었습니다.</p>
  <template #footer>
    <TcButton variant="primary" @click="open = false">확인</TcButton>
  </template>
</TcDialog>
```

## SCSS 자동 주입
- Vite `additionalData`로 `_variables.scss`, `_mixins.scss`가 모든 SCSS에 자동 주입
- 각 파일 상단 `@use` 중복은 점진 제거 (현재 대부분 제거됨)

## 접근성 체크리스트
- 포커스 가시성 유지(`:focus-visible`)
- 터치 타깃 44px+
- 키보드 탐색(모달 포커스 트랩 확인)
- 색상 대비(최소 AA), 상태/에러 텍스트 명확성

## 스타일 가이드(코딩 규칙)
본 섹션은 디자인 시스템/컴포넌트 가이드와 중복되지 않는 규칙만 정리합니다.
### 1) SFC/SCSS 구조
- `<style scoped>` 사용 금지. 항상 옆의 `.scss` 파일로 분리하고 `<script setup>`에서 import 합니다.
  - 예: `src/components/ui/TcSelect.vue` → `import './TcSelect.scss'`
- 스타일 파일은 컴포넌트와 같은 디렉터리에 두고, 파일명은 컴포넌트명과 동일하게 맞춥니다.

### 2) 클래스 네이밍
- `tc-` 접두사 + 블록/엘리먼트 구조를 사용합니다.
- 컴포넌트 내부 전용 클래스는 의미가 명확한 명사형을 우선합니다.
- 상태 표현은 접미사로 통일합니다.
  - 예: `.tc-button.is-loading`, `.tc-input.is-error`

### 3) 텍스트/레이아웃 규칙
- 문장형 텍스트는 줄바꿈/개행을 고려해 `white-space: pre-wrap`가 필요한지 검토합니다.
- 텍스트는 기본적으로 `word-break: keep-all`을 우선합니다.
- 긴 텍스트가 UI를 깨지 않도록 `overflow-wrap: break-word`를 보조로 사용합니다.

### 4) 오버레이/포지셔닝
- 드롭다운/툴팁/팝오버는 **트리거 근처의 컨테이너**를 기준으로 배치합니다.
  - 컨테이너에 `position: relative`를 부여하고, 오버레이는 내부에서 `position: absolute`로 정렬합니다.
- 폼 전체를 기준으로 오버레이를 배치하지 않습니다.

### 5) 접근성 기본 원칙
- 인터랙션 요소는 `:focus-visible` 기준으로 포커스 스타일이 보여야 합니다.
- 클릭 가능 영역은 최소 44px을 권장합니다.
- 아이콘 버튼은 `aria-label`을 반드시 제공합니다.

## 코드 스니펫 – 반응형/그리드

```scss
.my-grid {
  @include auto-grid(260px, $spacing-lg);
  @include respond(sm) {
    // 모바일 조정
  }
}
```

## 향후 확장

- @custom-media 도입(PostCSS)으로 브레이크포인트 별칭화
- Alert/Toast/Tooltip/Popover/Tabs/Accordion 등 DS 컴포넌트 추가
- 다크 테마 팔레트 재도입(요청 시)
