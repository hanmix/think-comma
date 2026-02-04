export interface BuildAnalysisInput {
  worry: { content: string; category?: string };
  questions: Array<{
    id: number;
    text: string;
    choices: Array<{ id: 'A' | 'B'; content: string; description?: string }>;
  }>;
  responses: Array<{ questionId: number; answer: 'A' | 'B' }>;
  axis?: {
    axisA: string;
    axisB: string;
    rationaleA: string;
    rationaleB: string;
    keywords?: string[];
  };
}

export function buildAnalysisPrompt({
  worry,
  questions,
  responses,
  axis,
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
  const axisA = axis?.axisA?.trim() ?? '(미지정)';
  const axisB = axis?.axisB?.trim() ?? '(미지정)';
  const rationaleA = axis?.rationaleA?.trim() ?? '(미지정)';
  const rationaleB = axis?.rationaleB?.trim() ?? '(미지정)';
  const axisKeywords =
    axis?.keywords?.map(keyword => keyword.trim()).filter(Boolean) ?? [];
  const axisKeywordsLine =
    axisKeywords.length > 0 ? axisKeywords.join(', ') : '(없음)';

  return `
    당신은 사용자의 고민을 따뜻하고 중립적인 톤으로 분석하는 상담 코치입니다.
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
      "guidance": string,
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
      "axisAlignment": {
        "scoreA": number,
        "scoreB": number
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

    [결정 축]
    - axisA: ${axisA}
    - axisB: ${axisB}
    - rationaleA: ${rationaleA}
    - rationaleB: ${rationaleB}
    - keywords: ${axisKeywordsLine}

    [추가 점수 규칙 — 차트용]
    - rationale.keyReasons.weight는 모두 0~100 정수이며, keyReasons 내 모든 weight 합은 반드시 100이 되도록 합니다.
    - personalityTraits.score와 decisionFactors.score도 0~100 기준으로 산정합니다.
    - personalityTraits.leansTo는 A/B/neutral 중 하나를 반드시 지정합니다.
    - decisionFactors.side는 A/B 중 하나를 반드시 지정합니다.
    - evidence에는 해당 판단의 근거를 1문장으로 적습니다.
    - decisionFactors.evidence는 반드시 rationaleA 또는 rationaleB를 재서술해 포함합니다.
    - personalityTraits.evidence는 rationaleA/B 중 하나와 질문 응답 패턴을 연결해 1문장으로 작성합니다.
    - rationale.keyReasons.detail은 rationaleA 또는 rationaleB를 반영해 작성합니다.
    - axisAlignment.scoreA/scoreB는 axisA/axisB에 대한 사용자 정합도 점수(0~100)입니다.
    - axisAlignment.scoreA + axisAlignment.scoreB = 100이 되도록 작성합니다.
    - personalityTraits는 최소 3개 이상 작성합니다. (빈 배열 금지)
    - decisionFactors는 최소 3개 이상 작성합니다. (빈 배열 금지)

    [분석 요구사항]
    - actionSteps는 2~4개의 간결한 실행 항목으로 작성합니다.
    - actionGuide.steps는 UI에 바로 사용 가능한 3단계 계획으로 작성합니다(각 단계 title/description 필수).
    - actionGuide.nextSuggestion은 사용자가 무리 없이 다음 행동으로 이어갈 수 있는 1문장 제안입니다.
    - 사용자가 부정적/불편하게 느낄 수 있는 단어를 피하고, 존중적이고 중립적인 표현을 사용합니다.

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
