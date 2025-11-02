import React, { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Auth from './components/Auth';
import GameContainer from './components/game/GameContainer';
import './App.css';

function AppContent() {
  const { user, loading } = useGame();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Vivify Mountain...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <GameContainer />;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
