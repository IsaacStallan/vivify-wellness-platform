import React, { useState, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { PlayerCharacter, TrainerCharacter, DumbbellIcon, YogaMatIcon, WaterBottleIcon, BedIcon } from '../visuals/Characters';
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
        <div className="training-house">
            {/* Background Room */}
            <div className="room-background">
                {/* Floor */}
                <div className="floor"></div>

                {/* Back Wall */}
                <div className="back-wall">
                    <div className="window"></div>
                    <div className="poster">📊</div>
                </div>

                {/* Door (Exit) */}
                <div
                    className={`door ${canLeave ? 'unlocked' : 'locked'}`}
                    onClick={handleDoorClick}
                >
                    <div className="door-label">
                        {canLeave ? '🚪 Exit' : '🔒 Locked'}
                    </div>
                </div>

                {/* Training Equipment - Interactive Habit Zones */}
                <div
                    className={`equipment dumbbells ${habitStatus.movement ? 'completed' : ''}`}
                    onClick={() => handleHabitClick('movement', 'Movement')}
                >
                    <DumbbellIcon size={60} />
                    <div className="equipment-label">Movement</div>
                </div>

                <div
                    className={`equipment yoga-mat ${habitStatus.focus ? 'completed' : ''}`}
                    onClick={() => handleHabitClick('focus', 'Focus')}
                >
                    <YogaMatIcon size={60} />
                    <div className="equipment-label">Focus</div>
                </div>

                <div
                    className={`equipment water-station ${habitStatus.hydration ? 'completed' : ''}`}
                    onClick={() => handleHabitClick('hydration', 'Hydration')}
                >
                    <WaterBottleIcon size={60} />
                    <div className="equipment-label">Water</div>
                </div>

                <div
                    className={`equipment bed ${habitStatus.sleep ? 'completed' : ''}`}
                    onClick={() => handleHabitClick('sleep', 'Sleep')}
                >
                    <BedIcon size={100} />
                    <div className="equipment-label">Sleep Log</div>
                </div>

                {/* Player Character */}
                <div className="player-character">
                    <PlayerCharacter size={60} />
                    <div className="character-shadow"></div>
                </div>

                {/* NPC Trainer */}
                {showTrainer && (
                    <div className="npc-trainer">
                        <TrainerCharacter size={60} />
                        <div className="npc-shadow"></div>
                    </div>
                )}
            </div>

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
