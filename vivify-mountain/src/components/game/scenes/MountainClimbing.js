import React, { useState, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ClimbingCharacter, MountainPeak } from '../visuals/Characters';
import './MountainClimbing.css';

// Mountain data matching backend config
const MOUNTAIN_DATA = {
    fuji: { name: 'Mt. Fuji', elevation: 3776, duration: 14, type: 'volcano' },
    kilimanjaro: { name: 'Kilimanjaro', elevation: 5895, duration: 21, type: 'snow' },
    elbrus: { name: 'Mt. Elbrus', elevation: 5642, duration: 18, type: 'snow' },
    denali: { name: 'Denali', elevation: 6190, duration: 21, type: 'snow' },
    aconcagua: { name: 'Aconcagua', elevation: 6961, duration: 21, type: 'rock' },
    vinson: { name: 'Vinson Massif', elevation: 4892, duration: 21, type: 'snow' },
    everest: { name: 'Mt. Everest', elevation: 8849, duration: 30, type: 'snow' }
};

function MountainClimbing({ mountainId, onReturnToMap }) {
    const { mountainData, logHabits, startMountain } = useGame();
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [showSummit, setShowSummit] = useState(false);
    const [todayHabits, setTodayHabits] = useState({
        hydration: false,
        sleep: false,
        movement: false,
        focus: false
    });

    const mountain = MOUNTAIN_DATA[mountainId] || MOUNTAIN_DATA.fuji;
    const currentAltitude = mountainData?.altitude || 0;
    const targetElevation = mountain.elevation;
    const progress = Math.min((currentAltitude / targetElevation) * 100, 100);
    const oxygen = mountainData?.oxygen || 100;

    // Check if we've summited
    const hasSummited = mountainData?.summitsBadges?.includes(mountainId) || false;

    useEffect(() => {
        // Start the mountain climb if not already started
        const initClimb = async () => {
            if (mountainData?.currentMountain !== mountainId) {
                try {
                    await startMountain(mountainId);
                } catch (error) {
                    console.error('Failed to start mountain:', error);
                }
            }
        };

        initClimb();
    }, [mountainId, mountainData?.currentMountain, startMountain]);

    useEffect(() => {
        // Show summit celebration if we just reached the top
        if (progress >= 100 && !showSummit && hasSummited) {
            setShowSummit(true);
        }
    }, [progress, showSummit, hasSummited]);

    const handleHabitClick = (habitId) => {
        if (todayHabits[habitId]) {
            // Already completed today
            return;
        }
        setSelectedHabit(habitId);
    };

    const handleHabitComplete = async (value) => {
        if (!selectedHabit) return;

        try {
            console.log('🎯 Logging habit:', selectedHabit, 'with value:', value);

            const habits = {
                hydration: selectedHabit === 'hydration' ? value : 0,
                sleep: selectedHabit === 'sleep' ? value : 0,
                movement: selectedHabit === 'movement' ? value : 0,
                focus: selectedHabit === 'focus' ? value : 0
            };

            const result = await logHabits(habits);
            console.log('✅ Habit logged successfully:', result);
            console.log('📊 Oxygen before:', oxygen, '→ after:', result?.newOxygen);
            console.log('⛰️ Altitude before:', currentAltitude, '→ after:', result?.newAltitude);

            setTodayHabits(prev => ({
                ...prev,
                [selectedHabit]: true
            }));

            setSelectedHabit(null);
            alert(`Habit logged! Oxygen: ${Math.round(result?.newOxygen || 0)}% | Altitude: ${Math.round(result?.newAltitude || 0)}m`);
        } catch (error) {
            console.error('❌ Failed to log habit:', error);
            alert(`Error: ${error.message}. Check browser console for details.`);
        }
    };

    // Calculate character position on mountain (bottom to top)
    const characterPosition = Math.min(progress, 95); // Cap at 95% so character stays on screen

    return (
        <div className="mountain-climbing">
            {/* Mountain Background with Layers */}
            <div className="mountain-view">
                {/* Sky gradient based on altitude */}
                <div
                    className="sky-layer"
                    style={{
                        background: progress < 30
                            ? 'linear-gradient(180deg, #87ceeb 0%, #b0d9f0 100%)'
                            : progress < 70
                            ? 'linear-gradient(180deg, #5b9bd5 0%, #87ceeb 100%)'
                            : 'linear-gradient(180deg, #2c5f8d 0%, #4a7ba7 100%)'
                    }}
                >
                    {/* Drifting Clouds */}
                    <div className="cloud cloud-1"></div>
                    <div className="cloud cloud-2"></div>
                    <div className="cloud cloud-3"></div>

                    {/* Stars appear at high altitude */}
                    {progress > 70 && (
                        <div className="stars">
                            <div className="star" style={{ top: '10%', left: '20%' }}></div>
                            <div className="star" style={{ top: '15%', left: '80%' }}></div>
                            <div className="star" style={{ top: '8%', left: '50%' }}></div>
                            <div className="star" style={{ top: '20%', left: '30%' }}></div>
                            <div className="star" style={{ top: '12%', left: '70%' }}></div>
                        </div>
                    )}
                </div>

                {/* Snow Particles (intensity increases with altitude) */}
                {progress > 20 && (
                    <div className="snow-particles">
                        {Array.from({ length: progress > 60 ? 30 : 15 }).map((_, i) => (
                            <div
                                key={i}
                                className="snowflake"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${5 + Math.random() * 5}s`,
                                    opacity: progress > 60 ? 0.8 : 0.5
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Fog/Mist Layer (stronger at mid-altitude) */}
                {progress > 40 && progress < 80 && (
                    <div className="fog-layer" style={{ opacity: 0.3 }}></div>
                )}

                {/* Mountain Slope */}
                <div className="mountain-slope">
                    {/* Trail markers every 25% */}
                    <div className="trail-marker" style={{ bottom: '25%' }}>
                        <div className="marker-flag">
                            <svg width="30" height="30" viewBox="0 0 30 30">
                                <line x1="2" y1="0" x2="2" y2="30" stroke="#654321" strokeWidth="2"/>
                                <path d="M 2 2 L 28 10 L 2 18 Z" fill="#dc2626"/>
                            </svg>
                        </div>
                        <div className="marker-label">Camp 1</div>
                    </div>
                    <div className="trail-marker" style={{ bottom: '50%' }}>
                        <div className="marker-flag">
                            <svg width="30" height="30" viewBox="0 0 30 30">
                                <line x1="2" y1="0" x2="2" y2="30" stroke="#654321" strokeWidth="2"/>
                                <path d="M 2 2 L 28 10 L 2 18 Z" fill="#dc2626"/>
                            </svg>
                        </div>
                        <div className="marker-label">Camp 2</div>
                    </div>
                    <div className="trail-marker" style={{ bottom: '75%' }}>
                        <div className="marker-flag">
                            <svg width="30" height="30" viewBox="0 0 30 30">
                                <line x1="2" y1="0" x2="2" y2="30" stroke="#654321" strokeWidth="2"/>
                                <path d="M 2 2 L 28 10 L 2 18 Z" fill="#dc2626"/>
                            </svg>
                        </div>
                        <div className="marker-label">Camp 3</div>
                    </div>

                    {/* Summit Flag */}
                    <div className="summit-marker">
                        <div className="summit-flag">
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <line x1="3" y1="0" x2="3" y2="40" stroke="#654321" strokeWidth="3"/>
                                <rect x="3" y="5" width="32" height="10" fill="#fbbf24"/>
                                <rect x="3" y="15" width="32" height="10" fill="#fff"/>
                                <rect x="3" y="25" width="32" height="10" fill="#fbbf24"/>
                            </svg>
                        </div>
                        <div className="summit-label">{mountain.name}</div>
                    </div>

                    {/* Climbing Character */}
                    <div
                        className="climber"
                        style={{
                            bottom: `${characterPosition}%`,
                            left: `${30 + (characterPosition * 0.3)}%` // Slight horizontal movement
                        }}
                    >
                        <ClimbingCharacter size={55} />
                        <div className="climber-shadow"></div>
                    </div>

                    {/* Progress Trail Line */}
                    <div
                        className="progress-trail"
                        style={{ height: `${progress}%` }}
                    />
                </div>

                {/* Stats Panel */}
                <div className="climbing-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📏</div>
                        <div className="stat-info">
                            <div className="stat-label">Altitude</div>
                            <div className="stat-value">{Math.round(currentAltitude)}m</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <div className="stat-label">Target</div>
                            <div className="stat-value">{targetElevation}m</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <div className="stat-label">Progress</div>
                            <div className="stat-value">{Math.round(progress)}%</div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <button className="back-btn" onClick={onReturnToMap}>
                    ← Map
                </button>
            </div>

            {/* Daily Habits Panel */}
            <div className="daily-habits-panel">
                <div className="panel-header">
                    <h3>Today's Climb</h3>
                    <div className="habits-completed">
                        {Object.values(todayHabits).filter(Boolean).length}/4
                    </div>
                </div>
                <div className="habit-grid">
                    <button
                        className={`habit-btn ${todayHabits.hydration ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('hydration')}
                    >
                        <div className="habit-icon">💧</div>
                        <div className="habit-name">Water</div>
                    </button>
                    <button
                        className={`habit-btn ${todayHabits.sleep ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('sleep')}
                    >
                        <div className="habit-icon">😴</div>
                        <div className="habit-name">Sleep</div>
                    </button>
                    <button
                        className={`habit-btn ${todayHabits.movement ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('movement')}
                    >
                        <div className="habit-icon">🏃</div>
                        <div className="habit-name">Move</div>
                    </button>
                    <button
                        className={`habit-btn ${todayHabits.focus ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('focus')}
                    >
                        <div className="habit-icon">🎯</div>
                        <div className="habit-name">Focus</div>
                    </button>
                </div>
            </div>

            {/* Habit Input Modal */}
            {selectedHabit && (
                <div className="habit-modal">
                    <div className="modal-content">
                        <h3>{selectedHabit.charAt(0).toUpperCase() + selectedHabit.slice(1)}</h3>
                        {selectedHabit === 'hydration' && (
                            <div className="habit-input">
                                <p>How many glasses of water?</p>
                                <div className="quick-buttons">
                                    {[4, 6, 8, 10].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handleHabitComplete(num)}
                                            className="quick-btn"
                                        >
                                            {num} 💧
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedHabit === 'sleep' && (
                            <div className="habit-input">
                                <p>How many hours of sleep?</p>
                                <div className="quick-buttons">
                                    {[6, 7, 8, 9].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handleHabitComplete(num)}
                                            className="quick-btn"
                                        >
                                            {num} hrs
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedHabit === 'movement' && (
                            <div className="habit-input">
                                <p>How many minutes?</p>
                                <div className="quick-buttons">
                                    {[15, 30, 45, 60].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handleHabitComplete(num)}
                                            className="quick-btn"
                                        >
                                            {num} min
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedHabit === 'focus' && (
                            <div className="habit-input">
                                <p>How many hours?</p>
                                <div className="quick-buttons">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handleHabitComplete(num)}
                                            className="quick-btn"
                                        >
                                            {num} hrs
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                            className="cancel-btn"
                            onClick={() => setSelectedHabit(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Summit Celebration */}
            {showSummit && (
                <div className="summit-celebration">
                    <div className="celebration-content">
                        <div className="celebration-visual">
                            <MountainPeak type={mountain.type} size={120} />
                        </div>
                        <h2>Summit Reached!</h2>
                        <p>Congratulations! You've conquered {mountain.name}!</p>
                        <div className="celebration-stats">
                            <div>Elevation: {targetElevation}m</div>
                            <div>Your Oxygen: {Math.round(oxygen)}%</div>
                        </div>
                        <button
                            className="continue-btn"
                            onClick={() => {
                                setShowSummit(false);
                                onReturnToMap();
                            }}
                        >
                            Return to Map
                        </button>
                    </div>
                </div>
            )}

            {/* Warning if oxygen is low */}
            {oxygen < 50 && oxygen > 0 && (
                <div className="oxygen-warning">
                    ⚠️ Low Oxygen! Complete more habits to stay safe!
                </div>
            )}
        </div>
    );
}

export default MountainClimbing;
