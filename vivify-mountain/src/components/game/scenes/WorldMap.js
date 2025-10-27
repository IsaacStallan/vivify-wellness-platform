import React, { useState } from 'react';
import { useGame } from '../../../contexts/GameContext';
import './WorldMap.css';

// Mountain configurations matching backend
const MOUNTAINS = [
    { id: 'fuji', name: 'Mt. Fuji', emoji: '🗻', elevation: 3776, region: 'Japan', position: { x: '75%', y: '35%' }, unlocked: true },
    { id: 'kilimanjaro', name: 'Kilimanjaro', emoji: '⛰️', elevation: 5895, region: 'Tanzania', position: { x: '45%', y: '55%' }, unlocked: true },
    { id: 'elbrus', name: 'Mt. Elbrus', emoji: '🏔️', elevation: 5642, region: 'Russia', position: { x: '55%', y: '25%' }, unlocked: false },
    { id: 'denali', name: 'Denali', emoji: '🏔️', elevation: 6190, region: 'Alaska', position: { x: '15%', y: '20%' }, unlocked: false },
    { id: 'aconcagua', name: 'Aconcagua', emoji: '⛰️', elevation: 6961, region: 'Argentina', position: { x: '25%', y: '70%' }, unlocked: false },
    { id: 'vinson', name: 'Vinson Massif', emoji: '🏔️', elevation: 4892, region: 'Antarctica', position: { x: '40%', y: '85%' }, unlocked: false },
    { id: 'everest', name: 'Mt. Everest', emoji: '⛰️', elevation: 8849, region: 'Nepal', position: { x: '70%', y: '30%' }, unlocked: false }
];

function WorldMap({ onSelectMountain, onReturnHome }) {
    const { mountainData } = useGame();
    const [selectedMountain, setSelectedMountain] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    // Determine which mountains are unlocked based on user progress
    const unlockedMountains = MOUNTAINS.map(mountain => {
        // First two mountains (Fuji and Kilimanjaro) are always unlocked
        if (mountain.id === 'fuji' || mountain.id === 'kilimanjaro') {
            return { ...mountain, unlocked: true };
        }

        // Check if user has completed previous mountains
        const summitsBadges = mountainData?.summitsBadges || [];

        // Unlock logic: need to complete previous mountains
        if (mountain.id === 'elbrus' && summitsBadges.includes('fuji')) {
            return { ...mountain, unlocked: true };
        }
        if (mountain.id === 'denali' && summitsBadges.includes('kilimanjaro')) {
            return { ...mountain, unlocked: true };
        }
        if (mountain.id === 'aconcagua' && summitsBadges.length >= 3) {
            return { ...mountain, unlocked: true };
        }
        if (mountain.id === 'vinson' && summitsBadges.length >= 5) {
            return { ...mountain, unlocked: true };
        }
        if (mountain.id === 'everest' && summitsBadges.length >= 6) {
            return { ...mountain, unlocked: true };
        }

        return { ...mountain, unlocked: false };
    });

    const handleMountainClick = (mountain) => {
        if (!mountain.unlocked) {
            setSelectedMountain({ ...mountain, locked: true });
            setShowInfo(true);
            return;
        }

        setSelectedMountain(mountain);
        setShowInfo(true);
    };

    const handleStartClimb = () => {
        if (selectedMountain && selectedMountain.unlocked) {
            onSelectMountain(selectedMountain.id);
        }
    };

    const summitsCompleted = mountainData?.summitsBadges?.length || 0;

    return (
        <div className="world-map">
            {/* Map Background */}
            <div className="map-background">
                <div className="map-title">
                    <h1>🌍 Seven Summits Challenge</h1>
                    <div className="summit-count">
                        {summitsCompleted}/7 Summits Conquered
                    </div>
                </div>

                {/* Mountain Markers */}
                {unlockedMountains.map((mountain) => (
                    <div
                        key={mountain.id}
                        className={`mountain-marker ${mountain.unlocked ? 'unlocked' : 'locked'} ${
                            mountainData?.summitsBadges?.includes(mountain.id) ? 'completed' : ''
                        }`}
                        style={{
                            left: mountain.position.x,
                            top: mountain.position.y
                        }}
                        onClick={() => handleMountainClick(mountain)}
                    >
                        <div className="marker-icon">{mountain.emoji}</div>
                        <div className="marker-name">{mountain.name}</div>
                        {mountainData?.summitsBadges?.includes(mountain.id) && (
                            <div className="completion-badge">✓</div>
                        )}
                        {!mountain.unlocked && <div className="lock-icon">🔒</div>}
                    </div>
                ))}

                {/* Player Icon (current location) */}
                <div className="player-marker" style={{ left: '50%', top: '50%' }}>
                    <div className="player-icon">🧍</div>
                </div>

                {/* Home Button */}
                <button className="home-btn" onClick={onReturnHome}>
                    🏠 Training House
                </button>
            </div>

            {/* Mountain Info Panel */}
            {showInfo && selectedMountain && (
                <div className="mountain-info-overlay" onClick={() => setShowInfo(false)}>
                    <div className="mountain-info-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="info-header">
                            <div className="info-emoji">{selectedMountain.emoji}</div>
                            <div className="info-title">
                                <h2>{selectedMountain.name}</h2>
                                <div className="info-region">{selectedMountain.region}</div>
                            </div>
                        </div>

                        <div className="info-stats">
                            <div className="stat-item">
                                <div className="stat-label">Elevation</div>
                                <div className="stat-value">{selectedMountain.elevation.toLocaleString()}m</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Status</div>
                                <div className="stat-value">
                                    {mountainData?.summitsBadges?.includes(selectedMountain.id)
                                        ? '✓ Conquered'
                                        : selectedMountain.unlocked
                                        ? '🔓 Available'
                                        : '🔒 Locked'}
                                </div>
                            </div>
                        </div>

                        {selectedMountain.locked && (
                            <div className="locked-message">
                                <p>🔒 This mountain is locked!</p>
                                <p>Complete more summits to unlock.</p>
                            </div>
                        )}

                        <div className="info-actions">
                            {selectedMountain.unlocked && (
                                <button className="climb-btn" onClick={handleStartClimb}>
                                    🧗 Start Climbing
                                </button>
                            )}
                            <button className="close-btn" onClick={() => setShowInfo(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Overview */}
            <div className="progress-overview">
                <div className="badge-list">
                    {MOUNTAINS.map((mountain) => (
                        <div
                            key={mountain.id}
                            className={`badge ${
                                mountainData?.summitsBadges?.includes(mountain.id) ? 'earned' : 'unearned'
                            }`}
                            title={mountain.name}
                        >
                            {mountainData?.summitsBadges?.includes(mountain.id) ? mountain.emoji : '?'}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WorldMap;
