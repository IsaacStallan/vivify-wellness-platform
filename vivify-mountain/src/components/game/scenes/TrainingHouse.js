import React, { useState, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { CinematicPlayer } from '../visuals/CinematicCharacters';
import './TrainingHouse.css';

function TrainingHouse({ onComplete }) {
    const { mountainData, logHabits, user } = useGame();
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [showTrainer, setShowTrainer] = useState(true);
    const [trainerMessage, setTrainerMessage] = useState('');
    const [habitStatus, setHabitStatus] = useState({
        hydration: false,
        sleep: false,
        movement: false,
        focus: false
    });

    // Check if training is complete (3 days with oxygen >70%)
    const canLeave = mountainData?.trainingComplete || false;
    const daysCompleted = mountainData?.consecutiveDaysAbove70 || 0;

    useEffect(() => {
        // Initial trainer greeting
        if (daysCompleted === 0) {
            setTrainerMessage(`Welcome to Vivify Mountain Training, ${user?.username}! Complete 3 days of habits to begin your expedition.`);
        } else if (daysCompleted < 3) {
            setTrainerMessage(`Good work! ${daysCompleted}/3 days completed. Keep building those habits!`);
        } else if (canLeave) {
            setTrainerMessage(`Amazing! You're ready to climb real mountains. Use the door to start your journey!`);
        }
    }, [daysCompleted, canLeave, user?.username]);

    const handleHabitClick = (habitId, habitName) => {
        setSelectedHabit({ id: habitId, name: habitName });
    };

    const handleHabitComplete = async (value) => {
        if (!selectedHabit) return;

        try {
            console.log('🎯 Logging habit:', selectedHabit.id, 'with value:', value);

            // Log the habit
            const habits = {
                hydration: selectedHabit.id === 'hydration' ? value : 0,
                sleep: selectedHabit.id === 'sleep' ? value : 0,
                movement: selectedHabit.id === 'movement' ? value : 0,
                focus: selectedHabit.id === 'focus' ? value : 0
            };

            const result = await logHabits(habits);
            console.log('✅ Habit logged successfully:', result);

            // Update local status
            setHabitStatus(prev => ({
                ...prev,
                [selectedHabit.id]: true
            }));

            const oxygenGain = result?.oxygenGained || result?.newOxygen - (mountainData?.oxygen || 0) || 0;
            setTrainerMessage(`Great job on ${selectedHabit.name}! Oxygen: ${Math.round(result?.newOxygen || mountainData?.oxygen || 0)}% (+${Math.round(oxygenGain)}%)`);
            setSelectedHabit(null);
        } catch (error) {
            console.error('❌ Failed to log habit:', error);
            setTrainerMessage(`Error: ${error.message}. Check console and try again.`);
            setSelectedHabit(null);
        }
    };

    const handleDoorClick = () => {
        if (canLeave) {
            onComplete();
        } else {
            setTrainerMessage(`Not yet! You need ${3 - daysCompleted} more days of training.`);
        }
    };

    return (
        <div className="training-house cinematic-view">
            {/* Cinematic Background with Parallax */}
            <div className="cinematic-background">
                {/* Far background - Gym wall */}
                <div className="bg-layer far-wall"></div>

                {/* Mid background - Equipment silhouettes */}
                <div className="bg-layer equipment-silhouettes"></div>

                {/* Ground with realistic texture */}
                <div className="ground-layer"></div>

                {/* Atmospheric lighting overlay */}
                <div className="lighting-overlay"></div>
            </div>

            {/* Cinematic Character - Large and close */}
            <div className="cinematic-character">
                <CinematicPlayer size={300} />
            </div>

            {/* Modern UI Overlay - Top HUD */}
            <div className="top-hud">
                <div className="progress-bar-container">
                    <div className="progress-label">
                        <span className="icon">🎯</span>
                        <span>TRAINING PROGRESS</span>
                    </div>
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(daysCompleted / 3) * 100}%` }}
                        ></div>
                        <div className="progress-text">{daysCompleted}/3 DAYS</div>
                    </div>
                </div>

                <div className="oxygen-display">
                    <div className="stat-value">{Math.round(mountainData?.oxygen || 100)}%</div>
                    <div className="stat-label">OXYGEN</div>
                </div>
            </div>

            {/* Modern UI Overlay - Habit Selection */}
            <div className="habit-selection-panel">
                <div className="panel-title">TODAY'S TRAINING</div>
                <div className="habit-grid-modern">
                    <button
                        className={`habit-card ${habitStatus.movement ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('movement', 'Movement')}
                    >
                        <div className="habit-icon-modern">
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path d="M 12 20 L 18 26 L 28 14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="habit-title">MOVEMENT</div>
                        <div className="habit-subtitle">Exercise</div>
                    </button>

                    <button
                        className={`habit-card ${habitStatus.hydration ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('hydration', 'Hydration')}
                    >
                        <div className="habit-icon-modern">
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <path d="M 20 5 L 28 15 Q 30 20 30 25 Q 30 32 20 35 Q 10 32 10 25 Q 10 20 12 15 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                        </div>
                        <div className="habit-title">HYDRATION</div>
                        <div className="habit-subtitle">Water Intake</div>
                    </button>

                    <button
                        className={`habit-card ${habitStatus.sleep ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('sleep', 'Sleep')}
                    >
                        <div className="habit-icon-modern">
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="15" cy="20" r="8" fill="currentColor"/>
                                <path d="M 25 12 Q 35 20 25 28" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="habit-title">SLEEP</div>
                        <div className="habit-subtitle">Rest Hours</div>
                    </button>

                    <button
                        className={`habit-card ${habitStatus.focus ? 'completed' : ''}`}
                        onClick={() => handleHabitClick('focus', 'Focus')}
                    >
                        <div className="habit-icon-modern">
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="4" fill="currentColor"/>
                                <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
                            </svg>
                        </div>
                        <div className="habit-title">FOCUS</div>
                        <div className="habit-subtitle">Concentration</div>
                    </button>
                </div>
            </div>

            {/* Action button */}
            <button
                className={`action-button ${canLeave ? 'ready' : 'locked'}`}
                onClick={handleDoorClick}
            >
                <div className="button-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5 L15 12 L 9 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{canLeave ? 'START EXPEDITION' : `LOCKED - ${3 - daysCompleted} DAYS LEFT`}</span>
                </div>
            </button>

            {/* Trainer Dialogue Box */}
            {trainerMessage && (
                <div className="dialogue-box">
                    <div className="dialogue-avatar">
                        <TrainerCharacter size={50} />
                    </div>
                    <div className="dialogue-content">
                        <div className="dialogue-name">Coach Summit</div>
                        <div className="dialogue-text">{trainerMessage}</div>
                    </div>
                    <button
                        className="dialogue-close"
                        onClick={() => setTrainerMessage('')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M 4 7 L 7 10 L 12 4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            )}

            {/* Habit Input Modal */}
            {selectedHabit && (
                <div className="habit-modal">
                    <div className="modal-content">
                        <h3>{selectedHabit.name}</h3>
                        {selectedHabit.id === 'hydration' && (
                            <div className="habit-input">
                                <p>How many glasses of water today?</p>
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
                        {selectedHabit.id === 'sleep' && (
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
                        {selectedHabit.id === 'movement' && (
                            <div className="habit-input">
                                <p>How many minutes of exercise?</p>
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
                        {selectedHabit.id === 'focus' && (
                            <div className="habit-input">
                                <p>How many hours of focused work?</p>
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

            {/* Training Progress Indicator */}
            <div className="training-progress">
                <div className="progress-text">Training: {daysCompleted}/3 days</div>
                <div className="progress-dots">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`dot ${i < daysCompleted ? 'completed' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TrainingHouse;
