import React from 'react';

interface CourseCoverProps {
  courseId: string;
  className?: string;
  aspectRatio?: string;
}

export const CourseCover: React.FC<CourseCoverProps> = ({
  courseId,
  className = '',
  aspectRatio = '16/9',
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        aspectRatio,
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#173B3A',
      }}
    >
      {renderCoverSvg(courseId)}
    </div>
  );
};

function renderCoverSvg(courseId: string) {
  switch (courseId) {
    case 'course-nature-role':
    default:
      return (
        <svg viewBox="0 0 640 360" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="c1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#102928" />
              <stop offset="100%" stopColor="#173B3A" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D49B65" />
              <stop offset="100%" stopColor="#B87955" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#c1Grad)" />
          {/* Subtle grid lines */}
          <g stroke="#215150" strokeWidth="1" opacity="0.4">
            <line x1="0" y1="90" x2="640" y2="90" />
            <line x1="0" y1="180" x2="640" y2="180" />
            <line x1="0" y1="270" x2="640" y2="270" />
            <line x1="160" y1="0" x2="160" y2="360" />
            <line x1="320" y1="0" x2="320" y2="360" />
            <line x1="480" y1="0" x2="480" y2="360" />
          </g>
          {/* Architectural Pillars & Center Emblem */}
          <circle cx="320" cy="180" r="95" fill="none" stroke="#2A6361" strokeWidth="2" strokeDasharray="6,4" />
          <path d="M320 100 L390 135 L390 200 Q320 260 320 260 Q320 260 250 200 L250 135 Z" fill="url(#shieldGrad)" stroke="#FAF8F3" strokeWidth="3" />
          <polygon points="320,130 328,150 350,152 333,168 338,190 320,178 302,190 307,168 290,152 312,150" fill="#173B3A" />
          <rect x="230" y="275" width="180" height="24" rx="12" fill="rgba(245, 242, 234, 0.15)" stroke="#DDE5D7" strokeWidth="1" />
          <text x="320" y="291" fill="#F5F2EA" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="sans-serif">
            CORE FOUNDATION • PART 1
          </text>
        </svg>
      );

    case 'course-patrol-observation':
      return (
        <svg viewBox="0 0 640 360" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="c2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E2829" />
              <stop offset="100%" stopColor="#2A3739" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#c2Grad)" />
          {/* Radar Sweep Arc */}
          <circle cx="320" cy="180" r="110" fill="none" stroke="#387A5A" strokeWidth="2" opacity="0.5" />
          <circle cx="320" cy="180" r="70" fill="none" stroke="#387A5A" strokeWidth="2" opacity="0.7" />
          <circle cx="320" cy="180" r="30" fill="none" stroke="#387A5A" strokeWidth="2" opacity="0.9" />
          <line x1="320" y1="50" x2="320" y2="310" stroke="#387A5A" strokeWidth="1.5" opacity="0.6" />
          <line x1="190" y1="180" x2="450" y2="180" stroke="#387A5A" strokeWidth="1.5" opacity="0.6" />
          {/* Patrol Flashlight Beam */}
          <polygon points="320,180 430,90 480,140" fill="rgba(212, 155, 101, 0.25)" />
          {/* Center Compass Marker */}
          <polygon points="320,140 330,175 320,170 310,175" fill="#B44D45" />
          <polygon points="320,220 330,185 320,190 310,185" fill="#F5F2EA" />
          <circle cx="320" cy="180" r="6" fill="#D49B65" />
          <rect x="230" y="275" width="180" height="24" rx="12" fill="rgba(245, 242, 234, 0.15)" stroke="#DDE5D7" strokeWidth="1" />
          <text x="320" y="291" fill="#F5F2EA" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="sans-serif">
            FIELD OPERATIONS • PART 2
          </text>
        </svg>
      );

    case 'course-access-control':
      return (
        <svg viewBox="0 0 640 360" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="c3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#192324" />
              <stop offset="100%" stopColor="#1B3835" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#c3Grad)" />
          {/* Digital Keycard & Biometric Turnstile graphic */}
          <rect x="250" y="100" width="140" height="180" rx="10" fill="#242C2D" stroke="#B87955" strokeWidth="3" />
          {/* Chip */}
          <rect x="275" y="130" width="35" height="30" rx="4" fill="#D49B65" />
          <line x1="285" y1="130" x2="285" y2="160" stroke="#8E633B" strokeWidth="1" />
          <line x1="275" y1="145" x2="310" y2="145" stroke="#8E633B" strokeWidth="1" />
          {/* Cardholder photo */}
          <rect x="275" y="180" width="90" height="8" rx="2" fill="#DDE5D7" />
          <rect x="275" y="196" width="60" height="8" rx="2" fill="#68716D" />
          <circle cx="355" cy="245" r="14" fill="#387A5A" />
          <path d="M349 245 L353 249 L361 241" fill="none" stroke="#FFF" strokeWidth="2" />
          <rect x="230" y="275" width="180" height="24" rx="12" fill="rgba(245, 242, 234, 0.15)" stroke="#DDE5D7" strokeWidth="1" />
          <text x="320" y="291" fill="#F5F2EA" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="sans-serif">
            PERIMETER DEFENSE • PART 3
          </text>
        </svg>
      );

    case 'course-incident-emergency':
      return (
        <svg viewBox="0 0 640 360" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="c4Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#251A18" />
              <stop offset="100%" stopColor="#38211E" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#c4Grad)" />
          {/* Emergency Alert & Rapid Response graphic */}
          <circle cx="320" cy="175" r="80" fill="none" stroke="#B44D45" strokeWidth="3" opacity="0.7" />
          <polygon points="320,110 375,215 265,215" fill="#B44D45" stroke="#FAF8F3" strokeWidth="3" />
          <text x="320" y="195" fill="#FAF8F3" fontSize="42" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            !
          </text>
          <rect x="230" y="275" width="180" height="24" rx="12" fill="rgba(245, 242, 234, 0.15)" stroke="#DDE5D7" strokeWidth="1" />
          <text x="320" y="291" fill="#F5F2EA" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="sans-serif">
            CRITICAL INCIDENTS • PART 4
          </text>
        </svg>
      );

    case 'course-workplace-safety':
      return (
        <svg viewBox="0 0 640 360" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="c5Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#182A22" />
              <stop offset="100%" stopColor="#1E3E2F" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#c5Grad)" />
          {/* Safety Cross / Hardhat graphic */}
          <circle cx="320" cy="175" r="80" fill="#27503E" stroke="#387A5A" strokeWidth="4" />
          {/* Green Safety Cross */}
          <rect x="306" y="125" width="28" height="100" rx="4" fill="#FAF8F3" />
          <rect x="270" y="161" width="100" height="28" rx="4" fill="#FAF8F3" />
          <rect x="230" y="275" width="180" height="24" rx="12" fill="rgba(245, 242, 234, 0.15)" stroke="#DDE5D7" strokeWidth="1" />
          <text x="320" y="291" fill="#F5F2EA" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="sans-serif">
            SAFETY & HAZARD • PART 5
          </text>
        </svg>
      );
  }
}
