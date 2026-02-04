// ThinkComma - 고민 해결 프로세스 타입 정의

export interface WorryInput {
  content: string;
  category?: string;
}

export interface Choice {
  id: 'A' | 'B';
  content: string;
  description?: string;
}

export interface Question {
  id: number;
  text: string;
  choices: [Choice, Choice];
}

export interface UserResponse {
  questionId: number;
  selectedChoice: 'A' | 'B';
  choiceContent: string;
}

export interface PersonalityTrait {
  name: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  leansTo: 'A' | 'B' | 'neutral';
  evidence: string;
  relatedQuestions?: number[];
}

export interface DecisionFactor {
  name: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  side: 'A' | 'B';
  evidence: string;
  relatedQuestions?: number[];
}

export interface ActionGuideStep {
  title: string;
  description: string;
}

export interface ActionGuide {
  steps: ActionGuideStep[];
  nextSuggestion?: string;
}

export interface AnalysisResult {
  recommendedChoice: 'A' | 'B';
  recommendedChoiceLabel: string;
  otherChoiceLabel: string;
  confidence: number;
  scoreA: number;
  scoreB: number;
  personalityTraits: PersonalityTrait[];
  decisionFactors: DecisionFactor[];
  actionSteps: string[];
  actionGuide?: ActionGuide;
  rationale?: {
    overview: string;
    keyReasons: Array<{
      name: string;
      detail: string;
      weight?: number;
      relatedQuestions?: number[];
    }>;
  };
  summary: string;
  responses: UserResponse[];
}

// Intro framing shown before questions
export interface FramingIntro {
  summary: string; // e.g., 이 상황을 구조화해보면 "A vs B"로 정리할 수 있어요.
  choiceALabel: string;
  choiceBLabel: string;
  aHint: string; // e.g., 자리 비어있으면 합석 제안 등
  bHint: string; // e.g., 무리하지 않고 자연스럽게 등
  cta: string; // 예: 이렇게 설정해서 10개 질문으로 분석해볼까요?
}

export interface ThinkingSession {
  contextId: string;
  worry: WorryInput;
  questions: Question[];
  responses: UserResponse[];
  result?: AnalysisResult;
  createdAt: Date;
  completedAt?: Date;
}

export type ThinkingState = {
  currentStep: 'input' | 'intro' | 'questions' | 'result';
  isLoading: boolean;
  error: string;
  loadingMessage: string;
  contextId: string;
  worryInput: WorryInput | null;
  questions: Question[];
  responses: UserResponse[];
  analysisResult: AnalysisResult | null;
  framingIntro: FramingIntro | null;
};

export type ProcessStep = 'input' | 'intro' | 'questions' | 'result';
