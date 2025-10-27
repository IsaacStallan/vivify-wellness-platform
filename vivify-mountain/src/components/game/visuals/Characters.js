import React from 'react';
import './Characters.css';

// Player Character - Detailed cartoon style
export function PlayerCharacter({ className = '', size = 60 }) {
    return (
        <svg className={`character-svg ${className}`} width={size} height={size} viewBox="0 0 100 120">
            {/* Shadow */}
            <ellipse cx="50" cy="112" rx="20" ry="6" fill="#000" opacity="0.2"/>

            {/* Legs */}
            <path d="M 42 70 L 40 95 L 38 110 L 44 110 L 46 95 L 48 70 Z" fill="#2c5f8d" stroke="#1e3a5f" strokeWidth="1.5"/>
            <path d="M 52 70 L 54 95 L 56 110 L 62 110 L 60 95 L 58 70 Z" fill="#2c5f8d" stroke="#1e3a5f" strokeWidth="1.5"/>

            {/* Shoes */}
            <ellipse cx="41" cy="110" rx="7" ry="5" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
            <ellipse cx="59" cy="110" rx="7" ry="5" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
            <ellipse cx="39" cy="110" rx="3" ry="2" fill="#fff" opacity="0.3"/>

            {/* Body - Jacket */}
            <path d="M 35 45 Q 35 38 40 36 L 42 40 L 50 38 L 58 40 L 60 36 Q 65 38 65 45 L 65 70 Q 65 73 62 73 L 38 73 Q 35 73 35 70 Z"
                  fill="#4a90e2" stroke="#2c5f8d" strokeWidth="2"/>

            {/* Jacket details */}
            <line x1="50" y1="40" x2="50" y2="73" stroke="#2c5f8d" strokeWidth="2"/>
            <circle cx="44" cy="50" r="2" fill="#1e3a5f"/>
            <circle cx="56" cy="50" r="2" fill="#1e3a5f"/>
            <circle cx="44" cy="58" r="2" fill="#1e3a5f"/>
            <circle cx="56" cy="58" r="2" fill="#1e3a5f"/>

            {/* Collar */}
            <path d="M 40 36 L 45 42 L 50 38 L 55 42 L 60 36" fill="none" stroke="#fff" strokeWidth="1.5"/>

            {/* Arms */}
            <path d="M 35 45 Q 30 47 28 55 L 26 62 Q 25 65 28 66 L 32 64 Q 34 63 35 60 L 37 50 Z"
                  fill="#4a90e2" stroke="#2c5f8d" strokeWidth="1.5"/>
            <path d="M 65 45 Q 70 47 72 55 L 74 62 Q 75 65 72 66 L 68 64 Q 66 63 65 60 L 63 50 Z"
                  fill="#4a90e2" stroke="#2c5f8d" strokeWidth="1.5"/>

            {/* Hands */}
            <circle cx="28" cy="66" r="4" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1"/>
            <circle cx="72" cy="66" r="4" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1"/>

            {/* Neck */}
            <rect x="45" y="33" width="10" height="5" fill="#ffc4a3"/>

            {/* Head */}
            <ellipse cx="50" cy="25" rx="15" ry="18" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="2"/>

            {/* Ears */}
            <ellipse cx="36" cy="25" rx="3" ry="4" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1"/>
            <ellipse cx="64" cy="25" rx="3" ry="4" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1"/>

            {/* Hair */}
            <path d="M 35 18 Q 35 8 50 8 Q 65 8 65 18 Q 66 22 65 25 L 35 25 Q 34 22 35 18 Z"
                  fill="#5c4033" stroke="#3d2a1f" strokeWidth="1.5"/>
            <path d="M 38 10 Q 40 12 42 11 Q 44 14 46 12 Q 48 15 50 13 Q 52 16 54 13 Q 56 15 58 12 Q 60 14 62 11"
                  stroke="#3d2a1f" strokeWidth="1.5" fill="none"/>

            {/* Eyes */}
            <ellipse cx="42" cy="24" rx="3" ry="4" fill="#fff"/>
            <ellipse cx="58" cy="24" rx="3" ry="4" fill="#fff"/>
            <circle cx="43" cy="25" r="2" fill="#2c3e50"/>
            <circle cx="59" cy="25" r="2" fill="#2c3e50"/>
            <circle cx="43.5" cy="24" r="0.8" fill="#fff"/>
            <circle cx="59.5" cy="24" r="0.8" fill="#fff"/>

            {/* Eyebrows */}
            <path d="M 38 20 Q 42 19 46 20" stroke="#3d2a1f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M 54 20 Q 58 19 62 20" stroke="#3d2a1f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

            {/* Nose */}
            <path d="M 50 28 L 48 31 Q 50 32 52 31 Z" fill="#e09a7a"/>

            {/* Smile */}
            <path d="M 42 34 Q 50 38 58 34" stroke="#d4735e" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M 44 34 Q 50 36 56 34" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.6"/>

            {/* Backpack straps */}
            <path d="M 42 40 Q 40 50 40 60" stroke="#8b4513" strokeWidth="3" fill="none"/>
            <path d="M 58 40 Q 60 50 60 60" stroke="#8b4513" strokeWidth="3" fill="none"/>
        </svg>
    );
}

