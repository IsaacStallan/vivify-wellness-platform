import React from 'react';
import './Characters.css';

// Player Character - Cartoon style climber
export function PlayerCharacter({ className = '', size = 60 }) {
    return (
        <svg className={`character-svg ${className}`} width={size} height={size} viewBox="0 0 100 100">
            {/* Head */}
            <circle cx="50" cy="30" r="18" fill="#ffc4a3" stroke="#333" strokeWidth="2"/>
            {/* Hair */}
            <ellipse cx="50" cy="22" rx="19" ry="12" fill="#5c4033"/>
            {/* Eyes */}
            <circle cx="44" cy="28" r="3" fill="#333"/>
            <circle cx="56" cy="28" r="3" fill="#333"/>
            {/* Smile */}
            <path d="M 43 35 Q 50 38 57 35" stroke="#333" strokeWidth="2" fill="none"/>

            {/* Body */}
            <rect x="38" y="45" width="24" height="30" rx="8" fill="#4a90e2" stroke="#333" strokeWidth="2"/>

            {/* Arms */}
            <rect x="25" y="48" width="15" height="10" rx="5" fill="#4a90e2" stroke="#333" strokeWidth="2"/>
            <rect x="60" y="48" width="15" height="10" rx="5" fill="#4a90e2" stroke="#333" strokeWidth="2"/>

            {/* Legs */}
            <rect x="40" y="73" width="8" height="18" rx="4" fill="#2c5f8d" stroke="#333" strokeWidth="2"/>
            <rect x="52" y="73" width="8" height="18" rx="4" fill="#2c5f8d" stroke="#333" strokeWidth="2"/>

            {/* Feet */}
            <ellipse cx="44" cy="93" rx="6" ry="4" fill="#333"/>
            <ellipse cx="56" cy="93" rx="6" ry="4" fill="#333"/>
        </svg>
    );
}

// Climbing Character - Side view with gear
export function ClimbingCharacter({ className = '', size = 60 }) {
    return (
        <svg className={`character-svg ${className}`} width={size} height={size} viewBox="0 0 100 100">
            {/* Backpack */}
            <rect x="55" y="40" width="18" height="25" rx="4" fill="#dc2626" stroke="#333" strokeWidth="2"/>

            {/* Head */}
            <circle cx="45" cy="25" r="15" fill="#ffc4a3" stroke="#333" strokeWidth="2"/>

            {/* Helmet */}
            <path d="M 30 25 Q 30 12 45 12 Q 60 12 60 25 Q 60 30 45 30 Q 30 30 30 25" fill="#f59e0b" stroke="#333" strokeWidth="2"/>

            {/* Eyes */}
            <circle cx="40" cy="24" r="2" fill="#333"/>
            <circle cx="50" cy="24" r="2" fill="#333"/>

            {/* Body */}
            <rect x="35" y="38" width="20" height="28" rx="6" fill="#4a90e2" stroke="#333" strokeWidth="2"/>

            {/* Arms - climbing position */}
            <rect x="20" y="35" width="18" height="8" rx="4" fill="#4a90e2" stroke="#333" strokeWidth="2" transform="rotate(-30 29 39)"/>
            <rect x="50" y="42" width="18" height="8" rx="4" fill="#4a90e2" stroke="#333" strokeWidth="2" transform="rotate(20 59 46)"/>

            {/* Legs - climbing position */}
            <rect x="32" y="63" width="10" height="20" rx="5" fill="#2c5f8d" stroke="#333" strokeWidth="2" transform="rotate(-10 37 73)"/>
            <rect x="45" y="63" width="10" height="20" rx="5" fill="#2c5f8d" stroke="#333" strokeWidth="2" transform="rotate(15 50 73)"/>

            {/* Climbing rope */}
            <path d="M 30 35 Q 25 20 20 5" stroke="#f59e0b" strokeWidth="3" fill="none"/>
        </svg>
    );
}

// NPC Trainer
export function TrainerCharacter({ className = '', size = 60 }) {
    return (
        <svg className={`character-svg ${className}`} width={size} height={size} viewBox="0 0 100 100">
            {/* Head */}
            <circle cx="50" cy="28" r="16" fill="#ffdbac" stroke="#333" strokeWidth="2"/>

            {/* Hair/Cap */}
            <ellipse cx="50" cy="20" rx="18" ry="10" fill="#dc2626"/>
            <rect x="35" y="18" width="30" height="8" fill="#dc2626"/>
            <ellipse cx="50" cy="18" rx="8" ry="3" fill="#fff"/>

            {/* Eyes */}
            <circle cx="44" cy="27" r="2.5" fill="#333"/>
            <circle cx="56" cy="27" r="2.5" fill="#333"/>

            {/* Smile */}
            <path d="M 42 33 Q 50 36 58 33" stroke="#333" strokeWidth="2" fill="none"/>

            {/* Whistle */}
            <circle cx="62" cy="33" r="3" fill="#fbbf24" stroke="#333" strokeWidth="1"/>

            {/* Body - Coach shirt */}
            <rect x="38" y="42" width="24" height="28" rx="8" fill="#fff" stroke="#333" strokeWidth="2"/>
            <text x="50" y="60" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="#dc2626" textAnchor="middle">C</text>

            {/* Arms */}
            <rect x="26" y="45" width="14" height="9" rx="4" fill="#ffdbac" stroke="#333" strokeWidth="2"/>
            <rect x="60" y="45" width="14" height="9" rx="4" fill="#ffdbac" stroke="#333" strokeWidth="2"/>

            {/* Legs */}
            <rect x="41" y="68" width="7" height="20" rx="3" fill="#2c5f8d" stroke="#333" strokeWidth="2"/>
            <rect x="52" y="68" width="7" height="20" rx="3" fill="#2c5f8d" stroke="#333" strokeWidth="2"/>

            {/* Shoes */}
            <ellipse cx="44" cy="90" rx="5" ry="3" fill="#333"/>
            <ellipse cx="55" cy="90" rx="5" ry="3" fill="#333"/>
        </svg>
    );
}

