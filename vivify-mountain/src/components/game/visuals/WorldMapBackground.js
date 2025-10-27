import React from 'react';

// Beautiful World Map Background with continents, ocean, and terrain
export function WorldMapBackground() {
    return (
        <svg className="world-map-background" width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
            <defs>
                {/* Ocean gradient */}
                <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#1e3a8a', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#2563eb', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                </linearGradient>

                {/* Land gradient */}
                <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
                    <stop offset="30%" style={{stopColor: '#84cc16', stopOpacity: 1}} />
                    <stop offset="70%" style={{stopColor: '#22c55e', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#16a34a', stopOpacity: 1}} />
                </linearGradient>

                {/* Mountain ranges gradient */}
                <linearGradient id="mountainRangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#78716c', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#a8a29e', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#d6d3d1', stopOpacity: 1}} />
                </linearGradient>

                {/* Water texture */}
                <pattern id="waterPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 20 Q 10 15 20 20 Q 30 25 40 20" stroke="#1e40af" strokeWidth="0.5" fill="none" opacity="0.3"/>
                    <path d="M 0 30 Q 10 25 20 30 Q 30 35 40 30" stroke="#1e40af" strokeWidth="0.5" fill="none" opacity="0.2"/>
                </pattern>

                {/* Terrain texture */}
                <filter id="terrainTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" seed="2"/>
                    <feColorMatrix type="saturate" values="0.5"/>
                    <feComponentTransfer>
                        <feFuncA type="discrete" tableValues="0 0.2 0.4 0.6"/>
                    </feComponentTransfer>
                </filter>
            </defs>

            {/* Ocean background */}
            <rect width="1000" height="700" fill="url(#oceanGradient)"/>
            <rect width="1000" height="700" fill="url(#waterPattern)"/>

            {/* Ocean depth variations */}
            <ellipse cx="300" cy="400" rx="200" ry="150" fill="#1e40af" opacity="0.2"/>
            <ellipse cx="700" cy="300" rx="180" ry="120" fill="#1e40af" opacity="0.15"/>

            {/* NORTH AMERICA */}
            <path d="M 150 120 Q 120 100 100 130 L 90 180 Q 85 200 100 220 L 110 250 Q 115 270 140 280 L 180 290 Q 200 295 210 280 L 230 250 Q 240 230 250 210 L 270 180 Q 280 160 270 140 L 250 110 Q 240 90 220 85 L 190 80 Q 170 85 150 120 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="2"/>

            {/* Alaska */}
            <path d="M 80 80 L 70 90 Q 65 100 70 110 L 85 115 Q 95 110 100 100 L 95 85 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="1.5"/>

            {/* Terrain detail North America */}
            <path d="M 150 140 Q 180 160 200 180 Q 220 200 230 230"
                  stroke="#84cc16" strokeWidth="2" fill="none" opacity="0.4"/>

            {/* Rocky Mountains */}
            <path d="M 150 140 L 155 135 L 160 142 L 165 135 L 170 145 L 175 138 L 180 150"
                  fill="url(#mountainRangeGrad)" stroke="#78716c" strokeWidth="1"/>

            {/* SOUTH AMERICA */}
            <path d="M 220 340 Q 210 320 200 330 L 190 360 Q 185 380 190 400 L 195 440 Q 200 480 210 510 L 220 540 Q 225 560 240 570 L 255 575 Q 265 575 270 565 L 280 530 Q 285 500 280 470 L 270 430 Q 265 390 260 360 L 250 340 Q 240 330 220 340 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="2"/>

            {/* Andes Mountains */}
            <path d="M 215 360 L 218 355 L 222 362 L 225 357 L 228 365 L 232 358 L 235 368 L 238 360 L 242 370 L 245 515 L 248 520 L 252 515 L 255 525"
                  fill="url(#mountainRangeGrad)" stroke="#78716c" strokeWidth="1.5"/>

            {/* AFRICA */}
            <path d="M 480 260 Q 465 250 455 265 L 450 290 Q 448 310 455 330 L 465 360 Q 470 385 480 410 L 495 440 Q 505 460 520 475 L 535 485 Q 545 490 555 485 L 570 475 Q 580 465 585 450 L 590 420 Q 593 395 590 370 L 585 340 Q 580 315 570 295 L 555 270 Q 545 255 530 250 L 510 248 Q 495 250 480 260 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="2"/>

            {/* Great Rift Valley detail */}
            <line x1="520" y1="320" x2="530" y2="420" stroke="#a16207" strokeWidth="2" opacity="0.3"/>

            {/* EUROPE */}
            <path d="M 480 140 Q 460 135 450 145 L 445 165 Q 443 180 450 195 L 465 210 Q 480 218 495 215 L 515 210 Q 530 200 540 185 L 545 165 Q 545 150 535 140 L 515 135 Q 500 135 480 140 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="2"/>

            {/* Alps */}
            <path d="M 465 175 L 470 170 L 475 177 L 480 172 L 485 180 L 490 175 L 495 185"
                  fill="url(#mountainRangeGrad)" stroke="#78716c" strokeWidth="1"/>

            {/* ASIA */}
            <path d="M 550 120 Q 530 110 520 125 L 515 150 Q 513 170 520 190 L 535 220 Q 550 245 570 260 L 600 275 Q 630 285 660 280 L 700 270 Q 730 260 750 240 L 770 210 Q 780 185 785 160 L 788 130 Q 785 105 770 90 L 745 75 Q 715 65 685 70 L 650 80 Q 620 95 595 115 L 570 125 Q 555 125 550 120 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="2"/>

            {/* Himalayas - more prominent */}
            <path d="M 640 215 L 645 208 L 650 217 L 655 210 L 660 220 L 665 212 L 670 223 L 675 215 L 680 226 L 685 218 L 690 230 L 695 222 L 700 235"
                  fill="url(#mountainRangeGrad)" stroke="#78716c" strokeWidth="2"/>
            <path d="M 642 215 L 644 210 L 647 218 L 650 212 L 653 221 L 656 214 L 660 224 L 664 216 L 668 228 L 672 220 L 676 232"
                  fill="#f8f8f8" stroke="#e5e7eb" strokeWidth="1"/>

            {/* Caucasus Mountains */}
            <path d="M 540 175 L 545 170 L 550 177 L 555 172 L 560 180"
                  fill="url(#mountainRangeGrad)" stroke="#78716c" strokeWidth="1.5"/>

            {/* AUSTRALIA */}
            <path d="M 750 450 Q 735 445 725 455 L 720 475 Q 718 495 725 515 L 740 535 Q 755 545 775 545 L 800 540 Q 820 530 830 515 L 835 490 Q 835 470 825 455 L 810 445 Q 795 440 780 442 L 760 445 Q 750 448 750 450 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="2"/>

            {/* ANTARCTICA (bottom) */}
            <path d="M 50 650 Q 200 630 400 640 Q 600 650 800 640 Q 950 635 1000 645 L 1000 700 L 0 700 L 0 660 Q 25 655 50 650 Z"
                  fill="#f8f8f8" stroke="#e5e7eb" strokeWidth="2"/>

            {/* Antarctic ice details */}
            <path d="M 100 655 Q 300 645 500 655 Q 700 650 900 655"
                  stroke="#dbeafe" strokeWidth="3" fill="none" opacity="0.6"/>

            {/* JAPAN (Island chain) */}
            <path d="M 760 210 Q 755 200 765 195 L 775 200 Q 780 210 775 220 L 770 225 Q 765 225 760 220 Z"
                  fill="url(#landGradient)" stroke="#65a30d" strokeWidth="1"/>
            <ellipse cx="768" cy="235" rx="4" ry="8" fill="url(#landGradient)" stroke="#65a30d" strokeWidth="1"/>

            {/* Mt. Fuji indicator */}
            <circle cx="768" cy="230" r="3" fill="#dc2626" opacity="0.6"/>

            {/* Add terrain texture overlay to all land */}
            <rect width="1000" height="700" fill="url(#landGradient)" opacity="0.1" filter="url(#terrainTexture)" style={{mixBlendMode: 'overlay'}}/>

            {/* Latitude/Longitude grid (subtle) */}
            <g opacity="0.15" stroke="#1e40af" strokeWidth="0.5">
                <line x1="0" y1="175" x2="1000" y2="175"/> {/* Arctic Circle */}
                <line x1="0" y1="250" x2="1000" y2="250"/> {/* Tropic of Cancer */}
                <line x1="0" y1="350" x2="1000" y2="350"/> {/* Equator */}
                <line x1="0" y1="450" x2="1000" y2="450"/> {/* Tropic of Capricorn */}
                <line x1="0" y1="575" x2="1000" y2="575"/> {/* Antarctic Circle */}

                <line x1="250" y1="0" x2="250" y2="700"/>
                <line x1="500" y1="0" x2="500" y2="700"/>
                <line x1="750" y1="0" x2="750" y2="700"/>
            </g>

            {/* Cloud shadows over ocean */}
            <ellipse cx="350" cy="150" rx="80" ry="40" fill="#000" opacity="0.05"/>
            <ellipse cx="650" cy="350" rx="100" ry="50" fill="#000" opacity="0.05"/>
            <ellipse cx="450" cy="550" rx="90" ry="45" fill="#000" opacity="0.05"/>
        </svg>
    );
}