// Climbing Character - Professional climber with detailed gear
export function ClimbingCharacter({ className = '', size = 60 }) {
    return (
        <svg className={`character-svg climbing-animation ${className}`} width={size} height={size * 1.1} viewBox="0 0 100 110">
            {/* Shadow */}
            <ellipse cx="50" cy="105" rx="18" ry="5" fill="#000" opacity="0.2"/>

            {/* Rope */}
            <path d="M 35 10 Q 33 25 35 40" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="4,2"/>
            <circle cx="35" cy="42" r="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>

            {/* Backpack */}
            <path d="M 52 35 L 52 60 Q 52 65 57 65 L 68 65 Q 73 65 73 60 L 73 40 Q 73 35 68 35 Z"
                  fill="#dc2626" stroke="#991b1b" strokeWidth="2"/>
            <rect x="55" y="40" width="15" height="8" fill="#b91c1c"/>
            <path d="M 60 38 Q 62 33 64 38" stroke="#991b1b" strokeWidth="2" fill="none"/>
            <circle cx="58" cy="50" r="1.5" fill="#fbbf24"/>
            <circle cx="67" cy="50" r="1.5" fill="#fbbf24"/>

            {/* Helmet */}
            <path d="M 30 20 Q 28 14 35 12 L 45 12 Q 52 12 54 16 Q 56 20 54 24 L 50 28 L 35 28 Q 32 26 30 20 Z"
                  fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
            <ellipse cx="42" cy="15" rx="8" ry="3" fill="#fbbf24" opacity="0.5"/>
            <circle cx="52" cy="18" r="2" fill="#dc2626"/>

            {/* Head */}
            <ellipse cx="42" cy="25" rx="12" ry="13" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1.5"/>

            {/* Goggles */}
            <ellipse cx="38" cy="24" rx="4" ry="3" fill="#1e3a5f" stroke="#000" strokeWidth="1"/>
            <ellipse cx="46" cy="24" rx="4" ry="3" fill="#1e3a5f" stroke="#000" strokeWidth="1"/>
            <path d="M 34 24 L 32 24" stroke="#333" strokeWidth="2"/>
            <path d="M 42 24 L 46 24" stroke="#333" strokeWidth="1.5"/>
            <ellipse cx="37" cy="23" rx="1" ry="1.5" fill="#60a5fa" opacity="0.5"/>

            {/* Scarf/Neck warmer */}
            <path d="M 35 30 L 32 33 Q 42 36 52 33 L 49 30 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>

            {/* Body - Climbing jacket */}
            <path d="M 32 33 L 30 45 L 28 62 Q 28 66 32 67 L 48 67 Q 52 67 52 62 L 52 40 L 52 33 Z"
                  fill="#4a90e2" stroke="#2c5f8d" strokeWidth="2"/>

            {/* Jacket details */}
            <path d="M 42 35 L 42 67" stroke="#2c5f8d" strokeWidth="1.5"/>
            <circle cx="36" cy="45" r="1.5" fill="#1e3a5f"/>
            <circle cx="36" cy="52" r="1.5" fill="#1e3a5f"/>
            <circle cx="36" cy="59" r="1.5" fill="#1e3a5f"/>
            <path d="M 32 38 L 38 38 L 38 42 L 32 42 Z" fill="#dc2626"/>

            {/* Climbing arm (reaching up) */}
            <path d="M 32 35 Q 25 32 22 25 L 20 18 Q 19 15 21 14 L 25 15 Q 27 16 28 19 L 30 28 Z"
                  fill="#4a90e2" stroke="#2c5f8d" strokeWidth="1.5"/>
            <path d="M 21 14 L 18 12 Q 16 10 17 8 L 20 7 Q 22 7 23 9 Z" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1"/>

            {/* Glove details */}
            <rect x="17" y="7" width="5" height="2" fill="#1a1a1a" rx="1"/>

            {/* Other arm */}
            <path d="M 52 40 Q 56 42 58 48 L 60 56 Q 61 59 58 60 L 54 58 Q 52 57 52 54 Z"
                  fill="#4a90e2" stroke="#2c5f8d" strokeWidth="1.5"/>
            <circle cx="58" cy="60" r="3" fill="#ffc4a3" stroke="#e09a7a" strokeWidth="1"/>

            {/* Climbing harness */}
            <ellipse cx="40" cy="67" rx="12" ry="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
            <circle cx="35" cy="67" r="2" fill="#dc2626"/>
            <circle cx="45" cy="67" r="2" fill="#dc2626"/>

            {/* Legs */}
            <path d="M 35 68 L 33 85 L 30 100 L 36 100 L 38 85 L 40 68 Z" fill="#2c5f8d" stroke="#1e3a5f" strokeWidth="1.5"/>
            <path d="M 43 68 L 46 85 L 50 100 L 56 100 L 52 85 L 48 68 Z" fill="#2c5f8d" stroke="#1e3a5f" strokeWidth="1.5"/>

            {/* Climbing boots */}
            <path d="M 30 98 L 28 100 Q 28 103 32 105 L 38 105 Q 40 104 40 100 L 38 98 Z"
                  fill="#1a1a1a" stroke="#000" strokeWidth="1.5"/>
            <path d="M 50 98 L 48 100 Q 48 103 52 105 L 58 105 Q 60 104 60 100 L 58 98 Z"
                  fill="#1a1a1a" stroke="#000" strokeWidth="1.5"/>
            <rect x="30" y="99" width="8" height="3" fill="#dc2626"/>
            <rect x="50" y="99" width="8" height="3" fill="#dc2626"/>

            {/* Carabiner */}
            <ellipse cx="45" cy="67" rx="3" ry="4" fill="none" stroke="#9ca3af" strokeWidth="1.5"/>
            <rect x="44" y="63" width="2" height="2" fill="#dc2626"/>
        </svg>
    );
}

