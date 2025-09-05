export interface BuildQuestionsInput {
  worry: { content: string; category?: string };
}

export function buildQuestionsPrompt({ worry }: BuildQuestionsInput) {
  const category = worry.category ? `\n- 카테고리: ${worry.category}` : "";
  const content = worry.content.replace(/\n/g, " ");

  return `다음 사용자의 고민을 바탕으로 A/B 이지선다 질문 10개를 한국어로 생성하세요.

[구조화된 질문 세트 규칙]
- 반드시 10문항을 생성합니다.
- 질문 순서: (1~3) 일반적 → (4~7) 구체적 → (8~10) 가치관/우선순위
- 모든 질문은 A vs B 이지선다이며, 상반된 선택지를 제시합니다.
- 각 선택지는 간결한 content와 한 줄 description을 포함합니다.

[카테고리 예시: 이직/커리어]
- 현재 직무 만족도: 높다 vs 낮다
- 경제적 안정성: 매우 중요 vs 어느 정도 감수 가능
- 새로운 도전: 기대된다 vs 두렵다
- 현재 회사 발전 가능성: 있다 vs 제한적이다
- 업계 전망: 밝다 vs 불확실하다
- 가족/주변 의견: 고려해야 한다 vs 내 결정이 우선
- 스트레스 정도: 견딜만하다 vs 한계점이다
- 새 직장 확신: 있다 vs 불확실하다
- 현재 나이/시점: 적절하다 vs 너무 이르다/늦다
- 후회 가능성: 안 하면 후회할 것 같다 vs 했다가 후회할 것 같다

[디테일 가이드]
- 각 질문의 text는 두 부분으로 구성합니다: (1) 상황/판단 기준 질문 + (2) 마무리 확인 문구(예: “어느 쪽이 더 가깝나요?”, “어떤 마음이 더 큰가요?”, “어느 쪽이 더 맞나요?”).
- choices.content는 짧고 상반되게 작성하고, choices.description에는 사용자가 바로 공감할 수 있는 맥락/근거를 1문장으로 구체화합니다.
- 카테고리에 따라 어휘를 자연스럽게 조정하되, 동일 질문이라도 맥락을 바꿔 반복하지 않도록 합니다.

[관계(연애/인간관계) 예시 스타일]
“현재 그 사람과의 관계에서 당신의 확신도는?”
  A. 어느 정도 관심을 보여줄만하다 - 상대방도 나에게 관심이 있을 것 같고, 대화하면 즐거울 것 같다
  B. 확신이 서지 않는다 - 상대방이 어떻게 생각할지 모르겠고, 부담스러워할 수도 있을 것 같다
  (어느 쪽이 더 가깝나요?)
“현재 상황에 대한 당신의 감정 상태는?”
  A. 기회를 놓치면 아쉬울 것 같다 - 이런 우연한 만남이 흔하지 않으니까 시도해보고 싶다
  B. 어색해질까 봐 걱정된다 - 괜히 다가갔다가 분위기가 어색해지면 앞으로도 불편할 것 같다
  (어떤 마음이 더 큰가요?)
“평소 당신의 성향은 어떤가요?”
  A. 적극적인 편이다 - 새로운 사람들과 관계를 만들어가는 것을 좋아하고, 먼저 다가가는 편이다
  B. 신중한 편이다 - 관계를 서두르기보다는 자연스럽게 발전되기를 기다리는 편이다
  (어느 쪽이 더 맞나요?)
“그 사람과의 기존 만남의 맥락은 어땠나요?”
  A. 서로 호감을 보였던 편이다 - 대화할 때 편했고, 서로 관심 있어 보이는 신호들이 있었다
  B. 애매한 관계였다 - 인사 정도만 나누는 사이거나, 상대방의 관심도를 파악하기 어려웠다
  (어느 쪽에 가까운가요?)

위 예시는 스타일 가이드일 뿐이며, 실제 질문은 사용자 고민과 카테고리에 맞춰 재작성하세요.


[출력 형식]
- 반드시 아래 JSON 스키마에 맞춘 JSON 객체만 출력하세요 (추가 텍스트 금지).
{
  "questions": [
    {
      "text": "질문 내용",
      "choices": [
        { "id": "A", "content": "선택지 A", "description": "A 선택지에 대한 한 줄 설명" },
        { "id": "B", "content": "선택지 B", "description": "B 선택지에 대한 한 줄 설명" }
      ]
    }
  ]
}

[입력]
- 내용: ${content}${category}
`;
}

export interface BuildAnalysisInput {
  worry: { content: string; category?: string };
  questions: Array<{
    id: number;
    text: string;
    choices: Array<{ id: "A" | "B"; content: string; description?: string }>;
  }>;
  responses: Array<{ questionId: number; answer: "A" | "B" }>;
}

export function buildAnalysisPrompt({
  worry,
  questions,
  responses,
}: BuildAnalysisInput) {
  const qLines = questions
    .map((q) => {
      const a = q.choices.find((c) => c.id === "A");
      const b = q.choices.find((c) => c.id === "B");
      return `- Q${q.id}. ${q.text}\n  A) ${a?.content}${
        a?.description ? ` (${a.description})` : ""
      }\n  B) ${b?.content}${b?.description ? ` (${b.description})` : ""}`;
    })
    .join("\n");
  const rLines = responses
    .map((r) => `Q${r.questionId}: ${r.answer}`)
    .join(", ");

  return `다음 고민과 A/B 선택형 질문-응답 결과를 바탕으로 종합 분석을 수행하세요.
UI에 바로 매핑 가능한 JSON만 출력하세요(추가 텍스트 금지). 한국어로 작성합니다.

필수 출력 JSON 스키마:
{
  "recommendedChoice": "A" | "B",
  "choiceALabel": string,
  "choiceBLabel": string,
  "recommendedChoiceLabel": string,
  "otherChoiceLabel": string,
  "confidence": number, // 0~1 또는 0~100 (퍼센트)
  "scoreA": number,     // A 점수(정수). 가능하면 0~100 퍼센트로 산정
  "scoreB": number,     // B 점수(정수). 가능하면 0~100 퍼센트로 산정
  "summary": string,    // 한 줄 요약(카드의 부제목처럼 간결하게)
  "actionSteps": string[],
  "personalityTraits": [ { "name": string, "score": number, "level": "low"|"medium"|"high" } ],
  "decisionFactors": [ { "name": string, "score": number, "level": "low"|"medium"|"high" } ]
}

고민 내용: ${worry.content.replace(/\n/g, " ")}${
    worry.category ? `\n카테고리: ${worry.category}` : ""
  }

질문 목록:
${qLines}

사용자 응답: ${rLines}

요구사항:
- recommendedChoice는 사용자 응답 경향을 반영해 일관되게 산출합니다.
- confidence는 0~100(퍼센트)로 산정하는 것을 권장합니다.
- scoreA/scoreB는 합이 100이 되도록 백분율로 산정합니다.
- actionSteps는 2~4개 간결한 실행 항목으로 작성합니다.`;
}
