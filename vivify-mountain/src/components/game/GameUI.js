import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { PlayerCharacter } from './visuals/Characters';
import './GameUI.css';

function GameUI({ currentScene }) {
    const { mountainData, user } = useGame();
    const oxygen = mountainData?.oxygen || 0;

    return (
        <>
            {/* Top Bar - Stats */}
            <div className="game-ui-top">
                <div className="player-info">
                    <div className="player-avatar">
                        <PlayerCharacter size={28} />
                    </div>
                    <div className="player-name">{user?.username}</div>
                </div>
                <div className="oxygen-bar">
                    <div className="oxygen-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                            <path d="M 6 10 Q 10 6 14 10" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                            <path d="M 6 10 Q 10 14 14 10" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                        </svg>
                    </div>
                    <div className="bar-container">
                        <div
                            className="bar-fill oxygen"
                            style={{ width: `${oxygen}%` }}
                        />
                    </div>
                    <div className="stat-value">{Math.round(oxygen)}%</div>
                </div>
            </div>

            {/* Bottom Navigation - Simplified (non-functional buttons hidden for now) */}
            {/* Navigation is handled by in-scene buttons instead */}
        </>
    );
}

export default GameUI;