// NPC Trainer - Professional coach with detailed design
export function TrainerCharacter({ className = '', size = 60 }) {
    return (
        <svg className={`character-svg ${className}`} width={size} height={size * 1.15} viewBox="0 0 100 115">
            {/* Shadow */}
            <ellipse cx="50" cy="110" rx="22" ry="6" fill="#000" opacity="0.2"/>

            {/* Legs */}
            <path d="M 40 70 L 38 95 L 36 108 L 43 108 L 45 95 L 47 70 Z" fill="#2c5f8d" stroke="#1e3a5f" strokeWidth="1.5"/>
            <path d="M 53 70 L 55 95 L 57 108 L 64 108 L 62 95 L 60 70 Z" fill="#2c5f8d" stroke="#1e3a5f" strokeWidth="1.5"/>

            {/* Sneakers - Coach style */}
            <path d="M 34 106 L 32 108 Q 32 111 38 112 L 45 112 Q 48 111 48 108 L 46 106 Z"
                  fill="#fff" stroke="#ddd" strokeWidth="2"/>
            <path d="M 55 106 L 53 108 Q 53 111 59 112 L 66 112 Q 69 111 69 108 L 67 106 Z"
                  fill="#fff" stroke="#ddd" strokeWidth="2"/>
            <path d="M 35 107 L 44 107" stroke="#dc2626" strokeWidth="2"/>
            <path d="M 56 107 L 65 107" stroke="#dc2626" strokeWidth="2"/>

            {/* Body - Coach polo shirt */}
            <path d="M 35 40 Q 34 36 38 34 L 42 38 L 50 36 L 58 38 L 62 34 Q 66 36 65 40 L 68 70 Q 68 73 65 73 L 35 73 Q 32 73 32 70 Z"
                  fill="#fff" stroke="#ddd" strokeWidth="2"/>

            {/* Polo collar */}
            <path d="M 38 34 L 42 42 L 50 38 L 58 42 L 62 34" fill="#dc2626"/>
            <path d="M 45 38 L 47 48" stroke="#ddd" strokeWidth="2"/>

            {/* Coach logo "C" */}
            <circle cx="50" cy="55" r="12" fill="none" stroke="#dc2626" strokeWidth="2"/>
            <text x="50" y="62" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#dc2626" textAnchor="middle">C</text>

            {/* Polo buttons */}
            <circle cx="47" cy="42" r="1.5" fill="#dc2626"/>
            <circle cx="47" cy="46" r="1.5" fill="#dc2626"/>

            {/* Clipboard in hand */}
            <rect x="22" y="58" width="12" height="16" rx="1" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
            <rect x="23" y="59" width="10" height="14" fill="#fff" stroke="#ddd" strokeWidth="0.5"/>
            <line x1="24" y1="62" x2="32" y2="62" stroke="#333" strokeWidth="0.5"/>
            <line x1="24" y1="65" x2="32" y2="65" stroke="#333" strokeWidth="0.5"/>
            <line x1="24" y1="68" x2="30" y2="68" stroke="#333" strokeWidth="0.5"/>
            <circle cx="28" cy="57" r="1" fill="#9ca3af"/>

            {/* Arms */}
            <path d="M 35 42 Q 28 44 24 52 L 22 60 Q 21 63 24 64 L 28 62 Q 30 61 31 58 L 34 48 Z"
                  fill="#ffdbac" stroke="#e09a7a" strokeWidth="1.5"/>
            <path d="M 65 42 Q 72 44 76 52 L 78 60 Q 79 63 76 64 L 72 62 Q 70 61 69 58 L 66 48 Z"
                  fill="#ffdbac" stroke="#e09a7a" strokeWidth="1.5"/>

            {/* Whistle */}
            <circle cx="76" cy="64" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
            <rect x="75" y="62" width="2" height="2" fill="#333"/>
            <path d="M 76 64 L 72 62" stroke="#333" strokeWidth="1"/>

            {/* Hands */}
            <ellipse cx="24" cy="64" rx="4" ry="5" fill="#ffdbac" stroke="#e09a7a" strokeWidth="1"/>
            <ellipse cx="76" cy="64" rx="4" ry="5" fill="#ffdbac" stroke="#e09a7a" strokeWidth="1"/>

            {/* Neck */}
            <rect x="45" y="30" width="10" height="6" fill="#ffdbac"/>

            {/* Head */}
            <ellipse cx="50" cy="22" rx="14" ry="16" fill="#ffdbac" stroke="#e09a7a" strokeWidth="2"/>

            {/* Ears */}
            <ellipse cx="37" cy="22" rx="3" ry="4" fill="#ffdbac" stroke="#e09a7a" strokeWidth="1"/>
            <ellipse cx="63" cy="22" rx="3" ry="4" fill="#ffdbac" stroke="#e09a7a" strokeWidth="1"/>
            <circle cx="37" cy="22" r="1" fill="#e09a7a"/>
            <circle cx="63" cy="22" r="1" fill="#e09a7a"/>

            {/* Baseball cap */}
            <ellipse cx="50" cy="14" rx="16" ry="7" fill="#dc2626"/>
            <path d="M 34 14 Q 34 8 50 8 Q 66 8 66 14" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5"/>
            <ellipse cx="50" cy="10" rx="10" ry="3" fill="#fff" opacity="0.3"/>
            <path d="M 30 14 L 20 16 Q 18 16 18 18 L 20 20 Q 22 20 24 19 L 34 16 Z"
                  fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>

            {/* Eyes */}
            <ellipse cx="43" cy="21" rx="3" ry="3.5" fill="#fff"/>
            <ellipse cx="57" cy="21" rx="3" ry="3.5" fill="#fff"/>
            <circle cx="43.5" cy="22" r="2" fill="#2c3e50"/>
            <circle cx="57.5" cy="22" r="2" fill="#2c3e50"/>
            <circle cx="44" cy="21" r="0.8" fill="#fff"/>
            <circle cx="58" cy="21" r="0.8" fill="#fff"/>

            {/* Friendly smile */}
            <path d="M 42 29 Q 50 33 58 29" stroke="#d4735e" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M 44 29 Q 50 31 56 29" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.6"/>

            {/* Nose */}
            <path d="M 50 25 L 48 28 Q 50 29 52 28 Z" fill="#e09a7a"/>
        </svg>
    );
}

