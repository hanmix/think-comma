# Backend Folder Structure Analysis (Detailed)

이 문서는 `apps/backend`의 폴더 구조를 기준으로 코드의 역할과 동작 흐름을 자세히 풀어쓴 분석입니다.

## 1) Top-level 구조와 역할

- `src/`
  - 실제 서비스 로직이 존재하는 소스 코드 디렉터리
  - Express 서버 부트스트랩, 라우팅, 미들웨어, OpenAI 연동 로직 포함
- `dist/`
  - `tsc` 컴파일 결과물(빌드 산출물)
  - 런타임 배포/실행 시 이 디렉터리를 사용할 수 있는 구조
- `logs/`
  - 서버 실행 중 생성되는 요청 로그 보관
  - 날짜(KST 기준)별로 텍스트 파일이 생성됨
- `node_modules/`
  - 설치된 외부 의존성 패키지
- `package.json`
  - 실행 스크립트 및 의존성 정의
- `tsconfig.json`
  - TypeScript 컴파일 설정

## 2) 실행 진입점: `src/index.ts`

`index.ts`는 서버의 전체 라이프사이클을 묶는 단일 진입점입니다.

- Express 앱 생성
- JSON 파서 적용 (`express.json({ limit: '1mb' })`)
- 공통 미들웨어 순서
  1. `requestIdMiddleware`:
     - `x-request-id` 헤더가 있으면 그대로 사용
     - 없으면 새 UUID 생성
  2. `loggerMiddleware`:
     - 요청 시작/종료/중단을 파일 로그로 기록
     - `requestId` 기반으로 추적 가능
  3. `corsMiddleware`:
     - `CORS_ORIGIN` 환경값 또는 전체 허용
  4. `rateLimitMiddleware`:
     - IP 기준 1분당 최대 60 요청 제한
- 라우트 마운트
  - `/api/health` → 상태 체크
  - `/api/chat` → 단순 텍스트 생성
  - `/api/generate-questions` → 질문 생성
  - `/api/analyze` → 분석 결과 생성
  - `/api/framing` → A/B 프레이밍 생성
- 루트(`/`) 요청에는 간단한 텍스트 응답
- `errorMiddleware`로 모든 에러 응답 통일

## 3) 환경 설정: `src/config/env.ts`

환경 변수 로딩 및 검증을 담당합니다.

- `dotenv.config()`로 `.env` 로딩
- `zod` 스키마를 통해 값 타입 검증
  - `OPENAI_BASE_URL`은 URL 형태만 통과
  - `OPENAI_MODEL`은 기본값 `gpt-3.5-turbo`
  - `TIMEOUT_MS`는 문자열로 들어온 값을 숫자로 변환
- 검증 실패 시 애플리케이션이 즉시 예외를 던져 부정확한 설정으로 실행되지 않도록 함

## 4) 라우트 레이어 (`src/routes`)

### 4.1 Health

- `health.ts` (`GET /api/health`)
  - 로직 없음, `status: ok` 반환
  - 로드 밸런서나 모니터링에서 헬스 체크 용도로 사용

### 4.2 Chat

- `chat.ts` (`POST /api/chat`)
  - 입력 스키마
    - `messages`: 역할(`user|assistant|system`)과 텍스트의 배열
    - `temperature`, `model`, `stream` 옵션 지원
  - 내부 동작
    1. Zod로 요청 바디 파싱
    2. 강제로 `stream: false` 처리 (단일 응답만 반환)
    3. `OPENAI_API_KEY`가 없으면 개발용 안내 메시지 반환
    4. `generateText` 호출 → 텍스트 결과 반환
  - 에러 처리
    - 라우트 내부 `try/catch`로 상태 코드 및 메시지 응답

### 4.3 Questions

- `questions.ts` (`POST /api/generate-questions`)
  - 입력
    - `worry.content` (필수)
    - `worry.category` (선택)
    - `contextId` (필수, `x-context-id` 헤더)
  - 동작 흐름
    1. 입력 검증
    2. AI 기반 질문 생성 시도
       - `buildQuestionsPrompt`로 프롬프트 구성
       - `generateJSON`으로 AI 응답을 JSON으로 받도록 요청
       - 스키마(`AIQuestionsSchema`) 검증
       - 실패 시 normalize 로직으로 최대 10개 질문을 강제 추출
    3. AI 실패 시 에러 응답
  - 응답 포맷
    - `{ source: 'ai' | 'ai-normalized', questions: [...] }`

