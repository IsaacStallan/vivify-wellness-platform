import React from 'react';

// CINEMATIC CHARACTER - Skate 4 Inspired Close-Up Style
// Much larger (250px+) with realistic shading and detail
export function CinematicPlayer({ size = 250, pose = 'standing' }) {
    const height = size * 1.3;

    return (
        <svg
            width={size}
            height={height}
            viewBox="0 0 250 325"
            style={{ filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.6))' }}
        >
            <defs>
                {/* Realistic Gradients */}
                <linearGradient id="skinTone" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffd4a3" />
                    <stop offset="50%" stopColor="#f0c080" />
                    <stop offset="100%" stopColor="#e0a378" />
                </linearGradient>

                <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#4338ca" />
                    <stop offset="100%" stopColor="#3730a3" />
                </linearGradient>

                <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1f2937" />
                </linearGradient>

                <radialGradient id="shoeShine">
                    <stop offset="0%" stopColor="#4b5563" />
                    <stop offset="70%" stopColor="#1f2937" />
                    <stop offset="100%" stopColor="#111827" />
                </radialGradient>

                {/* Texture overlay */}
                <pattern id="fabricTexture" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="4" height="4" fill="rgba(0,0,0,0.02)"/>
                    <path d="M0,0 L4,4 M4,0 L0,4" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                </pattern>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="125" cy="318" rx="60" ry="12" fill="rgba(0,0,0,0.4)" opacity="0.6"/>

            {/* Legs - Detailed with muscle definition */}
            <path
                d="M 100 180 L 95 210 L 92 245 L 88 285 L 85 320 L 100 320 L 103 285 L 107 245 L 110 210 L 105 180 Z"
                fill="url(#pantsGrad)"
                stroke="#0f172a"
                strokeWidth="2"
            />
            <path
                d="M 150 180 L 155 210 L 158 245 L 162 285 L 165 320 L 150 320 L 147 285 L 143 245 L 140 210 L 145 180 Z"
                fill="url(#pantsGrad)"
                stroke="#0f172a"
                strokeWidth="2"
            />

            {/* Pants highlights (fabric shine) */}
            <path d="M 97 190 L 94 220 L 93 250" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none"/>
            <path d="M 153 190 L 156 220 L 157 250" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none"/>

            {/* Knee pads/details */}
            <ellipse cx="100" cy="230" rx="12" ry="18" fill="rgba(0,0,0,0.3)"/>
            <ellipse cx="150" cy="230" rx="12" ry="18" fill="rgba(0,0,0,0.3)"/>

            {/* Shoes - Modern sneakers with details */}
            <ellipse cx="92" cy="320" rx="22" ry="10" fill="url(#shoeShine)"/>
            <ellipse cx="157" cy="320" rx="22" ry="10" fill="url(#shoeShine)"/>

            {/* Shoe body */}
            <path
                d="M 70 310 Q 70 305 75 303 L 110 303 Q 115 305 115 310 L 115 322 Q 115 325 110 325 L 75 325 Q 70 325 70 322 Z"
                fill="#1f2937"
                stroke="#111827"
                strokeWidth="2"
            />
            <path
                d="M 135 310 Q 135 305 140 303 L 175 303 Q 180 305 180 310 L 180 322 Q 180 325 175 325 L 140 325 Q 135 325 135 322 Z"
                fill="#1f2937"
                stroke="#111827"
                strokeWidth="2"
            />

            {/* Shoe laces */}
            <line x1="80" y1="310" x2="105" y2="310" stroke="#fff" strokeWidth="2"/>
            <line x1="85" y1="314" x2="100" y2="314" stroke="#fff" strokeWidth="2"/>
            <line x1="145" y1="310" x2="170" y2="310" stroke="#fff" strokeWidth="2"/>
            <line x1="150" y1="314" x2="165" y2="314" stroke="#fff" strokeWidth="2"/>

            {/* Shoe logos (swoosh-like) */}
            <path d="M 75 315 Q 90 312 105 315" stroke="#4f46e5" strokeWidth="3" fill="none"/>
            <path d="M 140 315 Q 155 312 170 315" stroke="#4f46e5" strokeWidth="3" fill="none"/>

            {/* Torso - Modern athletic jacket */}
            <path
                d="M 80 100 L 75 125 L 68 155 L 70 175 L 85 185 L 165 185 L 180 175 L 182 155 L 175 125 L 170 100 Z"
                fill="url(#jacketGrad)"
                stroke="#3730a3"
                strokeWidth="3"
            />

            {/* Fabric texture overlay */}
            <rect x="70" y="100" width="110" height="85" fill="url(#fabricTexture)" opacity="0.5"/>

            {/* Jacket highlights and shadows for depth */}
            <path d="M 85 110 L 80 135 L 75 165" stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="none"/>
            <path d="M 165 110 L 170 135 L 175 165" stroke="rgba(0,0,0,0.3)" strokeWidth="4" fill="none"/>

            {/* Hood detail */}
            <path d="M 95 100 Q 90 95 90 85 L 160 85 Q 160 95 155 100" fill="rgba(0,0,0,0.2)"/>

            {/* Zipper - Realistic metal zipper */}
            <rect x="120" y="105" width="10" height="75" fill="#94a3b8" rx="1"/>
            <line x1="125" y1="105" x2="125" y2="180" stroke="#475569" strokeWidth="2"/>

            {/* Zipper teeth */}
            {[...Array(15)].map((_, i) => (
                <React.Fragment key={i}>
                    <rect x="120" y={105 + i * 5} width="5" height="3" fill="#64748b"/>
                    <rect x="125" y={105 + i * 5} width="5" height="3" fill="#64748b"/>
                </React.Fragment>
            ))}

            {/* Zipper pull */}
            <circle cx="125" cy="102" r="5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2"/>

            {/* Jacket pockets - Modern design */}
            <path
                d="M 85 145 Q 85 140 90 140 L 115 140 Q 120 140 120 145 L 120 165 Q 120 170 115 170 L 90 170 Q 85 170 85 165 Z"
                stroke="#3730a3"
                strokeWidth="2.5"
                fill="rgba(0,0,0,0.2)"
            />
            <path
                d="M 130 145 Q 130 140 135 140 L 160 140 Q 165 140 165 145 L 165 165 Q 165 170 160 170 L 135 170 Q 130 170 130 165 Z"
                stroke="#3730a3"
                strokeWidth="2.5"
                fill="rgba(0,0,0,0.2)"
            />

            {/* Brand logo on chest */}
            <circle cx="105" cy="120" r="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <text x="105" y="125" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontWeight="bold">V</text>

            {/* Arms - Athletic with muscle definition */}
            <path
                d="M 75 112 L 45 125 L 30 165 L 35 175 L 50 170 L 68 140 Z"
                fill="url(#jacketGrad)"
                stroke="#3730a3"
                strokeWidth="2.5"
            />
            <path
                d="M 175 112 L 205 125 L 220 165 L 215 175 L 200 170 L 182 140 Z"
                fill="url(#jacketGrad)"
                stroke="#3730a3"
                strokeWidth="2.5"
            />

            {/* Arm shadows for muscle definition */}
            <ellipse cx="50" cy="145" rx="8" ry="15" fill="rgba(0,0,0,0.15)" />
            <ellipse cx="200" cy="145" rx="8" ry="15" fill="rgba(0,0,0,0.15)" />

            {/* Hands - Detailed with fingers */}
            <ellipse cx="34" cy="173" rx="14" ry="12" fill="url(#skinTone)" stroke="#d4a574" strokeWidth="2"/>
            <ellipse cx="216" cy="173" rx="14" ry="12" fill="url(#skinTone)" stroke="#d4a574" strokeWidth="2"/>

            {/* Finger details */}
            <path d="M 28 175 L 26 180" stroke="#c19566" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 32 177 L 30 183" stroke="#c19566" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 36 177 L 35 183" stroke="#c19566" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 222 175 L 224 180" stroke="#c19566" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 218 177 L 220 183" stroke="#c19566" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 214 177 L 215 183" stroke="#c19566" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Neck */}
            <rect x="105" y="88" width="40" height="18" fill="url(#skinTone)" stroke="#d4a574" strokeWidth="1.5" rx="3"/>

            {/* Neck shadow */}
            <ellipse cx="125" cy="95" rx="15" ry="5" fill="rgba(0,0,0,0.1)"/>

            {/* Head - Realistic proportions */}
            <ellipse cx="125" cy="55" rx="38" ry="42" fill="url(#skinTone)" stroke="#d4a574" strokeWidth="2.5"/>

            {/* Face shading for depth */}
            <ellipse cx="125" cy="65" rx="32" ry="30" fill="rgba(0,0,0,0.05)"/>
            <ellipse cx="125" cy="45" rx="32" ry="25" fill="rgba(255,255,255,0.08)"/>

            {/* Hair - Modern style with texture */}
            <path
                d="M 87 45 Q 87 18 125 15 Q 163 18 163 45 L 160 58 Q 125 52 90 58 Z"
                fill="#2d1b0e"
                stroke="#1a0f08"
                strokeWidth="2.5"
            />

            {/* Hair texture lines */}
            <path d="M 100 28 Q 110 25 125 24 Q 140 25 150 28" stroke="#3d2817" strokeWidth="2" fill="none"/>
            <path d="M 95 35 Q 108 32 125 31 Q 142 32 155 35" stroke="#3d2817" strokeWidth="1.5" fill="none"/>
            <path d="M 92 42 Q 108 38 125 37 Q 142 38 158 42" stroke="#3d2817" strokeWidth="1.5" fill="none"/>

            {/* Hair highlights */}
            <path d="M 130 20 Q 135 22 140 20" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none"/>

            {/* Face Features - Realistic style */}

            {/* Eyes - Detailed with depth */}
            <ellipse cx="108" cy="54" rx="7" ry="9" fill="#fff"/>
            <circle cx="108" cy="56" r="5" fill="#3b2617"/>
            <circle cx="108" cy="55" r="3" fill="#000"/>
            <circle cx="109" cy="53" r="2" fill="#fff" opacity="0.8"/>
            <path d="M 102 47 Q 108 45 114 47" stroke="#2d1b0e" strokeWidth="2.5" strokeLinecap="round"/>

            <ellipse cx="142" cy="54" rx="7" ry="9" fill="#fff"/>
            <circle cx="142" cy="56" r="5" fill="#3b2617"/>
            <circle cx="142" cy="55" r="3" fill="#000"/>
            <circle cx="143" cy="53" r="2" fill="#fff" opacity="0.8"/>
            <path d="M 136 47 Q 142 45 148 47" stroke="#2d1b0e" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Eyelids for depth */}
            <path d="M 101 53 Q 108 51 115 53" stroke="#d4a574" strokeWidth="1.5" fill="none"/>
            <path d="M 135 53 Q 142 51 149 53" stroke="#d4a574" strokeWidth="1.5" fill="none"/>

            {/* Nose - Detailed with shadows */}
            <path d="M 125 58 L 123 70 Q 125 73 127 70 Z" fill="#d4a574" stroke="#c19566" strokeWidth="1.5"/>
            <ellipse cx="122" cy="71" rx="2.5" ry="3" fill="rgba(0,0,0,0.15)"/>
            <ellipse cx="128" cy="71" rx="2.5" ry="3" fill="rgba(0,0,0,0.15)"/>
            <path d="M 125 58 L 125 70" stroke="#c19566" strokeWidth="1" opacity="0.5"/>

            {/* Mouth - Natural smile */}
            <path d="M 112 78 Q 125 83 138 78" stroke="#c19566" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M 115 79 Q 125 82 135 79" stroke="#d4735e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

            {/* Lower lip highlight */}
            <path d="M 120 82 Q 125 83 130 82" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none"/>

            {/* Ears */}
            <ellipse cx="88" cy="55" rx="6" ry="10" fill="url(#skinTone)" stroke="#d4a574" strokeWidth="1.5"/>
            <ellipse cx="162" cy="55" rx="6" ry="10" fill="url(#skinTone)" stroke="#d4a574" strokeWidth="1.5"/>
            <ellipse cx="88" cy="55" rx="3" ry="5" fill="rgba(0,0,0,0.1)"/>
            <ellipse cx="162" cy="55" rx="3" ry="5" fill="rgba(0,0,0,0.1)"/>

            {/* Backpack straps - Heavy duty */}
            <path d="M 92 105 Q 87 118 85 145" stroke="#374151" strokeWidth="10" opacity="0.8" strokeLinecap="round"/>
            <path d="M 158 105 Q 163 118 165 145" stroke="#374151" strokeWidth="10" opacity="0.8" strokeLinecap="round"/>

            {/* Strap buckles */}
            <rect x="87" y="125" width="8" height="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" rx="1"/>
            <rect x="155" y="125" width="8" height="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" rx="1"/>
        </svg>
    );
}

export default CinematicPlayer;
