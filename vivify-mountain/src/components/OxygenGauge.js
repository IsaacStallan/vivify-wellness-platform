import React from 'react';
import './OxygenGauge.css';

function OxygenGauge({ oxygen, size = 'medium' }) {
    const getColor = () => {
        if (oxygen >= 70) return '#4ade80'; // green
        if (oxygen >= 50) return '#fbbf24'; // yellow
        if (oxygen >= 30) return '#fb923c'; // orange
        return '#ef4444'; // red
    };

    const getStatus = () => {
        if (oxygen >= 70) return 'Normal';
        if (oxygen >= 50) return 'Slowed';
        if (oxygen >= 30) return 'High Risk';
        return 'Critical';
    };

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (oxygen / 100) * circumference;

    return (
        <div className={`oxygen-gauge oxygen-gauge-${size}`}>
            <svg className="gauge-svg" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                    className="gauge-progress"
                />
                {/* Center text */}
                <text
                    x="50"
                    y="45"
                    textAnchor="middle"
                    className="gauge-value"
                    fill={getColor()}
                >
                    {Math.round(oxygen)}%
                </text>
                <text
                    x="50"
                    y="58"
                    textAnchor="middle"
                    className="gauge-label"
                    fill="#6b7280"
                >
                    O₂
                </text>
            </svg>
            <div className="gauge-status" style={{ color: getColor() }}>
                {getStatus()}
            </div>
        </div>
    );
}

export default OxygenGauge;
