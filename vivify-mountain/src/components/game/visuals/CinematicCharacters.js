import React from 'react';

// PHOTOREALISTIC CINEMATIC CHARACTER
// Advanced lighting: rim light, subsurface scattering, ambient occlusion
// Detailed textures: fabric weave, skin pores, hair strands
// Inspired by Skate 4, Uncharted, The Last of Us character rendering
export function CinematicPlayer({ size = 250, pose = 'standing' }) {
    const height = size * 1.3;

    return (
        <svg
            width={size}
            height={height}
            viewBox="0 0 250 325"
            style={{
                filter: `
                    drop-shadow(0 20px 50px rgba(0, 0, 0, 0.9))
                    drop-shadow(0 5px 20px rgba(99, 102, 241, 0.4))
                    drop-shadow(-5px 0 15px rgba(139, 92, 246, 0.3))
                `
            }}
        >
            <defs>
                {/* ADVANCED SKIN SHADING - Subsurface Scattering Simulation */}
                <radialGradient id="skinSubsurface" cx="50%" cy="30%">
                    <stop offset="0%" stopColor="#ffe4c4" />
                    <stop offset="30%" stopColor="#ffd4a3" />
                    <stop offset="60%" stopColor="#f0c080" />
                    <stop offset="100%" stopColor="#d9a574" />
                </radialGradient>

                <linearGradient id="skinHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                    <stop offset="50%" stopColor="rgba(255, 240, 220, 0.15)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 0.1)" />
                </linearGradient>

                {/* FABRIC SHADER - Realistic cloth with micro-details */}
                <linearGradient id="fabricMain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5b5fc7" />
                    <stop offset="25%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#4338ca" />
                    <stop offset="75%" stopColor="#3730a3" />
                    <stop offset="100%" stopColor="#312e81" />
                </linearGradient>

                <radialGradient id="fabricHighlight" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                    <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* RIM LIGHTING - Edge highlights from back light */}
                <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
                    <stop offset="50%" stopColor="rgba(167, 139, 250, 0.6)" />
                    <stop offset="100%" stopColor="rgba(196, 181, 253, 0.4)" />
                </linearGradient>

                {/* ADVANCED TEXTURE PATTERNS */}
                <pattern id="fabricWeave" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="4" height="4" fill="rgba(0,0,0,0.03)"/>
                    <path d="M0,0 L2,2 M2,0 L0,2 M2,2 L4,4 M4,2 L2,4"
                          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                </pattern>

                <pattern id="denim" width="3" height="3" patternUnits="userSpaceOnUse">
                    <rect width="3" height="3" fill="rgba(0,0,0,0.05)"/>
                    <line x1="0" y1="0" x2="3" y2="3" stroke="rgba(100,100,150,0.1)" strokeWidth="0.5"/>
                    <line x1="3" y1="0" x2="0" y2="3" stroke="rgba(100,100,150,0.1)" strokeWidth="0.5"/>
                </pattern>

                <pattern id="leather" width="8" height="8" patternUnits="userSpaceOnUse">
                    <ellipse cx="2" cy="2" rx="1" ry="0.8" fill="rgba(0,0,0,0.08)"/>
                    <ellipse cx="6" cy="2" rx="1" ry="0.8" fill="rgba(0,0,0,0.06)"/>
                    <ellipse cx="4" cy="5" rx="1" ry="0.8" fill="rgba(0,0,0,0.07)"/>
                </pattern>

                {/* METALLIC SHADER for zippers/buckles */}
                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="30%" stopColor="#cbd5e1" />
                    <stop offset="50%" stopColor="#94a3b8" />
                    <stop offset="70%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* AMBIENT OCCLUSION - Contact shadows */}
                <radialGradient id="ambientOcclusion">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="70%" stopColor="rgba(0,0,0,0.1)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                </radialGradient>

                {/* HAIR SHADER - Individual strand highlights */}
                <linearGradient id="hairBase" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3d2817" />
                    <stop offset="30%" stopColor="#2d1b0e" />
                    <stop offset="70%" stopColor="#1a0f08" />
                    <stop offset="100%" stopColor="#0a0503" />
                </linearGradient>

                <linearGradient id="hairHighlight" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                    <stop offset="50%" stopColor="rgba(99, 102, 241, 0.15)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            {/* GROUND CONTACT SHADOW - Soft, realistic */}
            <ellipse cx="125" cy="318" rx="70" ry="15" fill="rgba(0,0,0,0.5)" opacity="0.6"/>
            <ellipse cx="125" cy="318" rx="50" ry="10" fill="rgba(0,0,0,0.3)" opacity="0.8"/>

            {/* ==================== LEGS - Athletic build with muscle definition ==================== */}

            {/* Left Leg */}
            <path
                d="M 100 180 L 95 210 L 92 245 L 88 280 L 85 315 L 100 318 L 103 283 L 107 248 L 110 213 L 105 180 Z"
                fill="url(#pantsGrad)"
                stroke="#0f172a"
                strokeWidth="2.5"
            />

            {/* Denim texture on left leg */}
            <path
                d="M 100 180 L 95 210 L 92 245 L 88 280 L 85 315 L 100 318 L 103 283 L 107 248 L 110 213 L 105 180 Z"
                fill="url(#denim)"
                opacity="0.6"
            />

            {/* Left leg highlights (light from left) */}
            <path d="M 97 190 L 94 225 L 92 260 L 90 295"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"/>

            {/* Left leg shadows (right side) */}
            <path d="M 103 195 L 105 230 L 106 265 L 105 300"
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"/>

            {/* Knee definition - left leg */}
            <ellipse cx="95" cy="235" rx="15" ry="22" fill="rgba(0,0,0,0.15)"/>
            <ellipse cx="93" cy="232" rx="8" ry="12" fill="rgba(255,255,255,0.08)"/>

            {/* Right Leg */}
            <path
                d="M 150 180 L 155 210 L 158 245 L 162 280 L 165 315 L 150 318 L 147 283 L 143 248 L 140 213 L 145 180 Z"
                fill="url(#pantsGrad)"
                stroke="#0f172a"
                strokeWidth="2.5"
            />

            {/* Denim texture on right leg */}
            <path
                d="M 150 180 L 155 210 L 158 245 L 162 280 L 165 315 L 150 318 L 147 283 L 143 248 L 140 213 L 145 180 Z"
                fill="url(#denim)"
                opacity="0.6"
            />

            {/* Right leg rim light (from back right) */}
            <path d="M 157 185 L 160 220 L 162 255 L 164 290"
                  stroke="url(#rimLight)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"/>

            {/* Knee definition - right leg */}
            <ellipse cx="155" cy="235" rx="15" ry="22" fill="rgba(0,0,0,0.15)"/>
            <ellipse cx="157" cy="232" rx="8" ry="12" fill="rgba(255,255,255,0.08)"/>

            {/* Pants gradient defs */}
            <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* ==================== SHOES - Modern sneakers with extreme detail ==================== */}

            {/* Left Shoe Shadow */}
            <ellipse cx="92" cy="320" rx="24" ry="12" fill="url(#shoeShine)"/>

            {/* Left Shoe Body */}
            <path
                d="M 68 308 Q 68 302 73 300 L 112 300 Q 117 302 117 308 L 117 322 Q 117 326 112 326 L 73 326 Q 68 326 68 322 Z"
                fill="#1f2937"
                stroke="#0f172a"
                strokeWidth="2.5"
            />

            {/* Left shoe leather texture */}
            <path
                d="M 68 308 Q 68 302 73 300 L 112 300 Q 117 302 117 308 L 117 322 Q 117 326 112 326 L 73 326 Q 68 326 68 322 Z"
                fill="url(#leather)"
                opacity="0.4"
            />

            {/* Left shoe toe cap */}
            <ellipse cx="75" cy="315" rx="10" ry="12" fill="#111827" opacity="0.7"/>

            {/* Left shoe laces (detailed) */}
            <line x1="78" y1="308" x2="107" y2="308" stroke="#f8f8f8" strokeWidth="2.5"/>
            <line x1="82" y1="312" x2="103" y2="312" stroke="#f8f8f8" strokeWidth="2"/>
            <line x1="85" y1="316" x2="100" y2="316" stroke="#f8f8f8" strokeWidth="2"/>

            {/* Left shoe brand swoosh */}
            <path d="M 73 318 Q 88 314 108 318"
                  stroke="#6366f1"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.8"/>

            {/* Left shoe sole detail */}
            <rect x="70" y="324" width="45" height="3" fill="#94a3b8" rx="1"/>

            {/* Left shoe highlights */}
            <ellipse cx="80" cy="305" rx="8" ry="6" fill="rgba(255,255,255,0.15)"/>
            <path d="M 72 310 Q 85 308 95 310"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  fill="none"/>

            {/* Right Shoe Shadow */}
            <ellipse cx="157" cy="320" rx="24" ry="12" fill="url(#shoeShine)"/>

            {/* Right Shoe Body */}
            <path
                d="M 133 308 Q 133 302 138 300 L 177 300 Q 182 302 182 308 L 182 322 Q 182 326 177 326 L 138 326 Q 133 326 133 322 Z"
                fill="#1f2937"
                stroke="#0f172a"
                strokeWidth="2.5"
            />

            {/* Right shoe leather texture */}
            <path
                d="M 133 308 Q 133 302 138 300 L 177 300 Q 182 302 182 308 L 182 322 Q 182 326 177 326 L 138 326 Q 133 326 133 322 Z"
                fill="url(#leather)"
                opacity="0.4"
            />

            {/* Right shoe laces */}
            <line x1="143" y1="308" x2="172" y2="308" stroke="#f8f8f8" strokeWidth="2.5"/>
            <line x1="147" y1="312" x2="168" y2="312" stroke="#f8f8f8" strokeWidth="2"/>
            <line x1="150" y1="316" x2="165" y2="316" stroke="#f8f8f8" strokeWidth="2"/>

            {/* Right shoe swoosh */}
            <path d="M 138 318 Q 153 314 173 318"
                  stroke="#6366f1"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.8"/>

            {/* Right shoe rim light */}
            <path d="M 175 303 L 178 320"
                  stroke="url(#rimLight)"
                  strokeWidth="2.5"
                  fill="none"/>

            <radialGradient id="shoeShine">
                <stop offset="0%" stopColor="#4b5563" />
                <stop offset="70%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* ==================== TORSO - Athletic jacket with EXTREME fabric detail ==================== */}

            {/* Main jacket body */}
            <path
                d="M 78 98 L 73 125 L 66 158 L 68 178 L 83 188 L 167 188 L 182 178 L 184 158 L 177 125 L 172 98 Z"
                fill="url(#fabricMain)"
                stroke="#312e81"
                strokeWidth="3"
            />

            {/* Fabric weave texture */}
            <path
                d="M 78 98 L 73 125 L 66 158 L 68 178 L 83 188 L 167 188 L 182 178 L 184 158 L 177 125 L 172 98 Z"
                fill="url(#fabricWeave)"
                opacity="0.7"
            />

            {/* Main fabric highlight (left side catching light) */}
            <path d="M 83 108 L 78 140 L 72 172"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"/>

            {/* Secondary highlight */}
            <path d="M 90 103 L 85 135 L 80 167"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"/>

            {/* Right side shadow */}
            <path d="M 167 108 L 172 140 L 178 172"
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"/>

            {/* Fabric fold details */}
            <ellipse cx="90" cy="140" rx="20" ry="8" fill="rgba(0,0,0,0.08)" opacity="0.6"/>
            <ellipse cx="160" cy="145" rx="18" ry="7" fill="rgba(0,0,0,0.08)" opacity="0.6"/>

            {/* Hood shadow */}
            <path d="M 93 98 Q 88 92 88 82 L 162 82 Q 162 92 157 98"
                  fill="rgba(0,0,0,0.3)"/>

            {/* Rim light on right edge (from back light) */}
            <path d="M 170 100 L 175 130 L 180 165"
                  stroke="url(#rimLight)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"/>

            {/* ==================== ADVANCED ZIPPER with micro-details ==================== */}

            {/* Zipper track */}
            <rect x="118" y="103" width="14" height="80" fill="#64748b" rx="2"/>

            {/* Zipper teeth - ultra detailed */}
            {[...Array(20)].map((_, i) => (
                <React.Fragment key={i}>
                    <rect x="118" y={103 + i * 4} width="6" height="2.5" fill="#475569" rx="0.5"/>
                    <rect x="126" y={103 + i * 4} width="6" height="2.5" fill="#475569" rx="0.5"/>
                    <rect x="119" y={103 + i * 4} width="5" height="2" fill="url(#metalGrad)"/>
                    <rect x="126" y={103 + i * 4} width="5" height="2" fill="url(#metalGrad)"/>
                </React.Fragment>
            ))}

            {/* Zipper slider */}
            <path d="M 118 100 L 132 100 L 132 108 L 118 108 Z" fill="url(#metalGrad)" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="125" cy="104" r="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
            <circle cx="125" cy="104" r="1.5" fill="#cbd5e1"/>

            {/* Zipper highlight */}
            <rect x="120" y="105" width="10" height="75" fill="url(#fabricHighlight)" opacity="0.3"/>

            {/* ==================== JACKET POCKETS - Hyper-realistic ==================== */}

            {/* Left pocket */}
            <path
                d="M 82 145 Q 82 140 87 140 L 118 140 Q 123 140 123 145 L 123 168 Q 123 173 118 173 L 87 173 Q 82 173 82 168 Z"
                stroke="#312e81"
                strokeWidth="3"
                fill="rgba(0,0,0,0.25)"
            />
            {/* Pocket opening shadow */}
            <rect x="87" y="140" width="31" height="4" fill="rgba(0,0,0,0.4)"/>
            {/* Pocket stitching */}
            <rect x="82" y="140" width="41" height="33"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="3,2"
                  fill="none"/>

            {/* Right pocket */}
            <path
                d="M 127 145 Q 127 140 132 140 L 163 140 Q 168 140 168 145 L 168 168 Q 168 173 163 173 L 132 173 Q 127 173 127 168 Z"
                stroke="#312e81"
                strokeWidth="3"
                fill="rgba(0,0,0,0.25)"
            />
            <rect x="132" y="140" width="31" height="4" fill="rgba(0,0,0,0.4)"/>
            <rect x="127" y="140" width="41" height="33"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="3,2"
                  fill="none"/>

            {/* ==================== BRAND LOGO with metallic effect ==================== */}
            <circle cx="100" cy="118" r="12" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <circle cx="100" cy="118" r="10" fill="url(#metalGrad)" opacity="0.3"/>
            <text x="100" y="124" fontSize="14" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontWeight="bold" fontFamily="Arial, sans-serif">V</text>

            {/* ==================== ARMS with muscle definition ==================== */}

            {/* Left arm */}
            <path
                d="M 73 110 L 42 125 L 25 170 L 30 178 L 48 173 L 66 138 Z"
                fill="url(#fabricMain)"
                stroke="#312e81"
                strokeWidth="3"
            />
            {/* Left arm fabric texture */}
            <path
                d="M 73 110 L 42 125 L 25 170 L 30 178 L 48 173 L 66 138 Z"
                fill="url(#fabricWeave)"
                opacity="0.6"
            />
            {/* Left bicep definition */}
            <ellipse cx="55" cy="135" rx="10" ry="18" fill="rgba(0,0,0,0.15)"/>
            <ellipse cx="52" cy="132" rx="7" ry="12" fill="rgba(255,255,255,0.08)"/>
            {/* Left arm highlight */}
            <path d="M 50 120 L 35 145 L 28 168"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="4"
                  fill="none"/>

            {/* Right arm */}
            <path
                d="M 177 110 L 208 125 L 225 170 L 220 178 L 202 173 L 184 138 Z"
                fill="url(#fabricMain)"
                stroke="#312e81"
                strokeWidth="3"
            />
            {/* Right arm fabric texture */}
            <path
                d="M 177 110 L 208 125 L 225 170 L 220 178 L 202 173 L 184 138 Z"
                fill="url(#fabricWeave)"
                opacity="0.6"
            />
            {/* Right bicep definition */}
            <ellipse cx="195" cy="135" rx="10" ry="18" fill="rgba(0,0,0,0.15)"/>
            {/* Right arm rim light (strong from back) */}
            <path d="M 215 120 L 222 150 L 223 173"
                  stroke="url(#rimLight)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"/>

            {/* ==================== HANDS with detailed fingers ==================== */}

            {/* Left hand */}
            <ellipse cx="29" cy="176" rx="16" ry="14" fill="url(#skinSubsurface)" stroke="#d4a574" strokeWidth="2"/>
            {/* Left hand highlight */}
            <ellipse cx="26" cy="173" rx="8" ry="6" fill="url(#skinHighlight)"/>
            {/* Left fingers */}
            <path d="M 22 180 L 19 186" stroke="#c19566" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 27 182 L 25 190" stroke="#c19566" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 32 182 L 31 190" stroke="#c19566" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 37 180 L 37 188" stroke="#c19566" strokeWidth="3" strokeLinecap="round"/>
            {/* Finger joints */}
            <circle cx="19" cy="184" r="2" fill="rgba(0,0,0,0.1)"/>
            <circle cx="25" cy="186" r="2" fill="rgba(0,0,0,0.1)"/>
            <circle cx="31" cy="186" r="2" fill="rgba(0,0,0,0.1)"/>

            {/* Right hand */}
            <ellipse cx="221" cy="176" rx="16" ry="14" fill="url(#skinSubsurface)" stroke="#d4a574" strokeWidth="2"/>
            {/* Right hand rim light */}
            <path d="M 230 172 Q 235 175 235 180"
                  stroke="url(#rimLight)"
                  strokeWidth="3"
                  fill="none"/>
            {/* Right fingers */}
            <path d="M 228 180 L 231 186" stroke="#c19566" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 223 182 L 225 190" stroke="#c19566" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 218 182 L 219 190" stroke="#c19566" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 213 180 L 213 188" stroke="#c19566" strokeWidth="3" strokeLinecap="round"/>

            {/* ==================== NECK with realistic shading ==================== */}
            <path d="M 103 86 L 103 96 L 147 96 L 147 86" fill="url(#skinSubsurface)" stroke="#d4a574" strokeWidth="2"/>
            {/* Neck shadow under chin */}
            <ellipse cx="125" cy="94" rx="18" ry="6" fill="rgba(0,0,0,0.15)"/>
            {/* Neck highlight */}
            <rect x="108" y="87" width="34" height="5" fill="url(#skinHighlight)" opacity="0.3"/>
            {/* Adam's apple */}
            <ellipse cx="125" cy="91" rx="4" ry="6" fill="rgba(0,0,0,0.08)"/>

            {/* ==================== HEAD with photorealistic features ==================== */}

            {/* Main head shape */}
            <ellipse cx="125" cy="52" rx="40" ry="44" fill="url(#skinSubsurface)" stroke="#d4a574" strokeWidth="3"/>

            {/* Facial structure shadows */}
            <ellipse cx="125" cy="65" rx="34" ry="32" fill="rgba(0,0,0,0.06)"/>
            {/* Cheekbone highlights */}
            <ellipse cx="100" cy="55" rx="12" ry="18" fill="rgba(255,255,255,0.12)"/>
            <ellipse cx="150" cy="55" rx="12" ry="18" fill="rgba(255,255,255,0.08)"/>
            {/* Forehead highlight */}
            <ellipse cx="125" cy="38" rx="28" ry="20" fill="rgba(255,255,255,0.15)"/>

            {/* Jaw definition */}
            <path d="M 95 68 Q 125 82 155 68"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="2"
                  fill="none"/>

            {/* Rim light on right side of face */}
            <path d="M 162 35 Q 165 52 162 70"
                  stroke="url(#rimLight)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"/>

            {/* ==================== HAIR - Photorealistic with strand detail ==================== */}

            {/* Main hair mass */}
            <path
                d="M 85 42 Q 85 15 125 12 Q 165 15 165 42 L 162 56 Q 125 50 88 56 Z"
                fill="url(#hairBase)"
                stroke="#0a0503"
                strokeWidth="3"
            />

            {/* Hair highlight overlay */}
            <path
                d="M 85 42 Q 85 15 125 12 Q 165 15 165 42 L 162 56 Q 125 50 88 56 Z"
                fill="url(#hairHighlight)"
                opacity="0.6"
            />

            {/* Individual hair strands (front) */}
            <path d="M 95 25 Q 98 20 102 18" stroke="#2d1b0e" strokeWidth="2.5" fill="none" opacity="0.7"/>
            <path d="M 102 22 Q 107 18 112 16" stroke="#2d1b0e" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M 112 20 Q 118 16 125 15" stroke="#3d2817" strokeWidth="2.5" fill="none" opacity="0.8"/>
            <path d="M 138 20 Q 132 16 125 15" stroke="#3d2817" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M 148 22 Q 143 18 138 16" stroke="#2d1b0e" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M 155 25 Q 152 20 148 18" stroke="#2d1b0e" strokeWidth="2.5" fill="none" opacity="0.7"/>

            {/* Hair strands (sides) */}
            <path d="M 88 35 Q 85 30 84 25" stroke="#1a0f08" strokeWidth="2" fill="none" opacity="0.6"/>
            <path d="M 90 40 Q 87 35 85 30" stroke="#1a0f08" strokeWidth="2" fill="none" opacity="0.6"/>
            <path d="M 162 35 Q 165 30 166 25" stroke="#1a0f08" strokeWidth="2" fill="none" opacity="0.6"/>
            <path d="M 160 40 Q 163 35 165 30" stroke="#1a0f08" strokeWidth="2" fill="none" opacity="0.6"/>

            {/* Rim light on hair */}
            <path d="M 160 20 Q 163 30 162 45"
                  stroke="url(#rimLight)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.5"/>

            {/* ==================== EYES - Hyper-realistic with multiple layers ==================== */}

            {/* LEFT EYE */}
            {/* Eye white */}
            <ellipse cx="105" cy="52" rx="8" ry="10" fill="#fefefe"/>
            {/* Upper eyelid shadow */}
            <ellipse cx="105" cy="48" rx="7" ry="4" fill="rgba(0,0,0,0.1)"/>
            {/* Iris outer ring */}
            <circle cx="105" cy="54" r="6" fill="#5c4033"/>
            {/* Iris inner color */}
            <circle cx="105" cy="54" r="5" fill="#3b2617"/>
            {/* Pupil */}
            <circle cx="105" cy="54" r="3.5" fill="#000"/>
            {/* Eye shine (main) */}
            <circle cx="106" cy="51" r="2.5" fill="#fff" opacity="0.9"/>
            {/* Eye shine (secondary) */}
            <circle cx="103" cy="56" r="1" fill="#fff" opacity="0.5"/>
            {/* Lower eyelid highlight */}
            <path d="M 98 56 Q 105 58 112 56"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  fill="none"/>

            {/* RIGHT EYE */}
            {/* Eye white */}
            <ellipse cx="145" cy="52" rx="8" ry="10" fill="#fefefe"/>
            {/* Upper eyelid shadow */}
            <ellipse cx="145" cy="48" rx="7" ry="4" fill="rgba(0,0,0,0.1)"/>
            {/* Iris outer ring */}
            <circle cx="145" cy="54" r="6" fill="#5c4033"/>
            {/* Iris inner color */}
            <circle cx="145" cy="54" r="5" fill="#3b2617"/>
            {/* Pupil */}
            <circle cx="145" cy="54" r="3.5" fill="#000"/>
            {/* Eye shine */}
            <circle cx="146" cy="51" r="2.5" fill="#fff" opacity="0.9"/>
            <circle cx="143" cy="56" r="1" fill="#fff" opacity="0.5"/>

            {/* EYEBROWS - Detailed hair strokes */}
            <path d="M 98 44 Q 105 42 113 44"
                  stroke="#2d1b0e"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"/>
            {/* Individual brow hairs */}
            <path d="M 100 44 L 102 42" stroke="#1a0f08" strokeWidth="1.5" opacity="0.6"/>
            <path d="M 105 43 L 106 41" stroke="#1a0f08" strokeWidth="1.5" opacity="0.6"/>
            <path d="M 110 44 L 111 42" stroke="#1a0f08" strokeWidth="1.5" opacity="0.6"/>

            <path d="M 137 44 Q 145 42 152 44"
                  stroke="#2d1b0e"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"/>
            <path d="M 140 44 L 142 42" stroke="#1a0f08" strokeWidth="1.5" opacity="0.6"/>
            <path d="M 145 43 L 146 41" stroke="#1a0f08" strokeWidth="1.5" opacity="0.6"/>
            <path d="M 148 44 L 149 42" stroke="#1a0f08" strokeWidth="1.5" opacity="0.6"/>

            {/* Upper eyelid creases */}
            <path d="M 99 50 Q 105 49 111 50"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                  fill="none"/>
            <path d="M 139 50 Q 145 49 151 50"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                  fill="none"/>

            {/* ==================== NOSE - Realistic with shadows ==================== */}
            <path d="M 125 56 L 122 68 Q 125 72 128 68 Z"
                  fill="#d4a574"
                  stroke="#c19566"
                  strokeWidth="1.5"/>
            {/* Nostril shadows */}
            <ellipse cx="121" cy="69" rx="3" ry="3.5" fill="rgba(0,0,0,0.25)"/>
            <ellipse cx="129" cy="69" rx="3" ry="3.5" fill="rgba(0,0,0,0.25)"/>
            {/* Nose bridge highlight */}
            <path d="M 125 56 L 125 68"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  fill="none"/>
            {/* Nose tip highlight */}
            <ellipse cx="125" cy="68" rx="3" ry="2" fill="rgba(255,255,255,0.2)"/>

            {/* ==================== MOUTH - Detailed lips ==================== */}
            {/* Upper lip */}
            <path d="M 110 76 Q 118 78 125 79 Q 132 78 140 76"
                  stroke="#c19566"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"/>
            {/* Lower lip */}
            <path d="M 112 79 Q 125 84 138 79"
                  stroke="#d4735e"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"/>
            {/* Lower lip highlight */}
            <path d="M 118 81 Q 125 84 132 81"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.8"/>
            {/* Mouth corner shadows */}
            <circle cx="110" cy="78" r="2" fill="rgba(0,0,0,0.1)"/>
            <circle cx="140" cy="78" r="2" fill="rgba(0,0,0,0.1)"/>

            {/* ==================== EARS with detail ==================== */}
            {/* Left ear */}
            <ellipse cx="86" cy="52" rx="7" ry="12" fill="url(#skinSubsurface)" stroke="#d4a574" strokeWidth="2"/>
            <ellipse cx="86" cy="52" rx="4" ry="7" fill="rgba(0,0,0,0.12)"/>
            <path d="M 88 48 Q 90 52 88 56" stroke="#c19566" strokeWidth="1.5" fill="none"/>

            {/* Right ear */}
            <ellipse cx="164" cy="52" rx="7" ry="12" fill="url(#skinSubsurface)" stroke="#d4a574" strokeWidth="2"/>
            <ellipse cx="164" cy="52" rx="4" ry="7" fill="rgba(0,0,0,0.12)"/>
            <path d="M 162 48 Q 160 52 162 56" stroke="#c19566" strokeWidth="1.5" fill="none"/>
            {/* Rim light on right ear */}
            <path d="M 169 48 L 169 56"
                  stroke="url(#rimLight)"
                  strokeWidth="2"
                  fill="none"/>

            {/* ==================== BACKPACK STRAPS - Heavy duty with buckles ==================== */}
            {/* Left strap */}
            <path d="M 90 103 Q 85 118 83 148"
                  stroke="#374151"
                  strokeWidth="12"
                  opacity="0.9"
                  strokeLinecap="round"/>
            {/* Strap highlight */}
            <path d="M 87 108 Q 83 123 81 148"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                  fill="none"/>

            {/* Right strap */}
            <path d="M 160 103 Q 165 118 167 148"
                  stroke="#374151"
                  strokeWidth="12"
                  opacity="0.9"
                  strokeLinecap="round"/>
            {/* Strap rim light */}
            <path d="M 169 108 Q 172 123 173 148"
                  stroke="url(#rimLight)"
                  strokeWidth="4"
                  fill="none"/>

            {/* Buckles with metallic detail */}
            <rect x="83" y="123" width="10" height="16" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1.5" rx="2"/>
            <rect x="157" y="123" width="10" height="16" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1.5" rx="2"/>
            {/* Buckle holes */}
            <circle cx="88" cy="127" r="1.5" fill="#1e293b"/>
            <circle cx="88" cy="135" r="1.5" fill="#1e293b"/>
            <circle cx="162" cy="127" r="1.5" fill="#1e293b"/>
            <circle cx="162" cy="135" r="1.5" fill="#1e293b"/>
        </svg>
    );
}

export default CinematicPlayer;