// Equipment Icons
export function DumbbellIcon({ size = 60 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <rect x="10" y="35" width="12" height="30" rx="4" fill="#4b5563" stroke="#333" strokeWidth="2"/>
            <rect x="78" y="35" width="12" height="30" rx="4" fill="#4b5563" stroke="#333" strokeWidth="2"/>
            <rect x="22" y="47" width="56" height="6" fill="#6b7280" stroke="#333" strokeWidth="2"/>
            <circle cx="16" cy="40" r="5" fill="#dc2626"/>
            <circle cx="16" cy="60" r="5" fill="#dc2626"/>
            <circle cx="84" cy="40" r="5" fill="#dc2626"/>
            <circle cx="84" cy="60" r="5" fill="#dc2626"/>
        </svg>
    );
}

export function YogaMatIcon({ size = 60 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <rect x="20" y="30" width="60" height="50" rx="8" fill="#9333ea" stroke="#333" strokeWidth="2"/>
            <rect x="25" y="35" width="50" height="40" rx="6" fill="#a855f7" stroke="none"/>
            <line x1="30" y1="40" x2="30" y2="70" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="40" y1="40" x2="40" y2="70" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="50" y1="40" x2="50" y2="70" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="60" y1="40" x2="60" y2="70" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="70" y1="40" x2="70" y2="70" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
        </svg>
    );
}

export function WaterBottleIcon({ size = 60 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            {/* Bottle body */}
            <path d="M 35 30 L 35 75 Q 35 85 45 85 L 55 85 Q 65 85 65 75 L 65 30 Z" fill="#60a5fa" stroke="#333" strokeWidth="2"/>
            {/* Water level */}
            <path d="M 37 50 L 37 75 Q 37 83 45 83 L 55 83 Q 63 83 63 75 L 63 50 Z" fill="#3b82f6" opacity="0.7"/>
            {/* Cap */}
            <rect x="40" y="20" width="20" height="12" rx="3" fill="#1e40af" stroke="#333" strokeWidth="2"/>
            {/* Highlight */}
            <ellipse cx="42" cy="40" rx="4" ry="8" fill="#fff" opacity="0.5"/>
        </svg>
    );
}

export function BedIcon({ size = 80 }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 120 80">
            {/* Bed frame */}
            <rect x="10" y="35" width="100" height="25" rx="4" fill="#8b4513" stroke="#333" strokeWidth="2"/>
            {/* Mattress */}
            <rect x="15" y="28" width="90" height="15" rx="4" fill="#ec4899" stroke="#333" strokeWidth="2"/>
            {/* Pillow */}
            <rect x="75" y="20" width="25" height="12" rx="3" fill="#fce7f3" stroke="#333" strokeWidth="2"/>
            {/* Blanket pattern */}
            <rect x="20" y="30" width="50" height="10" fill="#db2777" opacity="0.5"/>
            {/* Bed legs */}
            <rect x="15" y="58" width="6" height="15" fill="#654321" stroke="#333" strokeWidth="1"/>
            <rect x="99" y="58" width="6" height="15" fill="#654321" stroke="#333" strokeWidth="1"/>
        </svg>
    );
}

// Mountain Peak
export function MountainPeak({ type = 'snow', size = 60 }) {
    const colors = {
        snow: { base: '#e5e7eb', mid: '#d1d5db', peak: '#ffffff' },
        rock: { base: '#78716c', mid: '#57534e', peak: '#a8a29e' },
        volcano: { base: '#7c2d12', mid: '#991b1b', peak: '#44403c' }
    };

    const c = colors[type] || colors.snow;

    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            {/* Mountain base */}
            <path d="M 10 90 L 50 20 L 90 90 Z" fill={c.base} stroke="#333" strokeWidth="2"/>
            {/* Mountain mid section */}
            <path d="M 25 90 L 50 40 L 75 90 Z" fill={c.mid}/>
            {/* Snow cap */}
            <path d="M 40 55 L 50 35 L 60 55 Z" fill={c.peak}/>
            {/* Shadows */}
            <path d="M 50 20 L 90 90 L 75 90 Z" fill="#000" opacity="0.1"/>
        </svg>
    );
}
