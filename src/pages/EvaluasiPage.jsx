import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  ClipboardList, 
  Check, 
  Sparkles,
  School,
  User,
  Hash,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { evaluasiQuestions } from '../data/evaluasi.js';
import { useClickSound } from '../hooks/useClickSound.js';
import { useResultSound } from '../hooks/useResultSound.js';
import { getStudentName, getStudentClass, getStudentAbsen } from '../hooks/useStudentName.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export function EvaluasiPage() {
  const playClick = useClickSound();
  const { prepareResultSounds, playApplause, playEncourage, playFailed } = useResultSound();

  const [step, setStep] = useState('start'); // 'start' | 'quiz' | 'result' | 'certificate'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answers, setAnswers] = useState([]); // Array of chosen option indexes
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('javanesia-evaluasi-high-score', 0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Student profile info
  const name = getStudentName() || 'Siswa';
  const studentClass = getStudentClass() || '';
  const absen = getStudentAbsen() || '';

  useEffect(() => {
    prepareResultSounds();
  }, []);

  const handleStart = () => {
    playClick();
    setStep('quiz');
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  const handleSelectOption = (index) => {
    playClick();
    setSelectedOpt(index);
  };

  const handleNext = () => {
    playClick();
    if (selectedOpt === null) return;

    // Save answer
    const newAnswers = [...answers, selectedOpt];
    setAnswers(newAnswers);

    if (currentIdx < evaluasiQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
    } else {
      // Calculate score
      let correctCount = 0;
      newAnswers.forEach((ans, i) => {
        if (ans === evaluasiQuestions[i].correctIndex) {
          correctCount++;
        }
      });
      const finalScore = correctCount * 10; // 10 questions, max 100 points
      setScore(finalScore);

      if (finalScore > highScore) {
        setHighScore(finalScore);
      }

      setStep('result');

      // Play sound based on result
      setTimeout(() => {
        try {
          if (finalScore === 100) playApplause();
          else if (finalScore >= 70) playEncourage();
          else playFailed();
        } catch (err) {
          console.warn('Result sound failed to play', err);
        }
      }, 500);
    }
  };

  const handlePrint = () => {
    playClick();
    window.print();
  };

  const handleAskExit = () => {
    playClick();
    setShowExitConfirm(true);
  };

  const handleCancelExit = () => {
    playClick();
    setShowExitConfirm(false);
  };

  const handleConfirmExit = () => {
    playClick();
    setShowExitConfirm(false);
    setStep('start');
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  const currentQ = evaluasiQuestions[currentIdx];
  const progressPercent = Math.round(((currentIdx) / evaluasiQuestions.length) * 100);

  const getInitials = (str) => {
    return str
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 px-4 py-2 sm:px-6 lg:px-8">
      
      {/* ──────────────── SCREEN: START ──────────────── */}
      {step === 'start' && (
        <div className="flex flex-col gap-6 animate-[fadeInUp_0.5s_ease-out]">
          <header className="relative overflow-hidden rounded-[8px] border border-white/80 bg-white/82 px-5 py-6 text-center shadow-[0_18px_40px_rgba(77,48,24,0.16)] backdrop-blur-md sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#0ea5a4]" />
            
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#fff3d6] text-[#d97706] shadow-inner ring-4 ring-white sm:size-20">
              <ClipboardList size={36} />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7f5] px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
              <Sparkles size={14} aria-hidden="true" />
              Evaluasi Pembelajaran
            </span>

            <h1 className="mt-4 text-[clamp(2.1rem,5vw,4rem)] font-black uppercase leading-[0.95] text-[#2b1d12]">
              Evaluasi Parikan
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#6b4a2d] sm:text-lg">
              Kanthi evaluasi iki, kowe bisa nguji pemahamanmu babagan parikan Jawa, wiwit saka teges, ciri-ciri, struktur sampiran lan isi, nganti ngerakit parikan.
            </p>
          </header>

          <main className="grid gap-6 md:grid-cols-[1fr_320px]">
            {/* Kartu Informasi Ujian */}
            <section className="rounded-[8px] border border-white/85 bg-white/92 p-6 shadow-[0_12px_28px_rgba(77,48,24,0.12)] backdrop-blur-sm">
              <h2 className="text-xl font-black text-[#2e1d10] mb-4 flex items-center gap-2">
                <Trophy className="text-orange-500 animate-pulse" size={22} />
                Katrangan Evaluasi
              </h2>
              
              <div className="flex flex-col gap-4 text-sm font-bold text-[#5d351d]">
                <div className="flex items-center gap-3 rounded-2xl bg-orange-50/50 border border-orange-100 p-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-600 font-black">10</div>
                  <div>
                    <p className="text-xs text-orange-500 font-black uppercase tracking-wider">Cacahing Pitakon</p>
                    <p className="text-base font-black text-[#2e1d10]">10 Pitakon Pilihan Ganda</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-teal-50/50 border border-teal-100 p-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-600 font-black">70</div>
                  <div>
                    <p className="text-xs text-teal-600 font-black uppercase tracking-wider">Batas Minimum Kelulusan</p>
                    <p className="text-base font-black text-[#2e1d10]">Kudu antuk Biji minimal 70 (Kriteria Lulus)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-yellow-50/50 border border-yellow-100 p-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-yellow-100 text-yellow-600 font-black">🏅</div>
                  <div>
                    <p className="text-xs text-yellow-600 font-black uppercase tracking-wider">Hadiah Kelulusan</p>
                    <p className="text-base font-black text-[#2e1d10]">Entuk Sertifikat resmi sing bisa dicithak!</p>
                  </div>
                </div>
              </div>

              {highScore > 0 && (
                <div className="mt-6 rounded-2xl bg-[#fffcf3] border-2 border-dashed border-orange-200 p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-wider text-orange-500">Biji Paling Dhuwurmu</p>
                  <p className="text-3xl font-black text-[#2e1d10] mt-1">{highScore} <span className="text-lg text-gray-400">/ 100</span></p>
                </div>
              )}

              <button
                type="button"
                onClick={handleStart}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-white bg-gradient-to-b from-[#ffb970] to-[#ff9114] py-4 text-base font-black uppercase text-white shadow-[0_6px_0_rgba(126,68,18,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(126,68,18,0.22)] active:translate-y-0.5"
              >
                Mulai Evaluasi Saiki
                <ArrowRight size={18} />
              </button>
            </section>

            {/* Kartu Profil Siswa */}
            <aside className="flex flex-col gap-4 rounded-[8px] border border-white/85 bg-white/92 p-5 shadow-[0_12px_28px_rgba(77,48,24,0.12)] backdrop-blur-sm justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-3">Peserta Ujian</p>
                <div className="flex items-center gap-3 mb-5">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#d97811] text-base font-black uppercase text-white shadow-inner">
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black leading-tight text-[#2e1d10]">{name}</p>
                    <p className="text-xs font-bold text-gray-500">Peserta Didik</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm font-bold text-[#5d351d]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <School size={16} />
                      Kelas
                    </span>
                    <span className="font-black text-[#2e1d10]">{studentClass || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Hash size={16} />
                      Nomer Absen
                    </span>
                    <span className="font-black text-[#2e1d10]">{absen || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-orange-50 p-3 text-xs font-bold text-[#8a541d] leading-relaxed border border-orange-100">
                Pituduh: Wangsulana pitakonan kanthi premati. Biji pungkasan bakal direkam sawise kowe ngrampungi kabeh pitakon.
              </div>
            </aside>
          </main>
        </div>
      )}

      {/* ──────────────── SCREEN: QUIZ ──────────────── */}
      {step === 'quiz' && currentQ && (
        <div className="flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out]">
          {/* Top progress bar */}
          <div className="rounded-[8px] border border-white/80 bg-white/82 p-4 shadow-[0_12px_28px_rgba(77,48,24,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#7a5030] mb-2">
              <span>Pitakon {currentIdx + 1} saka {evaluasiQuestions.length}</span>
              <span className="text-orange-500">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-orange-100/50">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#d97706] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-[8px] border border-white/85 bg-white/92 p-6 shadow-[0_12px_28px_rgba(77,48,24,0.12)] backdrop-blur-sm sm:p-8">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#d97706]">
              Pilgan
            </span>
            <h2 className="mt-3 text-xl font-black leading-relaxed text-[#2e1d10] sm:text-2xl whitespace-pre-line">
              {currentQ.question}
            </h2>

            {/* Options grid */}
            <div className="mt-6 grid gap-3">
              {currentQ.options.map((option, index) => {
                const label = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedOpt === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectOption(index)}
                    className={`group relative flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 shadow-md ring-1 ring-orange-400'
                        : 'border-[#ebdcc3]/70 bg-white/60 hover:bg-white hover:border-[#d97706]/50'
                    }`}
                  >
                    <div 
                      className={`grid size-7 shrink-0 place-items-center rounded-lg text-sm font-black border transition ${
                        isSelected 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' 
                          : 'bg-orange-50 text-orange-700 border-orange-200 group-hover:border-orange-300'
                      }`}
                    >
                      {label}
                    </div>
                    <span className="text-base font-bold text-[#352315] leading-relaxed pt-0.5">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleAskExit}
              className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white/80 px-5 py-3 text-xs font-black uppercase tracking-wide text-[#7a5030] shadow-sm transition hover:bg-white hover:-translate-y-0.5"
            >
              <ArrowLeft size={14} />
              Batal & Bali
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={selectedOpt === null}
              className="flex items-center gap-2 rounded-2xl border-4 border-white bg-gradient-to-b from-[#ffb970] to-[#ff9114] px-7 py-3.5 text-sm font-black uppercase text-white shadow-[0_4px_0_rgba(126,68,18,0.24)] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {currentIdx === evaluasiQuestions.length - 1 ? 'Rampung' : 'Pitakon Sabanjure'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── SCREEN: RESULT ──────────────── */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-transparent px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="evaluasi-exit-title"
        >
          <div className="w-full max-w-[420px] overflow-hidden rounded-[8px] border-2 border-[#0ea5a4] bg-[#fffaf3] ring-4 ring-white">
            <div className="h-2 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#0ea5a4]" />
            <div className="p-5 text-center sm:p-6">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-orange-100 text-orange-600 ring-4 ring-orange-50">
                <AlertTriangle size={28} aria-hidden="true" />
              </div>
              <h2 id="evaluasi-exit-title" className="mt-4 text-xl font-black text-[#2e1d10]">
                Yakin Pengin Metu?
              </h2>
              <p className="mx-auto mt-2 max-w-[320px] text-sm font-bold leading-relaxed text-[#6b4a2d]">
                Yen kowe metu, kabeh wangsulanmu bakal ilang lan evaluasi kudu diwiwiti maneh saka awal.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-[#7a5030] transition hover:-translate-y-0.5 hover:bg-orange-50"
                >
                  Tetep Nggarap
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="inline-flex items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-b from-[#ff9d50] to-[#d95716] px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  Metu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {step === 'result' && (
        <div className="flex flex-col gap-6 animate-[fadeInUp_0.5s_ease-out]">
          <div className="relative overflow-hidden rounded-[8px] border border-white/80 bg-white/82 px-6 py-8 text-center shadow-[0_18px_40px_rgba(77,48,24,0.16)] backdrop-blur-md sm:py-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#0ea5a4]" />
            
            {/* Glow halo background */}
            <div
              className="absolute rounded-full"
              style={{
                width: '180px', height: '180px',
                background: score >= 70
                  ? `radial-gradient(circle, #f59e0b55 0%, transparent 70%)`
                  : 'radial-gradient(circle, rgba(185,28,28,0.15) 0%, transparent 70%)',
                filter: 'blur(20px)',
                left: 'calc(50% - 90px)',
                top: '30px',
              }}
            />

            {/* Score circle */}
            <div
              className="relative mx-auto flex size-28 items-center justify-center rounded-full border-4 shadow-2xl"
              style={{
                borderColor: 'rgba(255,255,255,0.7)',
                background: score >= 70
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #b91c1c, #991b1b)',
                boxShadow: score >= 70 ? '0 10px 30px rgba(217,119,6,0.3)' : '0 10px 30px rgba(185,28,28,0.3)',
              }}
            >
              <span className="text-5xl leading-none" aria-hidden="true">
                {score >= 100 ? '🏆' : score >= 80 ? '🌟' : score >= 70 ? '🎖️' : '💪'}
              </span>
            </div>

            <h1 className="mt-6 text-[clamp(3rem,8vw,4.5rem)] font-black leading-none text-[#2b1d12]">
              {score}
              <span className="text-[0.45em] text-gray-400">/100</span>
            </h1>
            
            <p className="mt-2 text-sm font-black text-gray-500 tracking-wider uppercase">
              {score >= 70 ? 'LULUS EVALUASI' : 'DURUNG LULUS'}
            </p>

            <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white/60 p-4 border border-white/80 shadow-sm backdrop-blur-sm">
              <p className="text-lg font-black text-[#2e1d10]">
                {score === 100 
                  ? 'Luar biasa! Wangsulanmu sampurna! 🏆' 
                  : score >= 80 
                  ? 'Apik banget! Nilaimu dhuwur lan maremake! 🌟' 
                  : score >= 70 
                  ? 'Apik! Kowe wis lulus wates minimum evaluasi! 👍' 
                  : 'Tetep semangat, coba maneh kanggo ngunggahake bijimu! 💪'}
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {score >= 70 
                  ? 'Kowe nduweni hak kanggo ndeleng lan nyithak sertifikat kelulusan.'
                  : 'Sinau maneh materi parikan banjur baleni evaluasi iki.'}
              </p>
            </div>

            {/* Sertifikat button & action buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {score >= 70 && (
                <button
                  type="button"
                  onClick={() => { playClick(); setStep('certificate'); }}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/95 bg-[#0f766e] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0d6861]"
                >
                  <Award size={17} />
                  Tampilake Sertifikat
                </button>
              )}

              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-white/90 px-6 py-3 text-sm font-black uppercase tracking-wide text-[#7a5030] shadow-md transition hover:-translate-y-0.5 hover:bg-white"
              >
                <RotateCcw size={16} />
                Coba Maneh
              </button>
            </div>
          </div>

          {/* Tinjauan Wangsulan */}
          <div className="rounded-[8px] border border-white/85 bg-white/92 p-5 shadow-[0_12px_28px_rgba(77,48,24,0.12)] backdrop-blur-sm">
            <h2 className="text-xl font-black text-[#2e1d10] mb-4 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Tinjauan Pitakonan</span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                {answers.filter((ans, i) => ans === evaluasiQuestions[i].correctIndex).length} / 10 Bener
              </span>
            </h2>

            <div className="grid gap-4">
              {evaluasiQuestions.map((q, i) => {
                const userAnsIdx = answers[i];
                const isCorrect = userAnsIdx === q.correctIndex;
                const labelUser = String.fromCharCode(65 + userAnsIdx);
                const labelCorrect = String.fromCharCode(65 + q.correctIndex);

                return (
                  <article 
                    key={q.id}
                    className={`rounded-2xl border p-4 text-[#2e1d10] transition-colors ${
                      isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-red-100 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                        isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isCorrect ? <Check size={10} strokeWidth={3} /> : <span className="text-[8px] font-black">X</span>}
                        Pitakon {i + 1}
                      </span>
                    </div>

                    <p className="text-base font-black leading-relaxed whitespace-pre-line mb-3">
                      {q.question}
                    </p>

                    <div className="grid gap-2 text-sm font-bold sm:grid-cols-2">
                      <div className={`p-2.5 rounded-xl border ${
                        isCorrect ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-red-50/50 border-red-100 text-red-800'
                      }`}>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">Wangsulanmu</p>
                        <p className="text-sm font-bold">({labelUser}) {q.options[userAnsIdx]}</p>
                      </div>

                      {!isCorrect && (
                        <div className="p-2.5 rounded-xl border bg-emerald-50/50 border-emerald-100 text-emerald-800">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">Wangsulan Bener</p>
                          <p className="text-sm font-bold">({labelCorrect}) {q.options[q.correctIndex]}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-orange-50/30 border border-orange-100/50 text-xs font-semibold text-[#8a541d] leading-relaxed">
                      <span className="font-black text-orange-600 block mb-0.5">Katrangan:</span>
                      {q.explanation}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── SCREEN: CERTIFICATE (PRINTABLE) ──────────────── */}
      {step === 'certificate' && (
        <div className="flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out] print:p-0">
          
          {/* Back button & Print button (hidden on print) */}
          <div className="flex items-center justify-between print:hidden">
            <button
              type="button"
              onClick={() => { playClick(); setStep('result'); }}
              className="flex items-center gap-2 rounded-xl border-2 border-white bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#7a5030] shadow-sm transition hover:bg-white"
            >
              <ArrowLeft size={14} />
              Bali menyang Kasil
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <Printer size={14} />
              Cetak / Simpen PDF
            </button>
          </div>

          {/* Certificate Container */}
          <div 
            id="certificate-print"
            className="relative overflow-hidden rounded-[8px] bg-[#fbf8f3] border-[16px] border-double border-[#8a541d] px-6 py-10 shadow-[0_20px_50px_rgba(77,48,24,0.22)] print:border-[12px] print:shadow-none print:my-0 print:mx-auto print:w-full"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(217,119,6,0.02) 0%, rgba(217,119,6,0.06) 100%)",
            }}
          >
            {/* Corner ornaments */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-[#8a541d]" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-[#8a541d]" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-[#8a541d]" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-[#8a541d]" />

            {/* Certificate Header */}
            <div className="text-center">
              <span className="text-2xl tracking-[0.25em] font-serif font-black text-[#8a541d] block">SERTIFIKAT KELULUSAN</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d97706] mt-1 block">Aplikasi Pembelajaran Javanesia</span>
              
              <div className="w-[180px] h-[3px] bg-gradient-to-r from-transparent via-[#8a541d] to-transparent mx-auto mt-4" />
            </div>

            {/* Certificate Body */}
            <div className="text-center mt-8">
              <p className="text-sm font-semibold text-gray-500 italic">Sertifikat iki kanthi bangga diwenehake marang:</p>
              
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#2e1d10] mt-4 tracking-wide capitalize">
                {name}
              </h2>
              
              <div className="w-[280px] h-[1px] bg-gray-300 mx-auto mt-2" />
              
              <p className="text-sm font-black text-[#8a541d] mt-2">
                Kelas {studentClass || '-'} · Nomer Absen {absen || '-'}
              </p>

              <p className="max-w-xl mx-auto text-sm font-semibold text-gray-600 leading-relaxed mt-6">
                Amarga wis ngrampungi <strong className="text-[#2e1d10] font-black">Evaluasi Menulis Parikan Jawa (Fase D)</strong> kanthi asil sing maremake lan dinyatakake lulus ing aplikasi Javanesia.
              </p>
            </div>

            {/* Score display on certificate */}
            <div className="flex justify-center items-center gap-6 mt-8">
              <div className="text-center rounded-2xl border border-[#ebdcc3] bg-[#fffbf4] px-5 py-3 shadow-inner">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Biji Evaluasi</p>
                <p className="text-3xl font-black text-[#0f766e] mt-0.5">{score} <span className="text-sm text-gray-400 font-bold">/ 100</span></p>
              </div>

              {/* Golden stamp */}
              <div className="relative flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-[#ffd700] via-[#f5a623] to-[#e07a00] border-4 border-white shadow-lg shadow-orange-500/20 animate-[spin_20s_linear_infinite]">
                <div className="absolute inset-1 rounded-full border border-dashed border-white/50" />
                <Award size={28} className="text-white drop-shadow" />
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 mt-12 text-center text-xs font-bold text-[#5d351d]">
              <div className="flex flex-col items-center">
                <p className="text-gray-400">Dosen Pembimbing / Guru</p>
                <div className="h-16 w-32 border-b border-dashed border-gray-300 flex items-center justify-center italic text-gray-400 text-[10px] pt-4">
                  Tapak asma ing kene
                </div>
                <p className="mt-1 text-[#2e1d10] font-black">Pendidik Basa Jawa</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-gray-400">Tanggal Rampung</p>
                <div className="h-16 w-32 border-b border-dashed border-gray-300 flex items-center justify-center font-bold text-[#2e1d10] pt-6">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <p className="mt-1 text-[#2e1d10] font-black">Javanesia System</p>
              </div>
            </div>

            {/* Decorative bottom border */}
            <div className="w-[100px] h-[3px] bg-gradient-to-r from-transparent via-[#8a541d] to-transparent mx-auto mt-10" />
          </div>
        </div>
      )}
    </div>
  );
}
