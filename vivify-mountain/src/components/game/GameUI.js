import React from 'react';
import { useGame } from '../../contexts/GameContext';
import './GameUI.css';

function GameUI({ currentScene }) {
    const { mountainData, user } = useGame();

    return (
        <>
            {/* Top Bar - Stats */}
            <div className="game-ui-top">
                <div className="player-info">
                    <div className="player-avatar">👤</div>
                    <div className="player-name">{user?.username}</div>
                </div>
                <div className="oxygen-bar">
                    <div className="oxygen-icon">💨</div>
                    <div className="bar-container">
                        <div
                            className="bar-fill oxygen"
                            style={{ width: `${mountainData?.oxygen || 0}%` }}
                        />
                    </div>
                    <div className="stat-value">{Math.round(mountainData?.oxygen || 0)}%</div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="game-ui-bottom">
                <button className="nav-btn">
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Stats</span>
                </button>
                <button className="nav-btn">
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">Habits</span>
                </button>
                <button className="nav-btn primary">
                    <span className="nav-icon">🎒</span>
                </button>
                <button className="nav-btn">
                    <span className="nav-icon">🗺️</span>
                    <span className="nav-label">Map</span>
                </button>
                <button className="nav-btn">
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Profile</span>
                </button>
            </div>
        </>
    );
}

export default GameUI;
