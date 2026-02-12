import type { AnalysisResult } from '@/types';
import { computed } from 'vue';

interface ResultDerivationOptions {
  choiceALabel?: string;
  choiceBLabel?: string;
}

type GuideStep = { title: string; description: string };

const resolveChoiceLabel = (
  result: AnalysisResult,
  targetChoice: 'A' | 'B',
  overrideLabel?: string
) => {
  if (overrideLabel) return overrideLabel;
  const isRecommended = result.recommendedChoice === targetChoice;
  return isRecommended
    ? result.recommendedChoiceLabel
    : result.otherChoiceLabel;
};

const deriveGuideSteps = (result: AnalysisResult): GuideStep[] =>
  result.actionGuide?.steps?.length
    ? (result.actionGuide.steps as GuideStep[])
    : (result.actionSteps || []).map(step => ({
        title: step,
        description: '',
      }));

const deriveScoreLabel = (
  result: AnalysisResult,
  recommendedLabel: string,
  otherLabel: string,
  scoreType: 'A' | 'B'
) => {
  if (scoreType === 'A') {
    return result.scoreA >= result.scoreB ? recommendedLabel : otherLabel;
  }
  return result.scoreB > result.scoreA ? recommendedLabel : otherLabel;
};

export function useAnalysisResult(
  result: AnalysisResult,
  options: ResultDerivationOptions = {}
) {
  const aChoiceCount = computed(
    () => result.responses.filter(r => r.selectedChoice === 'A').length
  );
  const bChoiceCount = computed(
    () => result.responses.filter(r => r.selectedChoice === 'B').length
  );

  const confidencePercent = computed(() => Math.round((result.confidence || 0) * 100));
  const guideSteps = computed(() => deriveGuideSteps(result));
  const nextSuggestion = computed(() => result.actionGuide?.nextSuggestion);

  const aLabel = computed(() =>
    resolveChoiceLabel(result, 'A', options.choiceALabel)
  );
  const bLabel = computed(() =>
    resolveChoiceLabel(result, 'B', options.choiceBLabel)
  );
  const recommendedLabel = computed(() =>
    result.recommendedChoice === 'A' ? aLabel.value : bLabel.value
  );
  const otherLabel = computed(() =>
    result.recommendedChoice === 'A' ? bLabel.value : aLabel.value
  );
  const scoreALabel = computed(() =>
    deriveScoreLabel(result, recommendedLabel.value, otherLabel.value, 'A')
  );
  const scoreBLabel = computed(() =>
    deriveScoreLabel(result, recommendedLabel.value, otherLabel.value, 'B')
  );

  const getLevelText = (level: 'low' | 'medium' | 'high') => {
    const levelMap = { low: '낮음', medium: '중간', high: '높음' } as const;
    return levelMap[level];
  };

  const getChoicePattern = () => {
    const total = aChoiceCount.value + bChoiceCount.value;
    const aPercentage = total > 0 ? (aChoiceCount.value / total) * 100 : 0;
    if (aPercentage >= 70) return '신중하고 보수적인 접근을 선호하는 패턴';
    if (aPercentage >= 60) return '안정성과 변화의 균형을 추구하는 패턴';
    if (aPercentage >= 40) return '상황에 따라 유연하게 판단하는 패턴';
    if (aPercentage >= 30) return '변화와 도전을 선호하는 패턴';
    return '적극적이고 변화 지향적인 패턴';
  };

  return {
    aChoiceCount,
    bChoiceCount,
    confidencePercent,
    guideSteps,
    nextSuggestion,
    aLabel,
    bLabel,
    recommendedLabel,
    otherLabel,
    scoreALabel,
    scoreBLabel,
    getLevelText,
    getChoicePattern,
  };
}
