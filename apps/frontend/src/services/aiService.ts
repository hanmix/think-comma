// ThinkComma - Mock AI Service
// 실제 프로덕션에서는 실제 AI API로 대체

import type {
  AnalysisResult,
  DecisionFactor,
  PersonalityTrait,
  Question,
  UserResponse,
  WorryInput,
} from "@/types/thinking";

class AIService {
  private baseUrl = (import.meta as any).env?.VITE_API_BASE || "http://localhost:4000";

  private async post<T>(path: string, body: any): Promise<T> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      try { const er = await resp.json(); throw new Error(er?.error || `HTTP ${resp.status}`); }
      catch { throw new Error(`HTTP ${resp.status}`); }
    }
    return resp.json();
  }
  private readonly delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async generateQuestions(worry: WorryInput): Promise<Question[]> {
    const data = await this.post<{ questions: Question[] }>(
      "/api/generate-questions",
      { worry }
    );
    return data.questions;
  }

  async generateAnalysis(
    worry: WorryInput,
    questions: Question[],
    responses: UserResponse[]
  ): Promise<AnalysisResult> {
    const payloadResponses = responses.map(r => ({ questionId: r.questionId, answer: r.selectedChoice }));
    const data = await this.post<{ result: AnalysisResult }>(
      "/api/analyze",
      { worry, questions, responses: payloadResponses }
    );
    return { ...data.result, responses };
  }

  private getBaseQuestionsByCategory(category?: string) {
    const questionSets: Record<string, any[]> = {
      career: [
        {
          text: "현재 상황에 대한 스트레스 수준은?",
          choices: [
            { id: "A", content: "관리할 수 있는 수준이다" },
            { id: "B", content: "상당히 부담스럽다" },
          ],
        },
        {
          text: "장기적 목표를 생각했을 때?",
          choices: [
            { id: "A", content: "현재 경로가 더 안전하다고 생각한다" },
            { id: "B", content: "변화가 필요하다고 느낀다" },
          ],
        },
        {
          text: "주변 사람들의 조언은?",
          choices: [
            { id: "A", content: "신중하게 생각하라고 말한다" },
            { id: "B", content: "도전해보라고 격려한다" },
          ],
        },
      ],
      relationship: [
        {
          text: "이 상황이 지속된다면?",
          choices: [
            { id: "A", content: "시간이 해결해줄 것 같다" },
            { id: "B", content: "적극적인 행동이 필요하다" },
          ],
        },
        {
          text: "상대방의 입장에서 생각해보면?",
          choices: [
            { id: "A", content: "나와 비슷하게 고민하고 있을 것 같다" },
            { id: "B", content: "다른 생각을 가지고 있을 것 같다" },
          ],
        },
      ],
      business: [
        {
          text: "실패했을 때의 상황을 상상해보면?",
          choices: [
            { id: "A", content: "감당하기 어려울 것 같다" },
            { id: "B", content: "배움의 기회가 될 것 같다" },
          ],
        },
        {
          text: "현재 가진 자원(시간, 돈, 인맥)을 고려하면?",
          choices: [
            { id: "A", content: "부족하다고 느낀다" },
            { id: "B", content: "시작하기에 충분하다" },
          ],
        },
      ],
    };

    const commonQuestions = [
      {
        text: "이 문제에 대해 생각하는 시간이?",
        choices: [
          { id: "A", content: "하루에 30분 미만이다" },
          { id: "B", content: "하루에 1시간 이상이다" },
        ],
      },
      {
        text: "비슷한 상황을 겪은 경험이 있다면?",
        choices: [
          { id: "A", content: "신중하게 결정해서 좋은 결과를 얻었다" },
          { id: "B", content: "빨리 결정했어야 했다고 후회했다" },
        ],
      },
      {
        text: "이 결정의 영향을 받는 사람들을 생각하면?",
        choices: [
          { id: "A", content: "안정성을 더 중요하게 여길 것 같다" },
          { id: "B", content: "나의 행복을 더 중요하게 여길 것 같다" },
        ],
      },
      {
        text: "6개월 후의 나를 상상해보면?",
        choices: [
          { id: "A", content: "현재 선택을 유지하고 있을 것 같다" },
          { id: "B", content: "변화된 모습이어야 한다고 생각한다" },
        ],
      },
      {
        text: "가장 중요하게 생각하는 가치는?",
        choices: [
          { id: "A", content: "안정과 확실성" },
          { id: "B", content: "성장과 도전" },
        ],
      },
      {
        text: "직감적으로 끌리는 선택은?",
        choices: [
          { id: "A", content: "현재 상황을 개선하는 것" },
          { id: "B", content: "완전히 새로운 시작" },
        ],
      },
    ];

    return [...(questionSets[category || ""] || []), ...commonQuestions];
  }

  private generateContextSpecificQuestions(worryContent: string): any[] {
    // Analyze worry content for keywords and generate relevant questions
    const keywords = worryContent.toLowerCase();
    const contextQuestions = [];

    if (
      keywords.includes("나이") ||
      keywords.includes("늦") ||
      keywords.includes("마지막")
    ) {
      contextQuestions.push({
        text: "나이나 시기에 대한 우려가?",
        choices: [
          { id: "A", content: "결정적인 장애물이라고 생각한다" },
          { id: "B", content: "극복할 수 있는 요소라고 생각한다" },
        ],
      });
    }

    if (
      keywords.includes("돈") ||
      keywords.includes("경제") ||
      keywords.includes("재정")
    ) {
      contextQuestions.push({
        text: "경제적 부담에 대해?",
        choices: [
          { id: "A", content: "현실적으로 감당하기 어렵다" },
          { id: "B", content: "노력하면 해결할 수 있다" },
        ],
      });
    }

    if (
      keywords.includes("가족") ||
      keywords.includes("부모") ||
      keywords.includes("배우자")
    ) {
      contextQuestions.push({
        text: "가족의 반응을 고려하면?",
        choices: [
          { id: "A", content: "이해받기 어려울 것 같다" },
          { id: "B", content: "결국 지지해줄 것 같다" },
        ],
      });
    }

    return contextQuestions;
  }

  private analyzeResponses(worry: WorryInput, responses: UserResponse[]) {
    const aCount = responses.filter((r) => r.selectedChoice === "A").length;
    const bCount = responses.filter((r) => r.selectedChoice === "B").length;
    const total = responses.length;

    // Calculate scores
    const scoreA = Math.round((aCount / total) * 100);
    const scoreB = Math.round((bCount / total) * 100);

    // Determine recommendation
    const recommendedChoice: "A" | "B" = scoreB > scoreA ? "B" : "A";
    const confidence = Math.max(scoreA, scoreB);

    // Generate category-specific labels
    const labels = this.getChoiceLabels(worry.category, worry.content);

    // Generate personality traits based on responses
    const personalityTraits = this.generatePersonalityTraits(responses);

    // Generate decision factors
    const decisionFactors = this.generateDecisionFactors(responses, worry);

    return {
      recommendedChoice,
      recommendedChoiceLabel:
        recommendedChoice === "A" ? labels.labelA : labels.labelB,
      otherChoiceLabel:
        recommendedChoice === "A" ? labels.labelB : labels.labelA,
      confidence,
      scoreA,
      scoreB,
      personalityTraits,
      decisionFactors,
    };
  }

  private getChoiceLabels(category?: string, content?: string) {
    // Default labels that can be customized based on category and content
    const defaultLabels = {
      labelA: "현재 방식 유지하기",
      labelB: "적극적인 변화 추구하기",
    };

    const categoryLabels: Record<string, any> = {
      career: {
        labelA: "현재 직장에서 안정성 추구",
        labelB: "새로운 기회로 도전하기",
      },
      relationship: {
        labelA: "현재 관계 개선 노력",
        labelB: "새로운 선택 또는 결단",
      },
      business: {
        labelA: "안전한 길 선택하기",
        labelB: "창업/사업 도전하기",
      },
      life: {
        labelA: "현재 생활 방식 유지",
        labelB: "라이프스타일 변화 추구",
      },
    };

    return categoryLabels[category || ""] || defaultLabels;
  }

  private generatePersonalityTraits(
    responses: UserResponse[]
  ): PersonalityTrait[] {
    // Simulate personality analysis based on response patterns
    const aCount = responses.filter((r) => r.selectedChoice === "A").length;
    const bCount = responses.filter((r) => r.selectedChoice === "B").length;
    const total = responses.length;

    const cautionScore = (aCount / total) * 100;
    const changeOrientation = (bCount / total) * 100;
    const stressLevel = Math.random() * 40 + 30; // Random between 30-70
    const decisionSpeed = Math.random() * 50 + 25; // Random between 25-75

    return [
      {
        name: "신중성",
        score: Math.round(cautionScore),
        level:
          cautionScore >= 70 ? "high" : cautionScore >= 40 ? "medium" : "low",
      },
      {
        name: "변화추구",
        score: Math.round(changeOrientation),
        level:
          changeOrientation >= 70
            ? "high"
            : changeOrientation >= 40
            ? "medium"
            : "low",
      },
      {
        name: "스트레스 수준",
        score: Math.round(stressLevel),
        level:
          stressLevel >= 60 ? "high" : stressLevel >= 40 ? "medium" : "low",
      },
      {
        name: "결정력",
        score: Math.round(decisionSpeed),
        level:
          decisionSpeed >= 60 ? "high" : decisionSpeed >= 40 ? "medium" : "low",
      },
    ];
  }

  private generateDecisionFactors(
    responses: UserResponse[],
    worry: WorryInput
  ): DecisionFactor[] {
    const bCount = responses.filter((r) => r.selectedChoice === "B").length;
    const total = responses.length;
    const changeNeed = (bCount / total) * 100;

    return [
      {
        name: "변화 필요성",
        score: Math.round(changeNeed),
        level: changeNeed >= 70 ? "high" : changeNeed >= 40 ? "medium" : "low",
      },
      {
        name: "현재 상황 부담",
        score: Math.round(Math.random() * 30 + 60), // 60-90 range
        level: "high",
      },
      {
        name: "실행 가능성",
        score: Math.round(Math.random() * 40 + 50), // 50-90 range
        level: "medium",
      },
      {
        name: "장기적 만족도",
        score: Math.round(changeNeed * 0.9), // Correlates with change need
        level: changeNeed >= 60 ? "high" : "medium",
      },
    ];
  }

  private generateActionSteps(
    worry: WorryInput,
    recommendedChoice: "A" | "B"
  ): string[] {
    const category = worry.category;

    const actionStepsByCategory: Record<string, any> = {
      career: {
        A: [
          "현재 직장에서 스킬 업그레이드 계획 세우기",
          "상사나 멘토와 커리어 발전 상담하기",
          "업무 효율성을 높이는 시스템 구축하기",
        ],
        B: [
          "새로운 분야 정보 수집 및 네트워킹 시작하기",
          "이력서 업데이트 및 포트폴리오 정리하기",
          "단계적 전환 계획 수립하기",
        ],
      },
      relationship: {
        A: [
          "솔직한 대화의 시간 만들기",
          "관계 개선을 위한 구체적 노력하기",
          "전문가 상담 고려해보기",
        ],
        B: [
          "자신의 감정과 욕구 명확히 하기",
          "결정에 대한 준비와 계획 세우기",
          "주변 지원 시스템 구축하기",
        ],
      },
    };

    const defaultSteps = {
      A: [
        "현재 상황을 개선할 수 있는 작은 변화부터 시작하기",
        "전문가나 경험자의 조언 구하기",
        "정기적인 점검과 조정 시간 갖기",
      ],
      B: [
        "구체적인 행동 계획과 타임라인 수립하기",
        "필요한 자원과 지원 시스템 준비하기",
        "점진적 실행과 지속적 피드백 받기",
      ],
    };

    const categorySteps = actionStepsByCategory[category || ""];
    return categorySteps
      ? categorySteps[recommendedChoice]
      : defaultSteps[recommendedChoice];
  }

  private generateSummary(
    worry: WorryInput,
    recommendedChoice: "A" | "B"
  ): string {
    const summaries = {
      A: "현재 상황을 최적화하면서 안정성을 유지하는 것이 최선의 선택입니다",
      B: "적극적인 변화를 통해 더 나은 미래를 만들어가는 것이 좋겠습니다",
    };

    return summaries[recommendedChoice];
  }
}

export const aiService = new AIService();
