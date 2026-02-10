# 워크스페이스 패키지 설치 가이드

이 문서는 워크스페이스에서의 패키지 설치 규칙과 재발 방지 가이드를 정리합니다.
Vue Router 중복 로딩 사례는 별도 문서인
`docs/vue-router-duplicate-loading.md`에 정리했습니다.

## 1) 워크스페이스 패키지 설치 규칙

### 규칙 A. 앱 런타임 의존성은 반드시 앱에 선언
1. 앱에서 런타임에 쓰는 패키지는 해당 앱 `package.json`에 반드시 명시.
2. 예시 (frontend):
   1. `vue`
   2. `vue-router`
   3. `pinia`
   4. `@vueuse/core`

### 규칙 B. 공용 패키지도 각 패키지에서 의존성 선언
1. 루트에 설치하더라도, 실제 사용하는 패키지는 각 앱/패키지에 선언 필요.
2. 그래야 resolve 경로가 안정되고 중복 로딩 위험이 줄어듦.

### 규칙 C. 워크스페이스는 pnpm으로 설치
1. 이 repo는 `pnpm` 워크스페이스 기준.
2. `npm install`은 사용하지 않음.
3. 권장 명령:
   1. 루트 공용 설치: `pnpm -w add <pkg>`
   2. 특정 앱 설치: `pnpm --filter frontend add <pkg>`

### 규칙 D. 프레임워크 패키지는 dedupe 설정
1. Vue 앱은 Vite에서 dedupe 설정:
   1. `resolve.dedupe: ['vue', 'vue-router', 'pinia']`
2. 중복 인스턴스가 번들에 포함되는 것을 방지.

## 2) 빠른 점검 체크리스트
1. 앱 런타임 의존성이 해당 앱 `package.json`에 선언되어 있는가?
2. 공용 패키지도 사용하는 패키지마다 의존성에 명시했는가?
3. 워크스페이스 설치는 `pnpm`으로만 수행했는가?
4. 프레임워크 패키지는 dedupe 설정을 유지했는가?
