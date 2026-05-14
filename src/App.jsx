import React, { useState } from 'react';
import { mainMenu } from './data/mainMenu.js';
import { materiList } from './data/materi.js';
import { videoList } from './data/videos.js';
import { HomeBar } from './components/HomeBar.jsx';
import { InfoModal } from './components/InfoModal.jsx';
import { SceneLayout } from './components/SceneLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LearningPage } from './pages/LearningPage.jsx';
import { MateriPage } from './pages/MateriPage.jsx';
import { VideoPage } from './pages/VideoPage.jsx';
import { GamePage } from './pages/GamePage.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedMateri, setSelectedMateri] = useState(materiList[0]);
  const [selectedLearning, setSelectedLearning] = useState(mainMenu[0]);
  const [activeMateri, setActiveMateri] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const goHome = () => {
    setActiveMenu(null);
    setActiveMateri(null);
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMenu = (item) => {
    if (item.page) {
      if (item.page === 'learning') {
        setSelectedLearning(item);
      }
      setPage(item.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveMenu(item);
  };

  const openMateri = (item) => {
    setSelectedMateri(item);
    setActiveMateri(item);
  };

  const handleNextMateri = () => {
    const currentIndex = materiList.findIndex(m => m.title === activeMateri.title);
    if (currentIndex >= 0 && currentIndex < materiList.length - 1) {
      setActiveMateri(materiList[currentIndex + 1]);
    }
  };

  const handlePrevMateri = () => {
    const currentIndex = materiList.findIndex(m => m.title === activeMateri.title);
    if (currentIndex > 0) {
      setActiveMateri(materiList[currentIndex - 1]);
    }
  };

  const hasNextMateri = activeMateri && materiList.findIndex(m => m.title === activeMateri.title) < materiList.length - 1;
  const hasPrevMateri = activeMateri && materiList.findIndex(m => m.title === activeMateri.title) > 0;

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#f7ead7] text-[#2e1d10]">
      <SceneLayout variant={page} isHome={page === 'home'} label={page === 'home' ? 'Javanesia' : page === 'video' ? 'Video Pembelajaran' : page === 'game' ? 'Game Parikan' : page === 'learning' ? selectedLearning.title : 'Materi Parikan Jawa'}>
        {page === 'home' && (
          <HomePage menuItems={mainMenu} onChooseMenu={openMenu} />
        )}

        {page === 'learning' && (
          <LearningPage item={selectedLearning} />
        )}

        {page === 'materi' && (
          <MateriPage
            materiItems={materiList}
            onOpenMateri={openMateri}
          />
        )}

        {page === 'video' && <VideoPage videos={videoList} />}

        {page === 'game' && <GamePage />}
      </SceneLayout>

      {page !== 'home' && <HomeBar onHome={goHome} />}

      {activeMenu && <InfoModal label="Javanesia" item={activeMenu} onClose={() => setActiveMenu(null)} />}
      {activeMateri && (
        <InfoModal 
          label="Materi Parikan" 
          item={activeMateri} 
          example={activeMateri.example} 
          onClose={() => setActiveMateri(null)}
          onNext={handleNextMateri}
          onPrev={handlePrevMateri}
          hasNext={hasNextMateri}
          hasPrev={hasPrevMateri}
        />
      )}
    </main>
  );
}
