import React, { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Auth from './components/Auth';
import TrainingGrounds from './components/TrainingGrounds';
import MountainView from './components/MountainView';
import Navigation from './components/Navigation';
import './App.css';

function AppContent() {
  const { user, mountainData, loading } = useGame();
  const [currentView, setCurrentView] = useState('game');

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const currentMountain = mountainData?.currentMountain || 'training';
  const isTraining = currentMountain === 'training';

  return (
    <div className="app">
      <Navigation currentView={currentView} onChangeView={setCurrentView} />

      <main className="app-main">
        {currentView === 'game' && (
          <>
            {isTraining ? (
              <TrainingGrounds />
            ) : (
              <MountainView />
            )}
          </>
        )}

        {currentView === 'profile' && (
          <div className="coming-soon">
            <h2>Profile Dashboard</h2>
            <p>Coming soon...</p>
          </div>
        )}

        {currentView === 'leaderboard' && (
          <div className="coming-soon">
            <h2>Leaderboards</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p className="disclaimer">
          Vivify is a performance training tool, not a mental health therapy service.
        </p>
        <div className="support-links">
          <span>Need Support?</span>
          <a href="https://www.lifeline.org.au" target="_blank" rel="noopener noreferrer">
            Lifeline (13 11 14)
          </a>
          <a href="https://kidshelpline.com.au" target="_blank" rel="noopener noreferrer">
            Kids Helpline (1800 55 1800)
          </a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
