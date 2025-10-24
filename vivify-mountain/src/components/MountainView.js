import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import OxygenGauge from './OxygenGauge';
import HabitCards from './HabitCards';
import './MountainView.css';

function MountainView() {
    const { mountainData, currentMountain } = useGame();
    const [showSummit, setShowSummit] = useState(false);

    const altitude = mountainData?.altitude || 0;
    const oxygen = mountainData?.oxygen || 0;
    const targetElevation = currentMountain?.elevation || 3776;
    const progressPercent = (altitude / targetElevation) * 100;

    useEffect(() => {
        // Check if summit reached
        if (altitude >= targetElevation) {
            setShowSummit(true);
        }
    }, [altitude, targetElevation]);

    return (
        <div className="mountain-view">
            {/* Mountain Background with Parallax */}
            <div className="mountain-background">
                <div className="mountain-layer mountain-far" style={{ transform: `translateY(${progressPercent * 0.5}px)` }} />
                <div className="mountain-layer mountain-mid" style={{ transform: `translateY(${progressPercent * 1}px)` }} />
                <div className="mountain-layer mountain-near" style={{ transform: `translateY(${progressPercent * 1.5}px)` }} />

                {/* Avatar */}
                <div
                    className="avatar-climber"
                    style={{ bottom: `${Math.min(90, progressPercent)}%` }}
                >
                    🧗
                </div>

                {/* Summit Flag */}
                {altitude >= targetElevation && (
                    <div className="summit-flag">🚩</div>
                )}
            </div>

            {/* HUD */}
            <div className="mountain-hud">
                {/* Top Left - Altitude */}
                <div className="hud-altitude">
                    <div className="altitude-value">{altitude}m</div>
                    <div className="altitude-target">/ {targetElevation}m</div>
                    <div className="mountain-name">{currentMountain?.name || 'Unknown'}</div>
                </div>

                {/* Top Right - Oxygen */}
                <div className="hud-oxygen">
                    <OxygenGauge oxygen={oxygen} size="medium" />
                </div>

                {/* Progress Bar */}
                <div className="hud-progress">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(100, progressPercent)}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        {Math.round(progressPercent)}% to summit
                    </div>
                </div>
            </div>

            {/* Habit Cards at Bottom */}
            <div className="mountain-habits">
                <HabitCards isTraining={false} />
            </div>

            {/* Summit Modal */}
            {showSummit && (
                <SummitCelebration mountain={currentMountain} onClose={() => setShowSummit(false)} />
            )}
        </div>
    );
}

function SummitCelebration({ mountain, onClose }) {
    const { startMountain } = useGame();
    const [showNext, setShowNext] = useState(false);

    async function handleNextMountain() {
        try {
            const nextMountainId = getNextMountainId(mountain.id);
            if (nextMountainId) {
                await startMountain(nextMountainId);
                onClose();
            }
        } catch (error) {
            alert('Error starting next mountain: ' + error.message);
        }
    }

    function getNextMountainId(currentId) {
        const order = ['fuji', 'kilimanjaro', 'elbrus', 'denali', 'aconcagua', 'vinson', 'everest'];
        const currentIndex = order.indexOf(currentId);
        return currentIndex >= 0 && currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
    }

    const nextMountainId = getNextMountainId(mountain.id);

    return (
        <div className="modal-overlay">
            <div className="summit-modal">
                <div className="summit-fireworks">🎆🎇✨</div>

                <h1 className="summit-title">Summit Reached!</h1>

                <div className="summit-mountain">
                    🏔️ {mountain.name}
                </div>

                <div className="summit-stats">
                    <div className="summit-stat">
                        <span className="stat-label">Elevation</span>
                        <span className="stat-value">{mountain.elevation}m</span>
                    </div>
                    <div className="summit-stat">
                        <span className="stat-label">Duration</span>
                        <span className="stat-value">{mountain.duration} days</span>
                    </div>
                </div>

                <div className="summit-badge">
                    <div className="badge-icon">🏅</div>
                    <div className="badge-name">{mountain.name} Summit Badge</div>
                </div>

                {mountain.rewards && mountain.rewards.gear && (
                    <div className="summit-rewards">
                        <h3>Rewards Unlocked:</h3>
                        <div className="reward-items">
                            {mountain.rewards.gear.map((item, i) => (
                                <div key={i} className="reward-item">
                                    {item.replace(/_/g, ' ')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="summit-actions">
                    {nextMountainId ? (
                        <button className="btn-primary" onClick={handleNextMountain}>
                            Start Next Mountain
                        </button>
                    ) : (
                        <div className="all-summits-complete">
                            🎊 You've completed all Seven Summits! 🎊
                        </div>
                    )}
                    <button className="btn-secondary" onClick={onClose}>
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MountainView;