// Add more detailed equipment and environment pieces...

// Detailed Dumbbell with metallic shine
export function DumbbellIcon({ size = 60 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
                <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#6b7280', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#4b5563', stopOpacity: 1}} />
                </linearGradient>
                <radialGradient id="weightGradient">
                    <stop offset="0%" style={{stopColor: '#3f3f3f', stopOpacity: 1}} />
                    <stop offset="70%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#000', stopOpacity: 1}} />
                </radialGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="50" cy="85" rx="35" ry="8" fill="#000" opacity="0.2"/>

            {/* Left weight */}
            <ellipse cx="20" cy="50" rx="15" ry="25" fill="url(#weightGradient)" stroke="#000" strokeWidth="2"/>
            <ellipse cx="18" cy="45" rx="10" ry="18" fill="#2c2c2c" opacity="0.5"/>
            <ellipse cx="22" cy="48" rx="3" ry="8" fill="#666" opacity="0.3"/>

            {/* Left handle section */}
            <rect x="32" y="45" width="8" height="10" rx="2" fill="url(#metalGradient)" stroke="#4b5563" strokeWidth="1"/>
            <rect x="33" y="46" width="6" height="2" fill="#d1d5db" opacity="0.5"/>

            {/* Center grip */}
            <rect x="38" y="42" width="24" height="16" rx="4" fill="#6b7280" stroke="#4b5563" strokeWidth="2"/>
            {/* Grip texture */}
            <line x1="42" y1="44" x2="42" y2="56" stroke="#4b5563" strokeWidth="1"/>
            <line x1="46" y1="44" x2="46" y2="56" stroke="#4b5563" strokeWidth="1"/>
            <line x1="50" y1="44" x2="50" y2="56" stroke="#4b5563" strokeWidth="1"/>
            <line x1="54" y1="44" x2="54" y2="56" stroke="#4b5563" strokeWidth="1"/>
            <line x1="58" y1="44" x2="58" y2="56" stroke="#4b5563" strokeWidth="1"/>
            {/* Highlight */}
            <rect x="40" y="43" width="18" height="4" rx="2" fill="#9ca3af" opacity="0.4"/>

            {/* Right handle section */}
            <rect x="60" y="45" width="8" height="10" rx="2" fill="url(#metalGradient)" stroke="#4b5563" strokeWidth="1"/>
            <rect x="61" y="46" width="6" height="2" fill="#d1d5db" opacity="0.5"/>

            {/* Right weight */}
            <ellipse cx="80" cy="50" rx="15" ry="25" fill="url(#weightGradient)" stroke="#000" strokeWidth="2"/>
            <ellipse cx="78" cy="45" rx="10" ry="18" fill="#2c2c2c" opacity="0.5"/>
            <ellipse cx="82" cy="48" rx="3" ry="8" fill="#666" opacity="0.3"/>

            {/* Weight plates indicators */}
            <circle cx="20" cy="40" r="2" fill="#dc2626"/>
            <circle cx="20" cy="60" r="2" fill="#dc2626"/>
            <circle cx="80" cy="40" r="2" fill="#dc2626"/>
            <circle cx="80" cy="60" r="2" fill="#dc2626"/>
        </svg>
    );
}

