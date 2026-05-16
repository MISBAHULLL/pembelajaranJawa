export const LEARNING_PROGRESS_KEY = 'javanesia-learning-progress';

export const initialLearningProgress = {
  visitedMateri: {},
  completedMateri: {},
  lastMateriIndex: null,
};

export function normalizeLearningProgress(progress) {
  return {
    ...initialLearningProgress,
    ...(progress ?? {}),
    visitedMateri: {
      ...initialLearningProgress.visitedMateri,
      ...(progress?.visitedMateri ?? {}),
    },
    completedMateri: {
      ...initialLearningProgress.completedMateri,
      ...(progress?.completedMateri ?? {}),
    },
  };
}

export function getMateriProgressStats(materiItems, progress) {
  const normalized = normalizeLearningProgress(progress);
  const completedCount = materiItems.filter((item) => normalized.completedMateri[item.title]).length;
  const visitedCount = materiItems.filter((item) => normalized.visitedMateri[item.title]).length;
  const total = materiItems.length;

  return {
    completedCount,
    visitedCount,
    total,
    percent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
    lastMateri: Number.isInteger(normalized.lastMateriIndex)
      ? materiItems[normalized.lastMateriIndex] ?? null
      : null,
  };
}

export function getGameProgressStats(scores) {
  const values = Object.values(scores ?? {}).filter((score) => Number.isFinite(score));

  return {
    playedLevels: values.length,
    bestTotalScore: values.reduce((total, score) => total + score, 0),
    bestSingleScore: values.length > 0 ? Math.max(...values) : 0,
  };
}
