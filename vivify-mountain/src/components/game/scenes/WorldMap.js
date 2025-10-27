import React, { useState } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { MountainPeak, PlayerCharacter } from '../visuals/Characters';
import './WorldMap.css';

// Mountain configurations with geographically accurate positions
const MOUNTAINS = [
    { id: 'fuji', name: 'Mt. Fuji', type: 'volcano', elevation: 3776, region: 'Japan', position: { x: '78%', y: '36%' }, unlocked: true },
    { id: 'kilimanjaro', name: 'Kilimanjaro', type: 'snow', elevation: 5895, region: 'Tanzania', position: { x: '54%', y: '58%' }, unlocked: true },
    { id: 'elbrus', name: 'Mt. Elbrus', type: 'snow', elevation: 5642, region: 'Russia', position: { x: '57%', y: '28%' }, unlocked: false },
    { id: 'denali', name: 'Denali', type: 'snow', elevation: 6190, region: 'Alaska', position: { x: '12%', y: '24%' }, unlocked: false },
    { id: 'aconcagua', name: 'Aconcagua', type: 'rock', elevation: 6961, region: 'Argentina', position: { x: '22%', y: '73%' }, unlocked: false },
    { id: 'vinson', name: 'Vinson Massif', type: 'snow', elevation: 4892, region: 'Antarctica', position: { x: '26%', y: '90%' }, unlocked: false },
    { id: 'everest', name: 'Mt. Everest', type: 'snow', elevation: 8849, region: 'Nepal', position: { x: '70%', y: '40%' }, unlocked: false }
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
                        <div className="marker-icon">
                            <MountainPeak type={mountain.type} size={50} />
                        </div>
                        <div className="marker-name">{mountain.name}</div>
                        {mountainData?.summitsBadges?.includes(mountain.id) && (
                            <div className="completion-badge">
                                <svg width="20" height="20" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="9" fill="#fbbf24" stroke="#fff" strokeWidth="2"/>
                                    <path d="M 6 10 L 9 13 L 14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                </svg>
                            </div>
                        )}
                        {!mountain.unlocked && (
                            <div className="lock-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20">
                                    <rect x="6" y="9" width="8" height="8" rx="1" fill="#6b7280" stroke="#333" strokeWidth="1"/>
                                    <path d="M 8 9 V 6 Q 8 4 10 4 Q 12 4 12 6 V 9" stroke="#6b7280" strokeWidth="2" fill="none"/>
                                    <circle cx="10" cy="13" r="1.5" fill="#333"/>
                                </svg>
                            </div>
                        )}
                    </div>
                ))}

                {/* Player Icon (current location) */}
                <div className="player-marker" style={{ left: '50%', top: '50%' }}>
                    <PlayerCharacter size={50} />
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
                            <div className="info-mountain-visual">
                                <MountainPeak type={selectedMountain.type} size={80} />
                            </div>
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
                            {mountainData?.summitsBadges?.includes(mountain.id) ? (
                                <MountainPeak type={mountain.type} size={30} />
                            ) : (
                                <span className="badge-unknown">?</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WorldMap;
