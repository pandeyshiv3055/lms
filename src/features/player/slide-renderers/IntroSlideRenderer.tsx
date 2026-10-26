import React from 'react';
import { Slide } from '../../../types';
import { Shield, CheckCircle2 } from 'lucide-react';

interface SlideRendererProps {
  slide: Slide;
  onInteractionComplete?: () => void;
}

export const IntroSlideRenderer: React.FC<SlideRendererProps> = ({ slide }) => {
  const { content } = slide;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '36px 40px',
        maxWidth: '840px',
        margin: '0 auto',
        height: '100%',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: '#B87955',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(184, 121, 85, 0.25)',
          marginBottom: '20px',
        }}
      >
        <Shield size={36} color="#FAF8F3" />
      </div>

      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#D49B65',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        {content.subtitle || 'Instructional Unit'}
      </div>

      <h1
        style={{
          fontSize: '32px',
          color: '#173B3A',
          marginBottom: '16px',
          lineHeight: 1.25,
        }}
      >
        {content.headline || slide.title}
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          color: '#242C2D',
          fontSize: '16px',
          lineHeight: 1.6,
          maxWidth: '680px',
          marginBottom: '28px',
        }}
      >
        {content.bodyParagraphs?.map((p, i) => (
          <p key={i} style={{ margin: 0 }}>{p}</p>
        ))}
      </div>

      {content.instructorName && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#FAF8F3',
            border: '1px solid #E5E0D5',
            padding: '8px 18px',
            borderRadius: '999px',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#173B3A' }}>
              Instructor: {content.instructorName}
            </div>
            {content.instructorRole && (
              <div style={{ fontSize: '11px', color: '#68716D' }}>
                {content.instructorRole}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const InstructorSlideRenderer: React.FC<SlideRendererProps> = ({ slide }) => {
  const { content } = slide;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '36px',
        padding: '36px 40px',
        height: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
      className="animate-fade-in"
    >
      {/* Instructor Graphic Card on Left */}
      <div
        style={{
          flex: '0 0 260px',
          backgroundColor: '#FAF8F3',
          border: '1.5px solid #E5E0D5',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#173B3A',
            border: '3px solid #B87955',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
            alt="Senior Instructor"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ fontWeight: 800, fontSize: '15px', color: '#173B3A' }}>
          {content.instructorName || 'Senior Instructor Vance'}
        </div>
        <div style={{ fontSize: '12px', color: '#B87955', fontWeight: 600, marginTop: '2px' }}>
          {content.instructorRole || 'Lead Tactical Instructor'}
        </div>
        <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '6px' }}>
          AEGIS Training Division
        </div>
      </div>

      {/* Main Instructional Content on Right */}
      <div style={{ flex: 1, minWidth: '320px' }}>
        <h2 style={{ fontSize: '26px', color: '#173B3A', marginBottom: '16px' }}>
          {content.headline || slide.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#242C2D', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
          {content.bodyParagraphs?.map((p, i) => (
            <p key={i} style={{ margin: 0 }}>{p}</p>
          ))}
        </div>

        {content.bulletPoints && content.bulletPoints.length > 0 && (
          <div
            style={{
              backgroundColor: '#FAF8F3',
              borderRadius: '8px',
              border: '1px solid #E5E0D5',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#173B3A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Key Operational Directives:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#242C2D', fontSize: '13.5px', lineHeight: 1.6 }}>
              {content.bulletPoints.map((item, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
