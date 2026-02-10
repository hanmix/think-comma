# Vue Router 중복 로딩 문제

이 문서는 Vue Router가 중복 로딩될 때 발생하는 증상, 원인, 해결 방법을
사례 중심으로 정리한 별도 문서입니다.

## 1) 증상
1. 라우터 가드 로그에서는 정상적으로 경로가 변경된다.
2. `RouterView`는 빈 화면을 렌더링한다.
3. `useRoute()`는 계속 `/`을 반환한다.
4. 콘솔 에러/경고가 없어도 화면이 비어 있을 수 있다.

## 2) 핵심 원인
1. `vue-router`가 번들에 **두 인스턴스**로 포함됨.
2. `app.use(router)`로 설치된 인스턴스와
   `RouterView/useRoute`가 사용하는 인스턴스가 서로 다름.
3. 결과적으로 라우터는 이동하지만 UI는 업데이트되지 않음.

## 3) 어떻게 중복 로딩이 생기나
1. 앱 패키지(`apps/frontend`)에 `vue`, `vue-router`, `pinia`가 선언되지 않음.
2. 루트에만 설치되어 있고, Vite가 여러 경로에서 resolve.
3. 워크스페이스 구조/alias/내부 패키지 경로가 섞이면
   동일 라이브러리가 중복 포함될 확률이 높아짐.

## 4) 진단 방법 (상세)

### 4.1 라우터 이동은 되지만 화면이 비는지 확인
1. 라우터 가드 로그를 넣어서 `to.fullPath`가 바뀌는지 확인.
2. 동시에 화면이 비어 있다면 “렌더 체인 문제” 가능성이 높음.

### 4.2 `useRoute()`와 `router.currentRoute` 비교
1. `App.vue` 같은 상위 컴포넌트에서:
   1. `const route = useRoute()`
   2. `import router from '@/router'`
2. 둘의 값을 로그로 동시에 출력:
   1. `route.fullPath`
   2. `router.currentRoute.value.fullPath`
3. **값이 다르면 중복 로딩 가능성이 매우 높음.**

### 4.3 RouterView 렌더 체인 확인
1. 라우터가 렌더해야 할 컴포넌트에 `mounted` 로그 추가.
2. 예시:
   1. `FlowLayout`
   2. `ThinkingFlow`
   3. `ThinkingProcess`
3. 라우터는 이동했는데 이 로그가 전혀 없다면, RouterView가 렌더하지 못하는 상태.

### 4.4 라우터 인스턴스 설치 확인
1. `main.ts`에서 아래 체크:
   1. `app._context.provides[routerKey] === router`
2. `false`면 설치가 실패했거나 다른 인스턴스가 들어갔을 가능성.

### 4.5 번들 중복 여부 확인
1. `apps/frontend`의 `node_modules`에 `vue`/`vue-router`가 실제로 있는지 확인.
2. 루트에도 동일 패키지가 있다면 resolve 경로가 분리될 수 있음.
3. Vite에 `resolve.dedupe`가 없으면 중복 포함 위험이 커짐.

### 4.6 빠른 판단 기준
1. 라우터 가드는 정상 + `RouterView` 빈 화면
2. `useRoute()`와 `router.currentRoute`가 서로 다름
3. 앱 패키지에 런타임 의존성 미선언

위 3개가 동시에 맞으면 **중복 로딩 문제로 판단**해도 됨.

## 5) 해결 방법
1. 앱 패키지에 런타임 의존성 명시:
   1. `vue`
   2. `vue-router`
   3. `pinia`
2. Vite dedupe 설정:
   1. `resolve.dedupe: ['vue', 'vue-router', 'pinia']`
3. 워크스페이스는 `pnpm`으로 설치:
   1. `pnpm install`
   2. `pnpm --filter frontend dev`

## 6) 예방 규칙
1. 앱 런타임 패키지는 반드시 앱에 선언.
2. 공용 패키지도 사용하는 패키지마다 의존성에 명시.
3. Vue 앱은 dedupe 설정을 기본으로 유지.
