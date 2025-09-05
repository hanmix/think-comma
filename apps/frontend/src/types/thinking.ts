// ThinkComma - 고민 해결 프로세스 타입 정의

export interface WorryInput {
  content: string;
  category?: string;
}

export interface Choice {
  id: "A" | "B";
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
  selectedChoice: "A" | "B";
  choiceContent: string;
}

export interface PersonalityTrait {
  name: string;
  score: number;
  level: "low" | "medium" | "high";
}

export interface DecisionFactor {
  name: string;
  score: number;
  level: "low" | "medium" | "high";
}

export interface AnalysisResult {
  recommendedChoice: "A" | "B";
  recommendedChoiceLabel: string;
  otherChoiceLabel: string;
  confidence: number;
  scoreA: number;
  scoreB: number;
  personalityTraits: PersonalityTrait[];
  decisionFactors: DecisionFactor[];
  actionSteps: string[];
  summary: string;
  responses: UserResponse[];
}

export interface ThinkingSession {
  id: string;
  worry: WorryInput;
  questions: Question[];
  responses: UserResponse[];
  result?: AnalysisResult;
  createdAt: Date;
  completedAt?: Date;
}
