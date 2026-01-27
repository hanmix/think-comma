import { placeholderByCategory } from '@/constants';

export const getRandomPlaceholder = (category?: string) => {
  const key = resolveCategoryKey(category);
  const list =
    key === 'default' ? getAllCategoryExamples() : placeholderByCategory[key];
  return pickRandom(list);
};

const resolveCategoryKey = (category?: string) => {
  if (!category) return 'default';
  return category in placeholderByCategory
    ? (category as keyof typeof placeholderByCategory)
    : 'default';
};

const getAllCategoryExamples = () =>
  Object.entries(placeholderByCategory)
    .filter(([entryKey]) => entryKey !== 'default')
    .flatMap(([, values]) => values);

const pickRandom = <T>(list: readonly T[]) => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};
