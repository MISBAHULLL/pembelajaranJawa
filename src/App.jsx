import React, { useState } from 'react';
import { mainMenu } from './data/mainMenu.js';
import { materiList } from './data/materi.js';
import { videoList } from './data/videos.js';
import { NavBar } from './components/NavBar.jsx';
import { HomeBar } from './components/HomeBar.jsx';
import { InfoModal } from './components/InfoModal.jsx';
import { SceneLayout } from './components/SceneLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LearningPage } from './pages/LearningPage.jsx';
import { MateriPage } from './pages/MateriPage.jsx';
import { MateriDetailPage } from './pages/MateriDetailPage.jsx';
import { VideoPage } from './pages/VideoPage.jsx';
import { GamePage } from './pages/GamePage.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedLearning, setSelectedLearning] = useState(mainMenu[0]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeMateriIndex, setActiveMateriIndex] = useState(0);

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

  // Open materi detail by index
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
    learning:       [{ label: selectedLearning.title }],
    materi:         [{ label: 'Materi Parikan' }],
    'materi-detail': [
      { label: 'Materi Parikan', onClick: () => { setPage('materi'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
      { label: activeMateri?.title ?? '' },
    ],
    video:          [{ label: 'Video Pembelajaran' }],
    game:           [{ label: 'Game Parikan' }],
  };
  const crumbs = pageCrumbs[page] ?? [];

  // ── Scene label ─────────────────────────────────────────────────────────────
  const sceneLabel =
    page === 'home'          ? 'Javanesia' :
    page === 'video'         ? 'Video Pembelajaran' :
    page === 'game'          ? 'Game Parikan' :
    page === 'learning'      ? selectedLearning.title :
    page === 'materi-detail' ? activeMateri?.title ?? 'Materi' :
                               'Materi Parikan Jawa';

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#f7ead7] text-[#2e1d10]">
      {page !== 'home' && (
        <NavBar crumbs={crumbs} onHome={goHome} />
      )}

      <SceneLayout variant={page === 'materi-detail' ? 'materi' : page} isHome={page === 'home'} label={sceneLabel}>
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
      </SceneLayout>

      {page !== 'home' && <HomeBar onHome={goHome} />}

      {activeMenu && (
        <InfoModal label="Javanesia" item={activeMenu} onClose={() => setActiveMenu(null)} />
      )}
    </main>
  );
}
