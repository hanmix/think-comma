import type { AnalysisResult } from '@/types/thinking';
import { computed } from 'vue';

export function useResultDerivations(result: AnalysisResult) {
  const aChoiceCount = computed(
    () => result.responses.filter(r => r.selectedChoice === 'A').length
  );
  const bChoiceCount = computed(
    () => result.responses.filter(r => r.selectedChoice === 'B').length
  );

  const getLevelText = (level: 'low' | 'medium' | 'high'): string => {
    const levelMap = { low: '낮음', medium: '중간', high: '높음' } as const;
    return levelMap[level];
  };

  const getChoicePattern = (): string => {
    const total = aChoiceCount.value + bChoiceCount.value;
    const aPercentage = total > 0 ? (aChoiceCount.value / total) * 100 : 0;
    if (aPercentage >= 70) return '신중하고 보수적인 접근을 선호하는 패턴';
    if (aPercentage >= 60) return '안정성과 변화의 균형을 추구하는 패턴';
    if (aPercentage >= 40) return '상황에 따라 유연하게 판단하는 패턴';
    if (aPercentage >= 30) return '변화와 도전을 선호하는 패턴';
    return '적극적이고 변화 지향적인 패턴';
  };

  return { aChoiceCount, bChoiceCount, getLevelText, getChoicePattern };
}
