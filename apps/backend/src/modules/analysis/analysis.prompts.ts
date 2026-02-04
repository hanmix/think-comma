export interface BuildAnalysisInput {
  worry: { content: string; category?: string };
  questions: Array<{
    id: number;
    text: string;
    choices: Array<{ id: 'A' | 'B'; content: string; description?: string }>;
  }>;
  responses: Array<{ questionId: number; answer: 'A' | 'B' }>;
}

// export function buildAnalysisPrompt({
//   worry,
//   questions,
//   responses,
// }: BuildAnalysisInput) {
//   const qLines = questions
//     .map(q => {
//       const a = q.choices.find(c => c.id === 'A');
//       const b = q.choices.find(c => c.id === 'B');
//       return `- Q${q.id}. ${q.text}\n  A) ${a?.content}${
//         a?.description ? ` (${a.description})` : ''
//       }\n  B) ${b?.content}${b?.description ? ` (${b.description})` : ''}`;
//     })
//     .join('\n');
//   const rLines = responses.map(r => `Q${r.questionId}: ${r.answer}`).join(', ');

//   return `다음 고민과 A/B 선택형 질문-응답 결과를 바탕으로 종합 분석을 수행하세요.
//   UI에 바로 매핑 가능한 JSON만 출력하세요(추가 텍스트 금지). 한국어로 작성합니다.

//   필수 출력 JSON 스키마:
//   {
//     "recommendedChoice": "A" | "B",
//     "choiceALabel": string,
//     "choiceBLabel": string,
//     "recommendedChoiceLabel": string,
//     "otherChoiceLabel": string,
//     "summary": string,    // 한 줄 요약(카드의 부제목처럼 간결하게)
//     "actionSteps": string[],
//     "actionGuide": {
//       "steps": [
//         { "title": string, "description": string },
//         { "title": string, "description": string },
//         { "title": string, "description": string }
//       ],
//       "nextSuggestion": string // 다음 기회를 위한 제안(한 줄)
//     },
//     "rationale": {
//       "overview": string,
//       "keyReasons": [ { "name": string, "detail": string, "weight": number, "relatedQuestions": number[] } ]
//     },
//     "personalityTraits": [
//       { "name": string, "score": number, "level": "low"|"medium"|"high", "leansTo": "A"|"B"|"neutral", "evidence": string, "relatedQuestions": number[] }
//     ],
//     "decisionFactors": [
//       { "name": string, "score": number, "level": "low"|"medium"|"high", "side": "A"|"B", "evidence": string, "relatedQuestions": number[] }
//     ]
//     ;
//     고민 내용: ${worry.content.replace(/\n/g, ' ')}${
//       worry.category ? `\n카테고리: ${worry.category}` : ''
//     }

//   질문 목록:
//   ${qLines}

//   사용자 응답: ${rLines}

//   요구사항:
//   - recommendedChoice는 사용자 응답 경향을 반영해 일관되게 산출합니다.
//   - actionSteps는 2~4개 간결한 실행 항목으로 작성합니다.
//   - actionGuide.steps는 UI에 바로 사용 가능한 3단계 계획으로, 각 단계는 굵은 한 줄 제목(title)과 그에 대한 간단한 보충 설명(description)으로 구성합니다.
//   - actionGuide.nextSuggestion은 사용자가 무리 없이 다음 기회를 만들 수 있도록 돕는 한 줄 제안으로 작성합니다.
//   - rationale.keyReasons.weight는 0~100 백분율로, 판단에 기여한 상대적 영향력을 나타냅니다.
//   - rationale.keyReasons.relatedQuestions에는 관련된 질문 번호 배열(1~3개)을 넣습니다.
//   - choiceALabel / choiceBLabel은 사용자의 고민 내용에서 파생된 서로 상반된(반대 축) 선택지 라벨이어야 합니다.
//   - 예: “안정 유지” vs “변화 도전”, “재정 보수” vs “성장 투자”, “관계 회복” vs “새 출발” 등. 단, 실제 고민 맥락에 맞는 축을 정의하세요.
//   - “A”, “B” 같은 단일 문자, 혹은 문자 A/B를 포함한 형식(“A 선택”, “선택 B”)은 금지합니다.
//   - 한국어로 간결하고 명확하게 작성하세요(권장 길이: 6~10자). 카테고리가 있다면 어휘/맥락을 반영하세요.
//   - recommendedChoiceLabel과 otherChoiceLabel은 반드시 choiceALabel/choiceBLabel과 매핑되어야 합니다.
//   - recommendedChoice가 "A"이면 recommendedChoiceLabel = choiceALabel, otherChoiceLabel = choiceBLabel.
//   - recommendedChoice가 "B"이면 recommendedChoiceLabel = choiceBLabel, otherChoiceLabel = choiceALabel.
//   - 라벨은 위 질문 목록의 톤/맥락과 모순되지 않도록 하세요.`;
// }