// Detailed Yoga Mat rolled and unrolled
export function YogaMatIcon({ size = 60 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            {/* Shadow */}
            <ellipse cx="50" cy="85" rx="35" ry="6" fill="#000" opacity="0.2"/>

            {/* Mat rolled section */}
            <ellipse cx="25" cy="65" rx="10" ry="22" fill="#7c3aed" stroke="#6d28d9" strokeWidth="2"/>
            <ellipse cx="23" cy="65" rx="8" ry="20" fill="#8b5cf6"/>

            {/* Mat roll rings */}
            <ellipse cx="25" cy="50" rx="10" ry="3" fill="#6d28d9"/>
            <ellipse cx="25" cy="58" rx="10" ry="3" fill="#6d28d9"/>
            <ellipse cx="25" cy="66" rx="10" ry="3" fill="#6d28d9"/>
            <ellipse cx="25" cy="74" rx="10" ry="3" fill="#6d28d9"/>
            <ellipse cx="25" cy="82" rx="10" ry="3" fill="#6d28d9"/>

            {/* Unrolled mat section */}
            <path d="M 35 45 L 85 30 L 85 78 L 35 85 Z" fill="#9333ea" stroke="#7c3aed" strokeWidth="2"/>
            <path d="M 37 47 L 83 32 L 83 76 L 37 83 Z" fill="#a855f7" opacity="0.7"/>

            {/* Mat texture lines */}
            <line x1="40" y1="50" x2="80" y2="37" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="40" y1="58" x2="80" y2="45" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="40" y1="66" x2="80" y2="53" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="40" y1="74" x2="80" y2="61" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <line x1="37" y1="82" x2="77" y2="69" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>

            {/* Highlight on mat */}
            <path d="M 38 48 L 70 37 L 70 45 L 38 56 Z" fill="#fff" opacity="0.2"/>

            {/* Strap */}
            <rect x="20" y="63" width="10" height="4" fill="#1f2937" rx="2"/>
            <rect x="21" y="64" width="8" height="2" fill="#374151"/>
        </svg>
    );
}

