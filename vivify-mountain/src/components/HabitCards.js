import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import api from '../services/api';
import './HabitCards.css';

const CORE_HABITS = {
    hydration: { icon: '💧', name: 'Hydration', goal: 6, unit: 'glasses', bonus: 15 },
    sleep: { icon: '😴', name: 'Sleep', goal: 7, unit: 'hours', bonus: 20 },
    movement: { icon: '🏃', name: 'Movement', goal: 30, unit: 'minutes', bonus: 15 },
    focus: { icon: '🎯', name: 'Focus', goal: 60, unit: 'minutes', bonus: 20 }
};

function HabitCards({ isTraining }) {
    const { logHabits, mountainData, refreshData } = useGame();
    const [habits, setHabits] = useState({
        hydration: false,
        sleep: false,
        movement: false,
        focus: false,
        custom1: false,
        custom2: false,
        custom3: false
    });
    const [habitDetails, setHabitDetails] = useState({
        hydration: { glasses: 0, goal: 6 },
        sleep: { hours: 0, goal: 7 },
        movement: { minutes: 0, goal: 30 },
        focus: { minutes: 0, goal: 60 }
    });
    const [customHabits, setCustomHabits] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(null);
    const [logging, setLogging] = useState(false);
    const [todayLogged, setTodayLogged] = useState(false);

    useEffect(() => {
        loadCustomHabits();
        checkTodayLog();
    }, []);

    async function loadCustomHabits() {
        try {
            const data = await api.getHabitTemplates();
            const userCustomHabits = mountainData?.customHabits || [];

            const loadedHabits = userCustomHabits.map(habitId => {
                const habit = data.customHabits[habitId];
                return habit || null;
            }).filter(h => h);

            setCustomHabits(loadedHabits);
        } catch (error) {
            console.error('Error loading custom habits:', error);
        }
    }

    async function checkTodayLog() {
        try {
            const history = await api.getHabitHistory(1);
            if (history.logs && history.logs.length > 0) {
                const lastLog = history.logs[0];
                const lastLogDate = new Date(lastLog.date);
                const today = new Date();

                if (lastLogDate.toDateString() === today.toDateString()) {
                    setTodayLogged(true);
                }
            }
        } catch (error) {
            console.error('Error checking today log:', error);
        }
    }

    function toggleHabit(habitKey) {
        setHabits({
            ...habits,
            [habitKey]: !habits[habitKey]
        });
    }

    function updateHabitDetail(habitKey, value) {
        const detail = habitDetails[habitKey];
        const newDetail = { ...detail, [Object.keys(value)[0]]: Object.values(value)[0] };

        // Auto-check if goal is met
        const goalMet = Object.values(newDetail).some(v => typeof v === 'number' && v >= detail.goal);

        setHabitDetails({
            ...habitDetails,
            [habitKey]: newDetail
        });

        if (goalMet) {
            setHabits({
                ...habits,
                [habitKey]: true
            });
        }
    }

    async function handleLogHabits() {
        try {
            setLogging(true);
            const result = await logHabits(habits, habitDetails);

            if (result.success) {
                setTodayLogged(true);
                await refreshData();

                // Show feedback
                alert(`Habits logged! Oxygen: ${result.oxygenChange > 0 ? '+' : ''}${result.oxygenChange}%`);
            }
        } catch (error) {
            alert('Error logging habits: ' + error.message);
        } finally {
            setLogging(false);
        }
    }

    const totalCompleted = Object.values(habits).filter(h => h).length;
    const canLog = totalCompleted > 0 && !todayLogged;

    return (
        <div className="habit-cards-container">
            <div className="habit-cards-header">
                <h3>Today's Habits</h3>
                <div className="habits-progress">
                    {totalCompleted}/7 completed
                </div>
            </div>

            {todayLogged && (
                <div className="already-logged-notice">
                    ✅ Habits already logged for today! Come back tomorrow.
                </div>
            )}

            {/* Core Habits */}
            <div className="habit-cards-grid">
                {Object.entries(CORE_HABITS).map(([key, habit]) => (
                    <HabitCard
                        key={key}
                        habitKey={key}
                        habit={habit}
                        completed={habits[key]}
                        details={habitDetails[key]}
                        onToggle={() => toggleHabit(key)}
                        onOpenDetail={() => setShowDetailModal(key)}
                        disabled={todayLogged}
                    />
                ))}

                {/* Custom Habits */}
                {customHabits.map((habit, index) => (
                    <HabitCard
                        key={`custom${index + 1}`}
                        habitKey={`custom${index + 1}`}
                        habit={{
                            icon: habit.icon,
                            name: habit.name,
                            bonus: habit.oxygenBonus
                        }}
                        completed={habits[`custom${index + 1}`]}
                        onToggle={() => toggleHabit(`custom${index + 1}`)}
                        disabled={todayLogged}
                        isCustom
                    />
                ))}
            </div>

            {/* Log Button */}
            <button
                className="btn-log-habits"
                onClick={handleLogHabits}
                disabled={!canLog || logging}
            >
                {logging ? 'Logging...' : 'Log Today\'s Habits'}
            </button>

            {/* Detail Modal */}
            {showDetailModal && (
                <HabitDetailModal
                    habitKey={showDetailModal}
                    habit={CORE_HABITS[showDetailModal]}
                    details={habitDetails[showDetailModal]}
                    onUpdate={(value) => updateHabitDetail(showDetailModal, value)}
                    onClose={() => setShowDetailModal(null)}
                />
            )}
        </div>
    );
}