export function buildAnalysisPrompt({
  worry,
  questions,
  responses,
}: BuildAnalysisInput) {
  const qLines = questions
    .map(q => {
      const a = q.choices.find(c => c.id === 'A');
      const b = q.choices.find(c => c.id === 'B');

      return [
        `- Q${q.id}. ${q.text}`,
        `  A) ${a?.content ?? ''}${a?.description ? ` (${a.description})` : ''}`,
        `  B) ${b?.content ?? ''}${b?.description ? ` (${b.description})` : ''}`,
      ].join('\n');
    })
    .join('\n');

  const rLines = responses
    .map(r => `- Q${r.questionId}: ${r.answer}`)
    .join('\n');

  const content = worry.content.replace(/\s+/g, ' ').trim();
  const category = (worry.category ?? '').trim();

  return `
    다음 고민과 A/B 선택형 질문-응답 결과를 바탕으로 종합 분석을 수행하세요.
    결과는 차트 시각화를 목적으로 사용됩니다.
    UI에 바로 매핑 가능한 JSON만 출력하세요 (추가 텍스트 금지). 한국어로 작성합니다.
    출력 JSON에는 주석(//)을 포함하지 마세요.

    [필수 출력 JSON 스키마]
    {
      "recommendedChoice": "A" | "B",
      "choiceALabel": string,
      "choiceBLabel": string,
      "recommendedChoiceLabel": string,
      "otherChoiceLabel": string,
      "summary": string,
      "actionSteps": string[],
      "actionGuide": {
        "steps": [
          { "title": string, "description": string },
          { "title": string, "description": string },
          { "title": string, "description": string }
        ],
        "nextSuggestion": string
      },
      "rationale": {
        "overview": string,
        "keyReasons": [
          { "name": string, "detail": string, "weight": number, "relatedQuestions": number[] }
        ]
      },
      "personalityTraits": [
        {
          "name": string,
          "score": number,
          "level": "low" | "medium" | "high",
          "leansTo": "A" | "B" | "neutral",
          "evidence": string,
          "relatedQuestions": number[]
        }
      ],
      "decisionFactors": [
        {
          "name": string,
          "score": number,
          "level": "low" | "medium" | "high",
          "side": "A" | "B",
          "evidence": string,
          "relatedQuestions": number[]
        }
      ]
    }

    [입력]
    - 고민 내용: ${content}
    - 카테고리: ${category || '(미지정)'}

    [질문 목록]
    ${qLines}

    [사용자 응답]
    ${rLines}

    [추가 점수 규칙 — 차트용]
    - rationale.keyReasons.weight는 모두 0~100 정수이며, keyReasons 내 모든 weight 합은 반드시 100이 되도록 합니다.
    - personalityTraits.score와 decisionFactors.score도 0~100 기준으로 산정합니다.
    - personalityTraits.leansTo는 A/B/neutral 중 하나를 반드시 지정합니다.
    - decisionFactors.side는 A/B 중 하나를 반드시 지정합니다.
    - evidence에는 해당 판단의 근거를 1문장으로 적습니다.

    [분석 요구사항]
    - actionSteps는 2~4개의 간결한 실행 항목으로 작성합니다.
    - actionGuide.steps는 UI에 바로 사용 가능한 3단계 계획으로 작성합니다(각 단계 title/description 필수).
    - actionGuide.nextSuggestion은 사용자가 무리 없이 다음 행동으로 이어갈 수 있는 1문장 제안입니다.

    [라벨 규칙]
    - choiceALabel / choiceBLabel은 고민 맥락에서 서로 반대 축이 되도록 만듭니다.
    - 라벨에는 'A', 'B' 문자 또는 'A안', 'B안' 같은 표기를 사용하지 않습니다.
    - 라벨은 회피형 또는 단답이 되면 안 됩니다.
    - 라벨은 10~24자로 작성하며, 아래 형식 중 하나를 따릅니다:
      1) "~을(를) 우선하며 ~을(를) 선택"
      2) "~을(를) 감수하고 ~하기"
    - recommendedChoiceLabel과 otherChoiceLabel은 반드시 choiceALabel/choiceBLabel과 정확히 매핑되어야 합니다.
  `.trim();
}