### 4.4 Analysis

- `analysis.ts` (`POST /api/analyze`)
  - 입력
    - `worry`, `questions`, `responses`
    - `contextId` (필수, `x-context-id` 헤더)
    - 사용자 제공 라벨(`labels`)
  - 동작 흐름
    1. 입력 검증
    2. AI 분석 시도
       - `buildAnalysisPrompt`로 프롬프트 생성
       - `generateJSON`으로 구조화 결과 요청
       - `confidence`를 0~1 / 0~100 형태 모두 허용
       - 사용자 제공 라벨이 있으면 우선 적용
    3. AI 실패 시 에러 응답
  - 응답 포맷
    - `{ source: 'ai', result: {...} }`

### 4.5 Framing

- `framing.ts` (`POST /api/framing`)
  - 입력: `worry`
  - 동작 흐름
    1. 입력 검증
    2. AI 프레이밍 시도
       - `buildFramingPrompt` 사용
    3. AI 실패 시 에러 응답
  - 응답 포맷
    - `{ source: 'ai', framing: {...}, contextId }`

### 4.6 Identity

- 익명 사용자 식별: `anon_id` 쿠키
- 작업/세션 식별: `contextId` (헤더 전달)
- `contextId`는 `anon_id`와 매핑되어 검증됨

## 5) 라이브러리 레이어 (`src/lib`)

### 5.1 OpenAI 연동 (`openai.ts`)

- 핵심 역할: OpenAI SDK 래핑 및 안정적인 폴백 제공
- 주요 특징
  - API 키가 없으면 명시적으로 에러 발생
  - Responses API 우선 사용 (다양한 키 포맷 호환성 강화)
  - 실패 시 Chat Completions로 폴백

#### `generateText`

- 입력: 메시지 배열, 모델, 온도
- 내부 동작
  - 메시지를 단일 텍스트 프롬프트로 합쳐 Responses API 호출
  - 실패 시 chat.completions 호출

#### `generateJSON`

- JSON 반환 강제
- 단계별 폴백
  1. Responses API + JSON 모드
  2. Chat Completions + JSON 모드
  3. 일반 텍스트 생성 후 JSON 추출
- `extractJson` 함수로 fenced 코드블록 및 불필요 텍스트 제거

### 5.2 프롬프트 구성 (`prompts.ts`)

- `buildQuestionsPrompt`
  - A/B 질문 10개 생성 지침 포함
  - 카테고리 기반 예시 및 형식 규칙을 명시
- `buildAnalysisPrompt`
  - 질문/응답을 종합 분석하는 JSON 스키마 정의
  - 점수, 액션 스텝, 성향, 판단 근거 등 상세 필드 요구
- `buildFramingPrompt`
  - 고민을 A vs B 구조로 정리하는 프레이밍 출력 요구

## 6) 미들웨어 (`src/middlewares`)

- `cors.ts`
  - `CORS_ORIGIN` 없으면 전부 허용
  - 쿠키/자격 증명은 허용하지 않음

- `error.ts`
  - Zod 에러는 400 + 상세 이슈 반환
  - 그 외는 기본 500 처리

- `rateLimit.ts`
  - 1분당 60 요청 제한
  - 표준 헤더 출력, 레거시 헤더는 비활성화

- `requestId.ts`
  - `x-request-id` 헤더 전달 시 추적 가능
  - 없으면 UUID 부여

- `logger.ts`
  - KST 기준 날짜별 로그 파일 생성
  - 요청 시작/완료/중단을 구조화 로그로 저장
  - `requestId`로 단일 요청 전체 흐름 추적 가능

## 7) 실행 스크립트와 개발 흐름

- `npm run dev`
  - `ts-node-dev`로 즉시 실행
  - 파일 변경 시 자동 재시작
- `npm run build`
  - `tsc` 실행 → `dist/`에 빌드 결과 생성

## 8) 요청 처리 전반 흐름 요약

1. `index.ts`에서 JSON 파싱 및 미들웨어 체인 진입
2. `requestId` 생성 및 로그 기록
3. `/api/*` 라우트 분기
4. 각 라우트에서 입력 검증(`zod`) 수행
5. OpenAI 호출 시도 → 실패 시 폴백 로직 적용
6. 결과를 JSON 응답으로 반환
7. 미처리 에러는 `errorMiddleware`에서 일괄 처리
