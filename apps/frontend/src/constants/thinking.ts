export const ProcessStep = {
  Input: 'input',
  Intro: 'intro',
  Questions: 'questions',
  Result: 'result',
} as const;

export const LevelLabel = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const;

export const RequestKey = {
  Framing: 'framing',
  Questions: 'questions',
  Analysis: 'analysis',
} as const;

export const FlowRoute = {
  Input: 'input',
  Intro: 'intro',
  Questions: 'questions',
  Result: 'result',
} as const;

export const genStages = [
  '고민의 핵심을 파악하고 있습니다...',
  '맥락과 우선순위를 정리하고 있습니다...',
  '맞춤형 질문 후보를 생성하고 있습니다...',
  '질문의 흐름과 난이도를 구성하고 있습니다...',
  '완성 중입니다... 곧 시작할게요!',
] as const;