// Detailed Water Bottle with water and reflections
export function WaterBottleIcon({ size = 60 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 0.9}} />
                    <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#93c5fd', stopOpacity: 0.4}} />
                    <stop offset="50%" style={{stopColor: '#3b82f6', stopOpacity: 0.6}} />
                    <stop offset="100%" style={{stopColor: '#93c5fd', stopOpacity: 0.3}} />
                </linearGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="50" cy="90" rx="20" ry="5" fill="#000" opacity="0.2"/>

            {/* Bottle body */}
            <path d="M 37 30 L 35 82 Q 35 88 42 88 L 58 88 Q 65 88 65 82 L 63 30 Z"
                  fill="url(#bottleGradient)" stroke="#2563eb" strokeWidth="2.5"/>

            {/* Water inside */}
            <path d="M 37.5 55 L 35.5 81 Q 35.5 86.5 42 86.5 L 58 86.5 Q 64.5 86.5 64.5 81 L 62.5 55 Z"
                  fill="url(#waterGradient)"/>

            {/* Water surface animation */}
            <path d="M 37.5 55 Q 43 53 50 55 Q 57 57 62.5 55"
                  stroke="#3b82f6" strokeWidth="1.5" fill="none"/>

            {/* Bottle highlight (glass shine) */}
            <ellipse cx="42" cy="45" rx="5" ry="18" fill="#fff" opacity="0.5"/>
            <ellipse cx="40" cy="40" rx="3" ry="10" fill="#fff" opacity="0.7"/>

            {/* Measurement marks */}
            <line x1="58" y1="60" x2="62" y2="60" stroke="#2563eb" strokeWidth="1"/>
            <text x="64" y="62" fontSize="4" fill="#1e40af">500ml</text>
            <line x1="58" y1="70" x2="62" y2="70" stroke="#2563eb" strokeWidth="1"/>
            <text x="64" y="72" fontSize="4" fill="#1e40af">250ml</text>

            {/* Cap */}
            <rect x="42" y="18" width="16" height="14" rx="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2"/>
            <rect x="44" y="20" width="12" height="10" rx="2" fill="#2563eb"/>
            <ellipse cx="50" cy="22" rx="4" ry="2" fill="#60a5fa" opacity="0.6"/>

            {/* Cap ridges */}
            <line x1="44" y1="23" x2="56" y2="23" stroke="#1e3a8a" strokeWidth="0.5"/>
            <line x1="44" y1="26" x2="56" y2="26" stroke="#1e3a8a" strokeWidth="0.5"/>
            <line x1="44" y1="29" x2="56" y2="29" stroke="#1e3a8a" strokeWidth="0.5"/>

            {/* Label */}
            <rect x="40" y="40" width="20" height="12" rx="2" fill="#fff" opacity="0.8"/>
            <text x="50" y="48" fontSize="5" fill="#1e40af" textAnchor="middle" fontWeight="bold">H₂O</text>
        </svg>
    );
}

