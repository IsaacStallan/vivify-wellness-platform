import React from 'react';
import { useGame } from '../contexts/GameContext';
import api from '../services/api';
import './TestControls.css';

function TestControls() {
    const { user, refreshData } = useGame();

    async function completeTraining() {
        try {
            const response = await fetch('http://localhost:3001/api/test/complete-training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id })
            });
            const data = await response.json();
            alert(data.message);
            await refreshData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    async function reachSummit() {
        try {
            const response = await fetch('http://localhost:3001/api/test/set-altitude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, altitude: 3776 })
            });
            const data = await response.json();
            alert(data.message);
            await refreshData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    async function resetProgress() {
        if (!window.confirm('Reset all mountain progress?')) return;
        try {
            const response = await fetch('http://localhost:3001/api/test/reset-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id })
            });
            const data = await response.json();
            alert(data.message);
            await refreshData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    return (
        <div className="test-controls">
            <div className="test-controls-header">
                🧪 Test Controls (Dev Mode)
            </div>
            <div className="test-controls-buttons">
                <button onClick={completeTraining} className="test-btn">
                    ⚡ Complete Training
                </button>
                <button onClick={reachSummit} className="test-btn">
                    🏔️ Reach Summit
                </button>
                <button onClick={resetProgress} className="test-btn reset">
                    🔄 Reset Progress
                </button>
            </div>
        </div>
    );
}

export default TestControls;
