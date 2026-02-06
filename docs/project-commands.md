# Project Commands

ThinkComma monorepo에서 사용하는 실행/빌드/타입 관련 명령을 정리합니다.  
모든 명령은 **레포지토리 루트**(`/Users/devki/workspace/think-comma`) 기준으로 실행합니다.

## 1) 개발 서버
- 프론트엔드만 실행
  - `pnpm dev:frontend`
- 백엔드만 실행
  - `pnpm dev:backend`
- 전체 워크스페이스 실행
  - `pnpm dev`

## 2) 빌드
- 전체 빌드
  - `pnpm build`
- 프론트엔드만 빌드
  - `pnpm build:frontend`
- 백엔드만 빌드
  - `pnpm build:backend`

## 3) 타입 체크(현재 구조 기준)
- 백엔드 타입 체크는 `build:backend`에 포함되어 있습니다.
  - `pnpm build:backend`
- 프론트엔드는 별도 typecheck 스크립트가 없습니다.
  - 필요 시 스크립트 추가를 권장합니다.

## 4) 참고
- workspace 필터는 `pnpm --filter <pkg>` 형식으로 확장할 수 있습니다.
  - 예: `pnpm --filter frontend dev`
  - 예: `pnpm --filter backend build`
