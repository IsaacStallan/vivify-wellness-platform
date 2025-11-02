import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import HabitCards from './HabitCards';
import OxygenGauge from './OxygenGauge';
import TestControls from './TestControls';
import './TrainingGrounds.css';

function TrainingGrounds({ onComplete }) {
    const { mountainData, logHabits } = useGame();
    const [showCustomHabitSelector, setShowCustomHabitSelector] = useState(false);

    const oxygen = mountainData?.oxygen || 0;
    const consecutiveDays = mountainData?.consecutiveDaysAbove70 || 0;
    const trainingComplete = mountainData?.trainingComplete || false;

    const progress = (consecutiveDays / 3) * 100;

    useEffect(() => {
        if (trainingComplete && onComplete) {
            // Auto-trigger completion after a short delay to show the final state
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }, [trainingComplete, onComplete]);

    return (
        <div className="training-grounds">
            <div className="training-header">
                <h1>⛺ Training Grounds</h1>
                <p className="training-subtitle">
                    Build your oxygen to 70% for 3 consecutive days to unlock Mt. Fuji
                </p>
            </div>

            <div className="training-content">
                {/* Oxygen Gauge */}
                <div className="training-gauge-section">
                    <OxygenGauge oxygen={oxygen} size="large" />

                    <div className="training-progress">
                        <h3>Unlock Progress</h3>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="progress-text">
                            {consecutiveDays}/3 days above 70% oxygen
                        </p>
                    </div>

                    {oxygen >= 70 && (
                        <div className={`streak-indicator ${consecutiveDays >= 1 ? 'active' : ''}`}>
                            🔥 {consecutiveDays} day streak at 70%+
                        </div>
                    )}

                    {trainingComplete && (
                        <div className="training-complete-badge">
                            <div className="badge-glow">
                                <span className="badge-icon">🏔️</span>
                                <h2>Training Complete!</h2>
                                <p>Mt. Fuji is now unlocked</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Habit Cards */}
                <div className="training-habits-section">
                    <HabitCards isTraining={true} />
                </div>
            </div>

            {/* Information Cards */}
            <div className="training-info">
                <div className="info-card">
                    <h3>💧 Core Habits</h3>
                    <ul>
                        <li>Hydration (6+ glasses) = +15% oxygen</li>
                        <li>Sleep (7+ hours) = +20% oxygen</li>
                        <li>Movement (30 min) = +15% oxygen</li>
                        <li>Focus (60 min) = +20% oxygen</li>
                    </ul>
                </div>

                <div className="info-card">
                    <h3>🎯 Custom Habits</h3>
                    <p>
                        Choose 3 custom habits to supplement your core habits.
                        Each custom habit gives +10% oxygen.
                    </p>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowCustomHabitSelector(true)}
                    >
                        Select Custom Habits
                    </button>
                </div>

                <div className="info-card">
                    <h3>📊 How It Works</h3>
                    <ul>
                        <li>No oxygen drain in Training Grounds</li>
                        <li>Complete habits daily to build oxygen</li>
                        <li>Maintain 70%+ for 3 days to unlock climbing</li>
                        <li>Max oxygen: 100%</li>
                    </ul>
                </div>
            </div>

            {showCustomHabitSelector && (
                <CustomHabitSelector
                    onClose={() => setShowCustomHabitSelector(false)}
                />
            )}

            {/* Test Controls (Dev Mode) */}
            <TestControls />
        </div>
    );
}

// Custom Habit Selector Modal Component
function CustomHabitSelector({ onClose }) {
    const [selectedCategory, setSelectedCategory] = useState('Academic');
    const [selectedHabits, setSelectedHabits] = useState([]);
    const [habitTemplates, setHabitTemplates] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHabitTemplates();
    }, []);

    async function loadHabitTemplates() {
        try {
            const api = require('../services/api').default;
            const data = await api.getHabitTemplates();
            setHabitTemplates(data);
        } catch (error) {
            console.error('Error loading habit templates:', error);
        } finally {
            setLoading(false);
        }
    }

    function toggleHabit(habitId) {
        if (selectedHabits.includes(habitId)) {
            setSelectedHabits(selectedHabits.filter(id => id !== habitId));
        } else if (selectedHabits.length < 3) {
            setSelectedHabits([...selectedHabits, habitId]);
        }
    }

    async function saveHabits() {
        if (selectedHabits.length !== 3) {
            alert('Please select exactly 3 custom habits');
            return;
        }

        try {
            const api = require('../services/api').default;
            await api.selectCustomHabits(selectedHabits);
            onClose();
        } catch (error) {
            alert('Error saving habits: ' + error.message);
        }
    }

    if (loading || !habitTemplates) {
        return <div className="modal-overlay">Loading...</div>;
    }

    const categories = habitTemplates.categories || [];
    const customHabits = habitTemplates.customHabits || {};
    const filteredHabits = Object.values(customHabits).filter(
        h => h.category === selectedCategory
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Custom Habits</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="selection-counter">
                        Selected: {selectedHabits.length}/3
                    </p>

                    <div className="category-tabs">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="habit-grid">
                        {filteredHabits.map(habit => (
                            <div
                                key={habit.id}
                                className={`habit-option ${selectedHabits.includes(habit.id) ? 'selected' : ''} ${selectedHabits.length >= 3 && !selectedHabits.includes(habit.id) ? 'disabled' : ''}`}
                                onClick={() => toggleHabit(habit.id)}
                            >
                                <div className="habit-icon">{habit.icon}</div>
                                <div className="habit-name">{habit.name}</div>
                                <div className="habit-description">{habit.description}</div>
                                <div className="habit-bonus">+{habit.oxygenBonus}% oxygen</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={saveHabits}
                        disabled={selectedHabits.length !== 3}
                    >
                        Save Habits
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TrainingGrounds;
