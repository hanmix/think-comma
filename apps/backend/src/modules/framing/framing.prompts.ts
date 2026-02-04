export interface BuildFramingInput {
  worry: { content: string; category?: string };
}

export interface AxisResult {
  axisName: string;
  axisA: string;
  axisB: string;
  rationaleA: string;
  rationaleB: string;
  keywords?: string[];
}

export interface BuildFramingWithAxisInput extends BuildFramingInput {
  axis: AxisResult;
}

export function buildAxisPrompt({ worry }: BuildFramingInput) {
  const content = worry.content.replace(/\s+/g, ' ').trim();
  const category = (worry.category ?? '').trim();

  return `
    당신은 사용자의 고민을 따뜻하고 중립적인 톤으로 구조화하는 상담 코치입니다.
    한국어로 자연스럽고 매끄럽게 작성하세요. (직역투/영어식 문장 금지)

    아래 JSON 스키마에 맞춘 JSON만 출력하세요 (추가 텍스트 금지).
    출력 JSON에는 주석(//)을 포함하지 마세요.
    {
      "axisA": string,       // 축의 한쪽 방향
      "axisB": string,       // 축의 반대 방향
      "rationaleA": string,  // axisA를 지지하는 근거 1~2문장
      "rationaleB": string,  // axisB를 지지하는 근거 1~2문장
      "keywords": string[]   // 선택, 핵심 키워드 3~6개
    }

    [지침]
    - axisA/axisB는 서로 반대 의미가 되도록 6~18자 내외로 작성합니다.
    - axisA/axisB는 단어 1개로 끝나면 안 되며, 우선순위/조건이 포함된 짧은 문구여야 합니다.
    - axisA/axisB에는 선택지 문장이나 행동 지시를 넣지 않습니다.
    - rationaleA/rationaleB는 각각 해당 축을 뒷받침하는 근거를 1~2문장으로 작성합니다.
    - rationaleA/rationaleB는 축에 맞는 단서를 구체적으로 담되, 특정 키워드(기간/자금/리스크 등)를 강제하지 않습니다.
    - 조사(은/는, 이/가, 을/를, 와/과, 로/으로)와 어미가 어색한 문장은 금지합니다.
    - 사용자가 부정적/불편하게 느낄 수 있는 단어를 피하고, 존중적이고 중립적인 표현을 사용합니다.
    - 카테고리가 주어지면 어휘를 해당 맥락에 맞게 조정합니다.

    [입력]
    내용: ${content}
    카테고리: ${category || '(미지정)'}
  `.trim();
}

export function buildFramingPrompt({ worry, axis }: BuildFramingWithAxisInput) {
  const content = worry.content.replace(/\s+/g, ' ').trim();
  const category = (worry.category ?? '').trim();
  const axisA = axis.axisA.trim();
  const axisB = axis.axisB.trim();
  const rationaleA = axis.rationaleA.trim();
  const rationaleB = axis.rationaleB.trim();
  const keywords = (axis.keywords ?? []).map(keyword => keyword.trim());
  const keywordsLine = keywords.length > 0 ? keywords.join(', ') : '(없음)';

  return `
    당신은 사용자의 고민을 따뜻하고 중립적인 톤으로 두 갈래 선택지로 구조화하는 상담 코치입니다.
    한국어로 자연스럽고 매끄럽게 작성하세요. (직역투/영어식 문장 금지)

    아래 JSON 스키마에 맞춘 JSON만 출력하세요 (추가 텍스트 금지).
    출력 JSON에는 주석(//)을 포함하지 마세요. 모든 값은 문자열이어야 합니다.
    {
      "choiceALabel": string,
      "choiceBLabel": string,
      "aHint": string,
      "bHint": string
    }

    [결정 축]
    - axisA: ${axisA}
    - axisB: ${axisB}
    - rationaleA: ${rationaleA}
    - rationaleB: ${rationaleB}
    - keywords: ${keywordsLine}

    [지침]
    - 라벨은 axisA/axisB의 방향을 반드시 반영해 서로 반대가 되도록 만듭니다.
    - choiceALabel/choiceBLabel은 10~24자로 작성합니다. (너무 단답 방지)
    - choiceALabel/choiceBLabel에는 'A', 'B' 문자 또는 'A안', 'B안' 같은 표기를 사용하지 않습니다.
    - 라벨은 회피형 표현(예: '잘 모르겠다', '상황에 따라')을 사용하지 않습니다.
    - 라벨은 단답(예: '한다/안 한다', '간다/안 간다', '한다', '안 한다') 또는 동사 1단어로 끝나면 안 됩니다.
    - 라벨은 반드시 아래 형식 중 하나를 따릅니다(둘 중 택1):
      1) "~을(를) 우선하며 ~을(를) 선택"
      2) "~을(를) 감수하고 ~하기"
      예: "안정성을 우선하며 현상 유지", "리스크를 감수하고 이직 도전"
    - 두 라벨은 같은 축(예: 안정 vs 도전, 속도 vs 완성도)에서 서로 반대 방향이 되도록 만듭니다.

    - aHint/bHint는 가치판단 없이 실행 방향만 1문장으로 제시합니다.
    - 조사(은/는, 이/가, 을/를, 와/과, 로/으로)와 어미가 어색한 문장은 금지합니다.
    - 사용자가 부정적/불편하게 느낄 수 있는 단어를 피하고, 존중적이고 중립적인 표현을 사용합니다.
    - 카테고리가 주어지면 어휘를 해당 맥락에 맞게 조정합니다.

    [입력]
    내용: ${content}
    카테고리: ${category || '(미지정)'}
  `.trim();
}
