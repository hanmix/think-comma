export interface BuildQuestionsInput {
  worry: { content: string; category?: string };
}

export function buildQuestionsPrompt({ worry }: BuildQuestionsInput) {
  const category = worry.category ? `\n- 카테고리: ${worry.category}` : "";
  const content = worry.content.replace(/\n/g, " ");

  return `
  당신은 사용자의 고민을 들어주는 고민상담사 입니다.
  당신은 친절하고 따뜻하며 때로는 냉철하고 분석적인 상담 내용을 제공합니다.

  다음 사용자의 고민을 바탕으로 A/B 이지선다 질문 10개를 한국어로 생성하세요.

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
  "actionGuide": {
    "steps": [
      { "title": string, "description": string },
      { "title": string, "description": string },
      { "title": string, "description": string }
    ],
    "nextSuggestion": string // 다음 기회를 위한 제안(한 줄)
  },
  "rationale": {
    "overview": string,
    "keyReasons": [ { "name": string, "detail": string, "weight": number, "relatedQuestions": number[] } ]
  },
  "personalityTraits": [ { "name": string, "score": number, "level": "low"|"medium"|"high" } ],
  "decisionFactors": [ { "name": string, "score": number, "level": "low"|"medium"|"high" } ]
  ;
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
- actionSteps는 2~4개 간결한 실행 항목으로 작성합니다.
- actionGuide.steps는 UI에 바로 사용 가능한 3단계 계획으로, 각 단계는 굵은 한 줄 제목(title)과 그에 대한 간단한 보충 설명(description)으로 구성합니다.
- actionGuide.nextSuggestion은 사용자가 무리 없이 다음 기회를 만들 수 있도록 돕는 한 줄 제안으로 작성합니다.
 - rationale.keyReasons.weight는 0~100 백분율로, 판단에 기여한 상대적 영향력을 나타냅니다.
 - rationale.keyReasons.relatedQuestions에는 관련된 질문 번호 배열(1~3개)을 넣습니다.
- choiceALabel / choiceBLabel은 사용자의 고민 내용에서 파생된 서로 상반된(반대 축) 선택지 라벨이어야 합니다.
- 예: “안정 유지” vs “변화 도전”, “재정 보수” vs “성장 투자”, “관계 회복” vs “새 출발” 등. 단, 실제 고민 맥락에 맞는 축을 정의하세요.
- “A”, “B” 같은 단일 문자, 혹은 문자 A/B를 포함한 형식(“A 선택”, “선택 B”)은 금지합니다.
- 한국어로 간결하고 명확하게 작성하세요(권장 길이: 6~10자). 카테고리가 있다면 어휘/맥락을 반영하세요.
- recommendedChoiceLabel과 otherChoiceLabel은 반드시 choiceALabel/choiceBLabel과 매핑되어야 합니다.
- recommendedChoice가 "A"이면 recommendedChoiceLabel = choiceALabel, otherChoiceLabel = choiceBLabel.
- recommendedChoice가 "B"이면 recommendedChoiceLabel = choiceBLabel, otherChoiceLabel = choiceALabel.
- 라벨은 위 질문 목록의 톤/맥락과 모순되지 않도록 하세요.`;
}

export interface BuildFramingInput {
  worry: { content: string; category?: string };
}

export function buildFramingPrompt({ worry }: BuildFramingInput) {
  const content = worry.content.replace(/\n/g, " ");
  const category = worry.category ? `\n카테고리: ${worry.category}` : "";
  return `당신은 사용자의 고민을 A vs B 구조로 명확히 잡아주는 코치입니다. 한국어로 간결하게 작성하세요.

아래 JSON 스키마에 맞춘 JSON만 출력하세요(추가 텍스트 금지):
{
  "summary": string,           // 예: 이 상황을 구조화해보면 "A vs B"로 정리할 수 있어요.
  "choiceALabel": string,      // 6~20자 권장, A/B 문자는 금지. 선택지의 구조에 맞는 문장으로 서술.
  "choiceBLabel": string,      // 6~20자 권장, A/B 문자는 금지. 선택지의 구조에 맞는 문장으로 서술.
  "aHint": string,             // 한 줄 보조 설명(예: 자리 비어있으면 합석 제안 등)
  "bHint": string,             // 한 줄 보조 설명(예: 무리하지 않고 자연스럽게 등)
  "cta": string                // 예: 이렇게 설정해서 10개 질문으로 같이 분석해볼까요?
}

[지침]
- summary에는 choiceALabel/choiceBLabel을 그대로 포함해 "\"{A} vs {B}\"" 형식으로 자연스럽게 기술합니다.
- choice 라벨은 문제의 맥락에서 서로 반대 축이 되도록 만듭니다.
- 힌트는 각 선택의 실행 방향을 직관적으로 떠올릴 수 있게 짧게 작성합니다.
- 카테고리가 주어지면 어휘를 해당 맥락에 맞게 조정합니다.

[입력]
내용: ${content}${category}`;
}
