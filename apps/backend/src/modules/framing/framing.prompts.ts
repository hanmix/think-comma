export interface BuildFramingInput {
  worry: { content: string; category?: string };
}

// export function buildFramingPrompt({ worry }: BuildFramingInput) {
//   const content = worry.content.replace(/\n/g, ' ');
//   const category = worry.category ? `\n카테고리: ${worry.category}` : '';

//   return `
//     당신은 사용자의 고민을 A vs B 구조로 명확히 잡아주는 코치입니다.
//     한국어로 간결하게 작성하세요.

//     아래 JSON 스키마에 맞춘 JSON만 출력하세요 (추가 텍스트 금지):
//     {
//       "summary": string,           // 예: 이 상황을 구조화해보면 "A vs B"로 정리할 수 있어요.
//       "choiceALabel": string,      // 6~20자 권장, A/B 문자는 금지. 선택지의 구조에 맞는 문장으로 서술.
//       "choiceBLabel": string,      // 6~20자 권장, A/B 문자는 금지. 선택지의 구조에 맞는 문장으로 서술.
//       "aHint": string,             // 한 줄 보조 설명(예: 자리 비어있으면 합석 제안 등)
//       "bHint": string,             // 한 줄 보조 설명(예: 무리하지 않고 자연스럽게 등)
//       "cta": string                // 예: 이렇게 설정해서 10개 질문으로 같이 분석해볼까요?
//     }

//     [지침]
//     - summary에는 choiceALabel/choiceBLabel을 그대로 포함해
//       "\"{A} vs {B}\"" 형식으로 자연스럽게 기술합니다.
//     - choice 라벨은 문제의 맥락에서 서로 반대 축이 되도록 만듭니다.
//     - 힌트는 각 선택의 실행 방향을 직관적으로 떠올릴 수 있게 짧게 작성합니다.
//     - 카테고리가 주어지면 어휘를 해당 맥락에 맞게 조정합니다.

//     [입력]
//     내용: ${content}${category}
//   `.trim();
// }

export function buildFramingPrompt({ worry }: BuildFramingInput) {
  const content = worry.content.replace(/\s+/g, ' ').trim();
  const category = (worry.category ?? '').trim();

  return `
    당신은 사용자의 고민을 두 갈래 선택지로 명확히 구조화해주는 코치입니다.
    한국어로 간결하게 작성하세요.

    아래 JSON 스키마에 맞춘 JSON만 출력하세요 (추가 텍스트 금지).
    출력 JSON에는 주석(//)을 포함하지 마세요. 모든 값은 문자열이어야 합니다.
    {
      "summary": string,
      "choiceALabel": string,
      "choiceBLabel": string,
      "aHint": string,
      "bHint": string,
      "cta": string
    }

    [지침]
    - choiceALabel/choiceBLabel은 10~24자로 작성합니다. (너무 단답 방지)
    - choiceALabel/choiceBLabel에는 'A', 'B' 문자 또는 'A안', 'B안' 같은 표기를 사용하지 않습니다.
    - 라벨은 회피형 표현(예: '잘 모르겠다', '상황에 따라')을 사용하지 않습니다.
    - 라벨은 단답(예: '한다/안 한다', '간다/안 간다', '한다', '안 한다') 또는 동사 1단어로 끝나면 안 됩니다.
    - 라벨은 반드시 아래 형식 중 하나를 따릅니다(둘 중 택1):
      1) "~을(를) 우선하며 ~을(를) 선택"
      2) "~을(를) 감수하고 ~하기"
      예: "안정성을 우선하며 현상 유지", "리스크를 감수하고 이직 도전"
    - 두 라벨은 같은 축(예: 안정 vs 도전, 속도 vs 완성도)에서 서로 반대 방향이 되도록 만듭니다.

    - summary에는 'A vs B' 문자를 그대로 쓰지 말고,
      반드시 "\"{choiceALabel} vs {choiceBLabel}\"" 형식으로 라벨을 포함해 자연스럽게 기술합니다.
    - aHint/bHint는 가치판단 없이 실행 방향만 1문장으로 제시합니다.
    - 카테고리가 주어지면 어휘를 해당 맥락에 맞게 조정합니다.

    [입력]
    내용: ${content}
    카테고리: ${category || '(미지정)'}
  `.trim();
}
