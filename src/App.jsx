import React, { useState } from 'react';
import { mainMenu } from './data/mainMenu.js';
import { materiList } from './data/materi.js';
import { videoList } from './data/videos.js';
import { NavBar } from './components/NavBar.jsx';
import { HomeBar } from './components/HomeBar.jsx';
import { InfoModal } from './components/InfoModal.jsx';
import { SceneLayout } from './components/SceneLayout.jsx';
import { SplashScreen } from './components/SplashScreen.jsx';
import { OpeningPage } from './pages/OpeningPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LearningPage } from './pages/LearningPage.jsx';
import { MateriPage } from './pages/MateriPage.jsx';
import { MateriDetailPage } from './pages/MateriDetailPage.jsx';
import { VideoPage } from './pages/VideoPage.jsx';
import { GamePage } from './pages/GamePage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';

// Cek apakah splash sudah ditampilkan di sesi ini
const hasSeenSplash = () => {
  try { return sessionStorage.getItem('javanesia-splash') === '1'; }
  catch { return false; }
};

const markSplashSeen = () => {
  try { sessionStorage.setItem('javanesia-splash', '1'); }
  catch { /* ignore */ }
};

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedLearning, setSelectedLearning] = useState(mainMenu[0]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeMateriIndex, setActiveMateriIndex] = useState(0);
  // Splash hanya tampil jika belum pernah muncul di sesi ini
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash());
  // Opening tampil setelah splash, sebelum home
  const [showOpening, setShowOpening] = useState(true);

  const handleSplashDone = () => {
    markSplashSeen();
    setShowSplash(false);
  };

  const handleEnter = () => {
    setShowOpening(false);
  };

  const goHome = () => {
    setActiveMenu(null);
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMenu = (item) => {
    if (item.page) {
      if (item.page === 'learning') setSelectedLearning(item);
      setPage(item.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveMenu(item);
  };

  const openMateri = (item) => {
    const idx = materiList.findIndex(m => m.title === item.title);
    setActiveMateriIndex(idx >= 0 ? idx : 0);
    setPage('materi-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextMateri = () => {
    if (activeMateriIndex < materiList.length - 1) {
      setActiveMateriIndex(i => i + 1);
    }
  };

  const handlePrevMateri = () => {
    if (activeMateriIndex > 0) {
      setActiveMateriIndex(i => i - 1);
    }
  };

  const activeMateri = materiList[activeMateriIndex];

  // ── Breadcrumb config per page ──────────────────────────────────────────────
  const pageCrumbs = {
    learning:        [{ label: selectedLearning.title }],
    materi:          [{ label: 'Materi Parikan' }],
    'materi-detail': [
      { label: 'Materi Parikan', onClick: () => { setPage('materi'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
      { label: activeMateri?.title ?? '' },
    ],
    video:           [{ label: 'Video Pembelajaran' }],
    game:            [{ label: 'Game Parikan' }],
    about:           [{ label: 'Tentang Pengembang' }],
  };
  const crumbs = pageCrumbs[page] ?? [];

  // ── Scene label ─────────────────────────────────────────────────────────────
  const sceneLabel =
    page === 'home'          ? 'Javanesia' :
    page === 'video'         ? 'Video Pembelajaran' :
    page === 'game'          ? 'Game Parikan' :
    page === 'about'         ? 'Tentang Pengembang' :
    page === 'learning'      ? selectedLearning.title :
    page === 'materi-detail' ? activeMateri?.title ?? 'Materi' :
                               'Materi Parikan Jawa';

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#f7ead7] text-[#2e1d10]">

      {/* Splash screen — hanya muncul sekali per sesi */}
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      {/* Opening page — muncul setelah splash, sebelum home */}
      {!showSplash && showOpening && (
        <OpeningPage onEnter={handleEnter} />
      )}

      {/* App utama — hanya render setelah opening selesai */}
      {!showOpening && (
        <>
          {page !== 'home' && (
            <NavBar crumbs={crumbs} onHome={goHome} />
          )}

          <SceneLayout
            variant={page === 'materi-detail' ? 'materi' : page}
            isHome={page === 'home'}
            label={sceneLabel}
          >
            <div key={page} className="page-enter">
              {page === 'home' && (
                <HomePage menuItems={mainMenu} onChooseMenu={openMenu} />
              )}

              {page === 'learning' && (
                <LearningPage item={selectedLearning} />
              )}

              {page === 'materi' && (
                <MateriPage materiItems={materiList} onOpenMateri={openMateri} />
              )}

              {page === 'materi-detail' && (
                <MateriDetailPage
                  item={activeMateri}
                  index={activeMateriIndex}
                  total={materiList.length}
                  hasNext={activeMateriIndex < materiList.length - 1}
                  hasPrev={activeMateriIndex > 0}
                  onNext={handleNextMateri}
                  onPrev={handlePrevMateri}
                  onBackToList={() => { setPage('materi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              )}

              {page === 'video' && <VideoPage videos={videoList} />}

              {page === 'game' && <GamePage />}

              {page === 'about' && <AboutPage />}
            </div>
          </SceneLayout>

          {page !== 'home' && <HomeBar onHome={goHome} />}

          {activeMenu && (
            <InfoModal label="Javanesia" item={activeMenu} onClose={() => setActiveMenu(null)} />
          )}
        </>
      )}

    </main>
  );
}