// Detailed Bed with bedding and pillows
export function BedIcon({ size = 80 }) {
    return (
        <svg width={size} height={size * 0.7} viewBox="0 0 140 100">
            <defs>
                <linearGradient id="blanketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#f472b6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
                </linearGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="70" cy="92" rx="50" ry="6" fill="#000" opacity="0.2"/>

            {/* Bed legs */}
            <rect x="20" y="75" width="8" height="20" rx="2" fill="#654321" stroke="#4a2a0f" strokeWidth="1.5"/>
            <rect x="112" y="75" width="8" height="20" rx="2" fill="#654321" stroke="#4a2a0f" strokeWidth="1.5"/>
            <rect x="20" y="75" width="8" height="6" rx="1" fill="#8b4513"/>
            <rect x="112" y="75" width="8" height="6" rx="1" fill="#8b4513"/>

            {/* Bed frame */}
            <rect x="15" y="60" width="110" height="18" rx="4" fill="#8b4513" stroke="#654321" strokeWidth="2"/>
            <rect x="17" y="62" width="106" height="6" fill="#a0522d"/>

            {/* Mattress */}
            <path d="M 18 48 L 18 63 L 122 63 L 122 48 Q 120 45 115 45 L 25 45 Q 20 45 18 48 Z"
                  fill="#f8f8f8" stroke="#ddd" strokeWidth="2"/>

            {/* Mattress quilting pattern */}
            <line x1="30" y1="48" x2="30" y2="63" stroke="#ddd" strokeWidth="1"/>
            <line x1="50" y1="48" x2="50" y2="63" stroke="#ddd" strokeWidth="1"/>
            <line x1="70" y1="48" x2="70" y2="63" stroke="#ddd" strokeWidth="1"/>
            <line x1="90" y1="48" x2="90" y2="63" stroke="#ddd" strokeWidth="1"/>
            <line x1="110" y1="48" x2="110" y2="63" stroke="#ddd" strokeWidth="1"/>

            {/* Mattress side */}
            <rect x="18" y="54" width="104" height="3" fill="#e0e0e0"/>

            {/* Pillows */}
            <ellipse cx="95" cy="40" rx="18" ry="12" fill="#fce7f3" stroke="#fbcfe8" strokeWidth="2"/>
            <ellipse cx="92" cy="37" rx="15" ry="10" fill="#fff" opacity="0.6"/>
            <ellipse cx="115" cy="35" rx="16" ry="11" fill="#fce7f3" stroke="#fbcfe8" strokeWidth="2"/>
            <ellipse cx="112" cy="32" rx="13" ry="9" fill="#fff" opacity="0.6"/>

            {/* Blanket/Duvet */}
            <path d="M 20 50 Q 25 35 40 32 L 85 30 Q 90 30 90 38 L 90 58 L 20 62 Z"
                  fill="url(#blanketGradient)" stroke="#db2777" strokeWidth="2"/>
            <path d="M 22 52 Q 27 40 38 37 L 80 35 Q 83 35 83 40 L 83 56 L 22 59 Z"
                  fill="#f9a8d4" opacity="0.4"/>

            {/* Blanket fold */}
            <path d="M 40 32 Q 45 28 50 27 L 75 25 Q 78 28 80 30"
                  fill="none" stroke="#db2777" strokeWidth="1.5"/>

            {/* Blanket pattern */}
            <circle cx="35" cy="48" r="2" fill="#db2777" opacity="0.4"/>
            <circle cx="50" cy="45" r="2" fill="#db2777" opacity="0.4"/>
            <circle cx="65" cy="43" r="2" fill="#db2777" opacity="0.4"/>
            <circle cx="42" cy="55" r="2" fill="#db2777" opacity="0.4"/>
            <circle cx="58" cy="52" r="2" fill="#db2777" opacity="0.4"/>
        </svg>
    );
}

