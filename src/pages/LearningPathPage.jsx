import React from 'react';
import { BookOpen, CheckCircle2, Circle, Flag, Gamepad2, Lock, Map, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { learningPathSteps } from '../data/learningPath.js';
import { mainMenu } from '../data/mainMenu.js';
import { materiList } from '../data/materi.js';
import { useClickSound } from '../hooks/useClickSound.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import {
  LEARNING_PROGRESS_KEY,
  getGameProgressStats,
  getMateriProgressStats,
  initialLearningProgress,
} from '../utils/learningProgress.js';

const initialProgress = Object.fromEntries(learningPathSteps.map((step) => [step.id, false]));

function getStepStatus(progress, index) {
  const step = learningPathSteps[index];
  const previousStep = learningPathSteps[index - 1];

  if (progress[step.id]) return 'done';
  if (index === 0 || progress[previousStep?.id]) return 'active';
  return 'locked';
}

function getLearningItem(title) {
  return mainMenu.find((item) => item.title === title) ?? mainMenu[1] ?? mainMenu[0];
}

export function LearningPathPage({ onNavigate }) {
  const playClick = useClickSound();
  const [progress, setProgress] = useLocalStorage('javanesia-learning-path', initialProgress);
  const [learningProgress, setLearningProgress] = useLocalStorage(LEARNING_PROGRESS_KEY, initialLearningProgress);
  const [gameScores, setGameScores] = useLocalStorage('javanesia-game-scores', {});
  const completedCount = learningPathSteps.filter((step) => progress[step.id]).length;
  const progressPercent = Math.round((completedCount / learningPathSteps.length) * 100);
  const materiStats = getMateriProgressStats(materiList, learningProgress);
  const gameStats = getGameProgressStats(gameScores);

  const toggleStep = (stepId) => {
    playClick();
    setProgress((current) => ({
      ...initialProgress,
      ...current,
      [stepId]: !current?.[stepId],
    }));
  };

  const resetProgress = () => {
    playClick();
    setProgress(initialProgress);
    setLearningProgress(initialLearningProgress);
    setGameScores({});
  };

  const handleOpenStep = (step) => {
    playClick();
    if (step.targetPage === 'learning') {
      onNavigate?.({ page: 'learning', learningItem: getLearningItem(step.learningTitle) });
      return;
    }

    onNavigate?.({ page: step.targetPage });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-2 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-3xl border-4 border-white/80 bg-white/90 shadow-[0_8px_34px_rgba(46,29,16,0.16)] backdrop-blur-sm">
        <div className="relative bg-gradient-to-r from-[#ff9b2f] via-[#ffb45d] to-[#ffd59a] px-6 py-6 sm:px-8">
          <span className="pointer-events-none absolute inset-1 rounded-[1.25rem] border border-white/35" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/22 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                <Map size={14} aria-hidden="true" />
                Alur Belajar
              </p>
              <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.7rem)] font-black uppercase leading-none text-white drop-shadow-md">
                Learning Path Parikan
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-bold leading-relaxed text-white/90 sm:text-base">
                Tindakake urutan sinau saka miwiti, materi, latihan, game, nggawe parikan, nganti ndeleng asil.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-white/50 bg-white/92 p-4 text-[#5d351d] shadow-lg">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
                Progresmu
              </p>
              <div className="mt-2 flex items-end gap-2">
                <strong className="text-4xl font-black leading-none text-[#3f2918]">{progressPercent}%</strong>
                <span className="pb-1 text-sm font-black text-[#7a5030]">
                  {completedCount}/{learningPathSteps.length} rampung
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-orange-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#ff9700] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_290px] lg:items-start">
        <ol className="grid gap-4">
          {learningPathSteps.map((step, index) => {
            const status = getStepStatus(progress, index);
            const isDone = status === 'done';
            const isLocked = status === 'locked';

            return (
              <li
                key={step.id}
                className={`relative overflow-hidden rounded-3xl border-4 bg-white/92 p-5 shadow-[0_7px_0_rgba(95,60,31,0.12),0_14px_28px_rgba(78,45,21,0.12)] transition ${
                  isDone
                    ? 'border-green-300'
                    : isLocked
                    ? 'border-white/60 opacity-75'
                    : 'border-orange-300'
                }`}
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-orange-50/70" />
                <div className="relative grid gap-4 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                  <div className={`grid size-14 place-items-center rounded-2xl text-white shadow-md ${
                    isDone
                      ? 'bg-green-500'
                      : isLocked
                      ? 'bg-[#bfa98f]'
                      : 'bg-gradient-to-br from-[#ff9700] to-[#ffba73]'
                  }`}>
                    {isDone ? <CheckCircle2 size={28} aria-hidden="true" /> : isLocked ? <Lock size={25} aria-hidden="true" /> : <Flag size={26} aria-hidden="true" />}
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
                      Tahap {index + 1}
                    </p>
                    <h2 className="mt-1 text-2xl font-black leading-tight text-[#3f2918]">
                      {step.title}
                    </h2>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-[#7a5030]">
                      {step.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenStep(step)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                        isLocked
                          ? 'cursor-not-allowed bg-stone-200 text-stone-500'
                          : 'bg-orange-500 text-white hover:-translate-y-0.5 hover:bg-orange-600'
                      }`}
                    >
                      {step.id === 'game' || step.id === 'gawe-parikan' ? <Gamepad2 size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
                      {step.actionLabel}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200 ${
                        isLocked
                          ? 'cursor-not-allowed border-stone-200 bg-white/60 text-stone-400'
                          : isDone
                          ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-orange-200 bg-white text-orange-600 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
                      {isDone ? 'Wis Rampung' : 'Tandai Rampung'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="rounded-3xl border-4 border-white/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(46,29,16,0.14)]">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
            Ringkesan
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#3f2918]">
            Asil Sinau
          </h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-[#7a5030]">
            Gunakake alur iki kanggo njaga urutan sinau. Tahap sabanjure bakal kebuka sawise tahap sadurunge ditandai rampung.
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border-2 border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-orange-600">
                  <BookOpen size={15} aria-hidden="true" />
                  Materi
                </span>
                <span className="text-sm font-black text-[#5d351d]">
                  {materiStats.completedCount}/{materiStats.total}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${materiStats.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-[#7a5030]">
                {materiStats.lastMateri ? `Terakhir dibuka: ${materiStats.lastMateri.title}` : 'Belum ada materi yang dibuka.'}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-orange-600">
                  <Trophy size={15} aria-hidden="true" />
                  Game
                </span>
                <span className="text-sm font-black text-[#5d351d]">
                  {gameStats.playedLevels} level
                </span>
              </div>
              <p className="mt-2 text-xs font-bold leading-relaxed text-[#7a5030]">
                Skor total terbaik: {gameStats.bestTotalScore}. Skor level tertinggi: {gameStats.bestSingleScore}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {learningPathSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3">
                <span className="text-sm font-black text-[#5d351d]">{step.title}</span>
                <span className={`text-xs font-black uppercase ${progress[step.id] ? 'text-green-600' : 'text-orange-500'}`}>
                  {progress[step.id] ? 'Selesai' : 'Belum'}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={resetProgress}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-orange-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset Semua Progres
          </button>
        </aside>
      </section>
    </div>
  );
}