function HabitCard({ habitKey, habit, completed, details, onToggle, onOpenDetail, disabled, isCustom }) {
    const hasDetails = details && !isCustom;

    return (
        <div className={`habit-card ${completed ? 'completed' : ''} ${disabled ? 'disabled' : ''}`}>
            <div className="habit-card-header">
                <span className="habit-icon">{habit.icon}</span>
                <span className="habit-name">{habit.name}</span>
            </div>

            {hasDetails && (
                <div className="habit-progress-bar">
                    <div
                        className="habit-progress-fill"
                        style={{
                            width: `${Math.min(100, (Object.values(details).find(v => typeof v === 'number') || 0) / details.goal * 100)}%`
                        }}
                    />
                </div>
            )}

            <div className="habit-card-footer">
                {hasDetails ? (
                    <button
                        className="btn-detail"
                        onClick={onOpenDetail}
                        disabled={disabled}
                    >
                        Track Progress
                    </button>
                ) : (
                    <button
                        className={`btn-toggle ${completed ? 'completed' : ''}`}
                        onClick={onToggle}
                        disabled={disabled}
                    >
                        {completed ? '✓ Done' : 'Mark Done'}
                    </button>
                )}
                <span className="habit-bonus">+{habit.bonus}%</span>
            </div>
        </div>
    );
}

function HabitDetailModal({ habitKey, habit, details, onUpdate, onClose }) {
    const [value, setValue] = useState(Object.values(details).find(v => typeof v === 'number') || 0);

    function handleSave() {
        const key = habitKey === 'hydration' ? 'glasses' :
                    habitKey === 'sleep' ? 'hours' : 'minutes';
        onUpdate({ [key]: parseFloat(value) });
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content habit-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{habit.icon} {habit.name}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p>Goal: {habit.goal} {habit.unit}</p>

                    <div className="detail-input-group">
                        <label>
                            Enter {habit.unit}:
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            min="0"
                            max={habit.goal * 2}
                            step={habitKey === 'sleep' ? '0.5' : '1'}
                        />
                    </div>

                    <div className="progress-indicator">
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${Math.min(100, (value / habit.goal) * 100)}%` }}
                            />
                        </div>
                        <p>{Math.round((value / habit.goal) * 100)}% of goal</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default HabitCards;