// Mountain Peak with detailed rock faces and snow
export function MountainPeak({ type = 'snow', size = 60 }) {
    const configs = {
        snow: {
            base: '#8b8b8b',
            mid: '#b0b0b0',
            peak: '#ffffff',
            shadow: '#6b6b6b',
            snow: '#f0f9ff'
        },
        rock: {
            base: '#78716c',
            mid: '#9c8b7c',
            peak: '#a8a29e',
            shadow: '#57534e',
            snow: '#e5e7eb'
        },
        volcano: {
            base: '#7c2d12',
            mid: '#92400e',
            peak: '#78350f',
            shadow: '#451a03',
            snow: '#fef3c7'
        }
    };

    const c = configs[type] || configs.snow;

    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
                <linearGradient id={`mountainGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: c.mid, stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: c.base, stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: c.shadow, stopOpacity: 1}} />
                </linearGradient>
                <filter id="rockTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
                    <feColorMatrix type="saturate" values="0.3"/>
                </filter>
            </defs>

            {/* Mountain shadow */}
            <ellipse cx="50" cy="95" rx="40" ry="4" fill="#000" opacity="0.2"/>

            {/* Main mountain body */}
            <path d="M 10 92 L 50 15 L 90 92 Z"
                  fill={`url(#mountainGrad-${type})`}
                  stroke={c.shadow}
                  strokeWidth="2"/>

            {/* Rock face details - left side */}
            <path d="M 20 85 L 35 55 L 25 70 Z" fill={c.shadow} opacity="0.4"/>
            <path d="M 28 75 L 40 50 L 32 65 Z" fill={c.shadow} opacity="0.3"/>
            <path d="M 35 68 L 45 45 L 38 60 Z" fill={c.shadow} opacity="0.3"/>

            {/* Rock face details - right side */}
            <path d="M 80 85 L 65 55 L 75 70 Z" fill={c.shadow} opacity="0.5"/>
            <path d="M 72 75 L 60 50 L 68 65 Z" fill={c.shadow} opacity="0.4"/>
            <path d="M 65 68 L 55 45 L 62 60 Z" fill={c.shadow} opacity="0.4"/>

            {/* Rock texture overlay */}
            <path d="M 15 90 L 50 20 L 85 90 Z"
                  fill={c.base}
                  opacity="0.3"
                  filter="url(#rockTexture)"/>

            {/* Snow cap */}
            <path d="M 42 35 L 50 18 L 58 35 Q 56 38 50 38 Q 44 38 42 35 Z"
                  fill={c.snow}
                  stroke="#fff"
                  strokeWidth="1"/>

            {/* Snow details */}
            <path d="M 44 35 Q 46 32 50 30 Q 54 32 56 35" fill="#fff" opacity="0.6"/>
            <path d="M 45 40 L 48 38 L 50 42 L 52 38 L 55 40"
                  stroke={c.snow}
                  strokeWidth="1.5"
                  fill="none"/>

            {/* Glacier crevasses */}
            <line x1="46" y1="45" x2="44" y2="50" stroke={c.shadow} strokeWidth="1" opacity="0.5"/>
            <line x1="54" y1="45" x2="56" y2="50" stroke={c.shadow} strokeWidth="1" opacity="0.5"/>
            <line x1="50" y1="40" x2="50" y2="48" stroke={c.shadow} strokeWidth="0.8" opacity="0.4"/>

            {/* Highlights on peak */}
            <path d="M 48 22 L 50 18 L 52 22" stroke="#fff" strokeWidth="1.5" opacity="0.8"/>

            {/* Shadow side emphasis */}
            <path d="M 50 15 L 90 92 L 85 92 Z" fill="#000" opacity="0.15"/>
        </svg>
    );
}
