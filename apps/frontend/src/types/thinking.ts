// ThinkComma - 고민 해결 프로세스 타입 정의

import {
  FlowRoute,
  LevelLabel,
  ProcessStep,
  RequestKey,
} from '@/constants/thinking';

export interface WorryInput {
  content: string;
  category?: string;
}

export interface Choice {
  id: SideType;
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
  selectedChoice: SideType;
  choiceContent: string;
}

export interface PersonalityTrait {
  name: string;
  score: number;
  level: LevelType;
  leansTo: SideType | 'neutral';
  evidence: string;
  relatedQuestions?: number[];
}

export interface DecisionFactor {
  name: string;
  score: number;
  level: LevelType;
  side: SideType;
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
  recommendedChoice: SideType;
  recommendedChoiceLabel: string;
  otherChoiceLabel: string;
  confidence: number;
  scoreA: number;
  scoreB: number;
  axisAlignment?: {
    scoreA: number;
    scoreB: number;
  };
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
  guidance: string;
  responses: UserResponse[];
}

// 질문 시작 전에 보여주는 프레이밍 안내
export interface FramingIntro {
  choiceALabel: string;
  choiceBLabel: string;
  aHint: string; // 예: 자리 비어있으면 합석 제안 등
  bHint: string; // 예: 무리하지 않고 자연스럽게 등
  axis: {
    axisName: string;
    axisA: string;
    axisB: string;
    rationaleA: string;
    rationaleB: string;
    keywords?: string[];
  };
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
  currentStep: ProcessStepType;
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

export type ProcessStepType = (typeof ProcessStep)[keyof typeof ProcessStep];
export type LevelType = (typeof LevelLabel)[keyof typeof LevelLabel];
export type SideType = 'A' | 'B';
export type RequestKeyType = (typeof RequestKey)[keyof typeof RequestKey];
export type FlowRouteType = (typeof FlowRoute)[keyof typeof FlowRoute];
