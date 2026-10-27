import React from 'react';

export type OfficerPose = 'celebrating' | 'standing' | 'proud';

interface SecurityOfficerIllustrationProps {
  pose?: OfficerPose;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  badgeLabel?: string;
}

export const SecurityOfficerIllustration: React.FC<SecurityOfficerIllustrationProps> = ({
  pose = 'celebrating',
  size = 320,
  className = '',
  style = {},
  badgeLabel = 'OFFICER',
}) => {
  return (
    <div
      className={`security-officer-illustration ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        maxWidth: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 300 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          {/* Uniform Evergreen / Navy Gradient */}
          <linearGradient id="offJacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3E3D" />
            <stop offset="60%" stopColor="#173B3A" />
            <stop offset="100%" stopColor="#0F2827" />
          </linearGradient>

          {/* Trousers Dark Graphite Gradient */}
          <linearGradient id="offPantsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1C2324" />
            <stop offset="50%" stopColor="#242C2D" />
            <stop offset="100%" stopColor="#171C1D" />
          </linearGradient>

          {/* Gold Insignia Gradient */}
          <linearGradient id="offGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E08B" />
            <stop offset="45%" stopColor="#E0B84C" />
            <stop offset="85%" stopColor="#B87955" />
            <stop offset="100%" stopColor="#8A5328" />
          </linearGradient>

          {/* Skin Tone Gradient */}
          <linearGradient id="offSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5D0A9" />
            <stop offset="65%" stopColor="#E2B88F" />
            <stop offset="100%" stopColor="#C99B72" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id="offHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3C2A21" />
            <stop offset="100%" stopColor="#1A120E" />
          </linearGradient>

          {/* Subtle Halo Glow for Celebration */}
          <radialGradient id="celebrationGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="rgba(224, 184, 76, 0.35)" />
            <stop offset="60%" stopColor="rgba(224, 184, 76, 0.08)" />
            <stop offset="100%" stopColor="rgba(224, 184, 76, 0)" />
          </radialGradient>

          {/* Soft Drop Shadow Filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0F1716" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Celebratory Radial Aura (when celebrating) */}
        {pose === 'celebrating' && (
          <ellipse cx="150" cy="180" rx="140" ry="140" fill="url(#celebrationGlow)" />
        )}

        {/* Ground Floor Shadow */}
        <ellipse cx="150" cy="425" rx="85" ry="12" fill="#14191A" opacity="0.3" />

        {/* Group with Soft Shadow */}
        <g filter="url(#softShadow)">
          {/* LEGS & TROUSERS */}
          <path d="M110 270 L98 405 L132 405 L144 270 Z" fill="url(#offPantsGrad)" />
          <path d="M156 270 L168 405 L202 405 L190 270 Z" fill="url(#offPantsGrad)" />
          {/* Trouser Crease Lines */}
          <line x1="115" y1="280" x2="114" y2="400" stroke="#121717" strokeWidth="1.5" />
          <line x1="185" y1="280" x2="186" y2="400" stroke="#121717" strokeWidth="1.5" />

          {/* POLISHED TACTICAL BOOTS */}
          <path
            d="M92 405 L134 405 C136 405 138 408 138 412 L138 418 C138 422 135 425 131 425 L88 425 C84 425 82 422 84 418 L88 408 C89 406 90 405 92 405 Z"
            fill="#0D1112"
          />
          <path
            d="M166 405 L208 405 C210 405 211 406 212 408 L216 418 C218 422 216 425 212 425 L169 425 C165 425 162 422 162 418 L162 412 C162 408 164 405 166 405 Z"
            fill="#0D1112"
          />
          {/* Boot Toe Cap Highlights */}
          <path d="M86 421 C92 423 102 424 112 423" stroke="#485758" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M188 423 C198 424 208 423 214 421" stroke="#485758" strokeWidth="1.5" strokeLinecap="round" />

          {/* TACTICAL DUTY BELT */}
          <rect x="88" y="252" width="124" height="20" rx="3" fill="#14191A" />
          {/* Equipment Pouches */}
          <rect x="94" y="254" width="16" height="18" rx="2" fill="#242C2D" stroke="#101414" strokeWidth="1" />
          <rect x="190" y="254" width="16" height="18" rx="2" fill="#242C2D" stroke="#101414" strokeWidth="1" />
          {/* Gold Buckle */}
          <rect x="136" y="250" width="28" height="24" rx="3" fill="url(#offGoldGrad)" />
          <rect x="142" y="255" width="16" height="14" rx="1.5" fill="#14191A" />

          {/* OFFICER UNIFORM JACKET / TORSO */}
          <path
            d="M80 130 C80 130 110 120 150 120 C190 120 220 130 220 130 L208 260 L92 260 Z"
            fill="url(#offJacketGrad)"
            stroke="#102524"
            strokeWidth="1.5"
          />

          {/* CRISP SHIRT COLLAR & TIE */}
          <polygon points="135,120 165,120 158,154 142,154" fill="#F5F2EA" />
          {/* Collar Wings */}
          <polygon points="126,120 144,142 140,120" fill="#FFFFFF" />
          <polygon points="174,120 156,142 160,120" fill="#E8E4DA" />
          {/* Polished Black/Dark Necktie */}
          <polygon points="146,134 154,134 157,215 150,230 143,215" fill="#171F20" />
          {/* Gold Tie Clip */}
          <line x1="145" y1="175" x2="155" y2="175" stroke="url(#offGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />

          {/* GOLD EPAULETTES WITH RANK BARS */}
          {/* Left Epaulette */}
          <g>
            <rect x="74" y="125" width="34" height="12" rx="2" fill="#14191A" stroke="#215150" strokeWidth="1" />
            <line x1="80" y1="128" x2="80" y2="134" stroke="url(#offGoldGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="86" y1="128" x2="86" y2="134" stroke="url(#offGoldGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="92" y1="128" x2="92" y2="134" stroke="url(#offGoldGrad)" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Right Epaulette */}
          <g>
            <rect x="192" y="125" width="34" height="12" rx="2" fill="#14191A" stroke="#215150" strokeWidth="1" />
            <line x1="208" y1="128" x2="208" y2="134" stroke="url(#offGoldGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="214" y1="128" x2="214" y2="134" stroke="url(#offGoldGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="220" y1="128" x2="220" y2="134" stroke="url(#offGoldGrad)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* OFFICER CHEST SHIELD / BADGE (Left Chest) */}
          <g transform="translate(100, 155)">
            {/* Shield Outline */}
            <path
              d="M12 0 L24 4 L24 16 C24 24 12 30 12 30 C12 30 0 24 0 16 L0 4 Z"
              fill="url(#offGoldGrad)"
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
            {/* Shield Star Inset */}
            <circle cx="12" cy="14" r="5" fill="#173B3A" />
            <polygon
              points="12,10 13.5,13 16.5,13.5 14,15.5 15,18.5 12,17 9,18.5 10,15.5 7.5,13.5 10.5,13"
              fill="url(#offGoldGrad)"
            />
          </g>

          {/* NAME PLATE / TENANT IDENTIFIER (Right Chest) */}
          <g transform="translate(164, 162)">
            <rect x="0" y="0" width="36" height="12" rx="1.5" fill="#14191A" stroke="url(#offGoldGrad)" strokeWidth="0.8" />
            <text
              x="18"
              y="9"
              fill="#FAF8F3"
              fontSize="6.5"
              fontWeight="800"
              fontFamily="var(--font-sans, sans-serif)"
              letterSpacing="0.08em"
              textAnchor="middle"
            >
              {badgeLabel}
            </text>
          </g>

          {/* UNIFORM BUTTONS */}
          <circle cx="150" cy="195" r="3.5" fill="url(#offGoldGrad)" />
          <circle cx="150" cy="225" r="3.5" fill="url(#offGoldGrad)" />

          {/* NECK */}
          <polygon points="138,98 162,98 165,124 135,124" fill="url(#offSkinGrad)" />
          {/* Neck Shadow */}
          <path d="M136 112 Q150 122 164 112 L165 124 L135 124 Z" fill="#C99B72" opacity="0.4" />

          {/* HEAD & FACE */}
          <ellipse cx="150" cy="80" rx="26" ry="30" fill="url(#offSkinGrad)" />
          {/* Ears */}
          <ellipse cx="123" cy="82" rx="4" ry="7" fill="url(#offSkinGrad)" />
          <ellipse cx="177" cy="82" rx="4" ry="7" fill="url(#offSkinGrad)" />

          {/* PROFESSIONAL HAIR */}
          <path
            d="M124 72 C124 50 140 45 150 45 C160 45 176 50 176 72 C176 76 172 65 168 62 C160 56 140 56 132 62 C128 65 124 76 124 72 Z"
            fill="url(#offHairGrad)"
          />
          {/* Sideburns */}
          <path d="M124 72 L125 82 L127 82 L127 72 Z" fill="url(#offHairGrad)" />
          <path d="M176 72 L175 82 L173 82 L173 72 Z" fill="url(#offHairGrad)" />

          {/* EYEBROWS */}
          <path d="M136 70 Q142 67 146 71" stroke="#2B1E18" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M154 71 Q158 67 164 70" stroke="#2B1E18" strokeWidth="2.2" strokeLinecap="round" />

          {/* EYES (Alert & Confident) */}
          <ellipse cx="141" cy="77" rx="3.5" ry="3" fill="#1C2424" />
          <circle cx="140" cy="76" r="1.2" fill="#FFFFFF" />
          <ellipse cx="159" cy="77" rx="3.5" ry="3" fill="#1C2424" />
          <circle cx="158" cy="76" r="1.2" fill="#FFFFFF" />

          {/* NOSE */}
          <path d="M150 75 L148 85 L153 85" stroke="#C99B72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* WARM, CELEBRATORY SMILE */}
          {pose === 'celebrating' ? (
            <g>
              <path
                d="M141 91 Q150 102 159 91"
                fill="#8E463E"
                stroke="#6B2F2A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M143 92 Q150 96 157 92" fill="#FFFFFF" />
            </g>
          ) : (
            <path
              d="M142 93 Q150 99 158 93"
              fill="none"
              stroke="#A86E4B"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* ARMS & HAND POSES */}
          {pose === 'celebrating' ? (
            /* CELEBRATION POSE: Right Arm Raised Giving Thumbs Up! Left Arm at side */
            <g>
              {/* Left Arm (Relaxed at side) */}
              <path
                d="M82 135 L54 210 L68 235 L90 160 Z"
                fill="url(#offJacketGrad)"
                stroke="#102524"
                strokeWidth="1"
              />
              {/* Left Hand */}
              <circle cx="70" cy="242" r="9" fill="url(#offSkinGrad)" />

              {/* Right Arm (Raised celebrating with thumbs up!) */}
              <path
                d="M218 135 C232 150 250 170 255 190 L238 200 L204 155 Z"
                fill="url(#offJacketGrad)"
                stroke="#102524"
                strokeWidth="1"
              />
              {/* Forearm bent upwards */}
              <path
                d="M255 190 C260 175 262 155 264 135 L246 130 C244 150 242 170 238 200 Z"
                fill="url(#offJacketGrad)"
                stroke="#102524"
                strokeWidth="1"
              />
              {/* Gold Cuff on sleeve */}
              <rect x="246" y="130" width="18" height="6" rx="1" fill="url(#offGoldGrad)" />

              {/* HAND GIVING ENTHUSIASTIC THUMBS UP */}
              <g transform="translate(244, 96)">
                {/* Fist base */}
                <circle cx="12" cy="26" r="11" fill="url(#offSkinGrad)" />
                {/* Curled Fingers */}
                <rect x="3" y="19" width="16" height="5" rx="2.5" fill="#C99B72" />
                <rect x="3" y="24" width="17" height="5" rx="2.5" fill="#E2B88F" />
                <rect x="3" y="29" width="16" height="5" rx="2.5" fill="#C99B72" />
                {/* Proud Extended Thumb */}
                <path
                  d="M13 19 C13 19 14 6 15 3 C16 0 20 0 20 3 C20 7 19 18 19 19 Z"
                  fill="url(#offSkinGrad)"
                  stroke="#C99B72"
                  strokeWidth="0.8"
                />
                {/* Thumb Nail Highlight */}
                <ellipse cx="17" cy="4" rx="2" ry="3" fill="#FAF8F3" opacity="0.6" />
              </g>

              {/* GOLDEN CELEBRATION SPARKLES NEAR THUMB */}
              <g transform="translate(268, 86)">
                {/* 4-point sparkle */}
                <polygon points="10,0 12,7 19,10 12,13 10,20 8,13 1,10 8,7" fill="#F9E08B" />
                <circle cx="10" cy="10" r="2" fill="#FFFFFF" />
              </g>
              <g transform="translate(240, 75)">
                <polygon points="6,0 7,4 11,6 7,8 6,12 5,8 1,6 5,4" fill="#E0B84C" />
              </g>
              <g transform="translate(282, 115)">
                <polygon points="5,0 6,3 9,5 6,7 5,10 4,7 1,5 4,3" fill="#D49B65" />
              </g>
            </g>
          ) : (
            /* STANDING / PROUD POSE: Both Arms at Side / Professional Duty Stance */
            <g>
              {/* Left Arm */}
              <path
                d="M82 135 L56 220 L74 245 L92 165 Z"
                fill="url(#offJacketGrad)"
                stroke="#102524"
                strokeWidth="1"
              />
              <circle cx="76" cy="252" r="9" fill="url(#offSkinGrad)" />

              {/* Right Arm */}
              <path
                d="M218 135 L244 220 L226 245 L208 165 Z"
                fill="url(#offJacketGrad)"
                stroke="#102524"
                strokeWidth="1"
              />
              <circle cx="224" cy="252" r="9" fill="url(#offSkinGrad)" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
