import React from 'react';
import { useGame } from '../contexts/GameContext';
import './Navigation.css';

function Navigation({ currentView, onChangeView }) {
    const { user, mountainData, logout } = useGame();

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-logo">
                    <span className="nav-logo-icon">🏔️</span>
                    <span className="nav-logo-text">Vivify</span>
                </div>

                <div className="nav-links">
                    <button
                        className={`nav-link ${currentView === 'game' ? 'active' : ''}`}
                        onClick={() => onChangeView('game')}
                    >
                        ⛰️ Mountain
                    </button>
                    <button
                        className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
                        onClick={() => onChangeView('profile')}
                    >
                        👤 Profile
                    </button>
                    <button
                        className={`nav-link ${currentView === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => onChangeView('leaderboard')}
                    >
                        🏆 Leaderboard
                    </button>
                </div>

                <div className="nav-user">
                    <div className="nav-user-info">
                        <span className="nav-username">{user?.username}</span>
                        <span className="nav-mountain">
                            {mountainData?.currentMountain === 'training' ? '⛺ Training' : `🏔️ ${mountainData?.currentMountain || 'Unknown'}`}
                        </span>
                    </div>
                    <button className="btn-logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
