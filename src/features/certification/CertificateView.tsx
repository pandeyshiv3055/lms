import React, { useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Shield, CheckCircle2, Award, Download, X } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { tenantService } from '../../services/tenant.service';
import { AwardShieldBadge } from '../../assets/illustrations/AwardShieldBadge';

interface CertificateViewProps {
  courseIdProp?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  courseIdProp,
  isModal = false,
  onClose,
}) => {
  const { courseId: paramCourseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const activeCourseId = courseIdProp || paramCourseId || 'course-nature-role';
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const course = courseService.getCourseById(activeCourseId);
  const activeTenant = tenantService.getActiveTenant();
  const progress = progressService.getProgress(userId);
  const courseProgress = progress.courseProgress[activeCourseId];

  // Retrieve the latest passed attempt for this course's assessment
  const attempts = progress.quizAttempts['assessment-nature-role'] || [];
  const latestPassedAttempt = [...attempts].reverse().find((a) => a.passed) || attempts[attempts.length - 1];

  // Resolve completion date if available from course progress or attempt
  const completionDate =
    courseProgress?.completedAt || latestPassedAttempt?.timestamp || new Date().toISOString();
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Certificate Identifier derived from real course code, learner id, and year
  const certYear = new Date(completionDate).getFullYear();
  const certSerial = `${activeTenant.brandTitle.split(' ')[0]}-${course?.code || 'SEC101'}-${userId.replace('user-', '').toUpperCase()}-${certYear}`;

  const handlePrint = () => {
    window.print();
  };

  if (!course) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#68716D' }}>
        <h2>Course not found</h2>
        <Link to="/learner/progress" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Progress
        </Link>
      </div>
    );
  }

  const certificateCard = (
    <div
      className="printable-certificate-document"
      style={{
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        border: '3px double #C49B45',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(24, 30, 31, 0.25)',
        position: 'relative',
        padding: '48px 56px',
        color: '#20343A',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Ornate Double Border Ring */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          bottom: '12px',
          border: '1.5px solid #E0B84C',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          border: '1px dashed #D49B65',
          borderRadius: '6px',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Decorative Corner Embellishments */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '28px',
          height: '28px',
          borderTop: '3px solid #17365D',
          borderLeft: '3px solid #17365D',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '28px',
          height: '28px',
          borderTop: '3px solid #17365D',
          borderRight: '3px solid #17365D',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          width: '28px',
          height: '28px',
          borderBottom: '3px solid #17365D',
          borderLeft: '3px solid #17365D',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          width: '28px',
          height: '28px',
          borderBottom: '3px solid #17365D',
          borderRight: '3px solid #17365D',
        }}
      />

      {/* Subtle Security Seal Watermark in Center Background */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.035,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <AwardShieldBadge id="badge-course-completion" size={460} showGlow={false} />
      </div>

      {/* Content wrapper relative to watermark */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Organization / Tenant Header */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#17365D',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            <Shield size={18} color="#B87955" />
            <span>{activeTenant.brandTitle}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#68777D', letterSpacing: '0.05em' }}>
            {activeTenant.tagline}
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading, "Manrope", sans-serif)',
              fontSize: '30px',
              fontWeight: 800,
              color: '#17365D',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}
          >
            Certificate of Qualification
          </h1>
          <div
            style={{
              width: '120px',
              height: '3px',
              background: 'linear-gradient(90deg, #17365D 0%, #E0B84C 50%, #B87955 100%)',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Recipient Statement */}
        <div style={{ fontSize: '14px', color: '#68777D', fontStyle: 'italic', marginBottom: '8px' }}>
          This is to formally certify that
        </div>

        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#173B3A',
            letterSpacing: '-0.01em',
            borderBottom: '1.5px solid #E0B84C',
            display: 'inline-block',
            paddingBottom: '4px',
            marginBottom: '16px',
          }}
        >
          {user?.name || 'Officer Alex Taylor'}
        </div>

        <div
          style={{
            fontSize: '14px',
            color: '#68777D',
            maxWidth: '680px',
            margin: '0 auto 16px',
            lineHeight: 1.6,
          }}
        >
          has successfully satisfied all curriculum standards, practical facility inspection simulations,
          and evaluative statutory requirements for the accredited certification course:
        </div>

        {/* Course Title & Code */}
        <div
          style={{
            backgroundColor: '#FAF8F3',
            border: '1.5px solid #E5E0D5',
            borderRadius: '8px',
            padding: '14px 24px',
            maxWidth: '640px',
            margin: '0 auto 28px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#B87955', letterSpacing: '0.08em' }}>
            ACCREDITED CURRICULUM UNIT • {course.code}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#17365D', marginTop: '2px' }}>
            {course.title}
          </div>
        </div>

        {/* Award Badge, Score, and Signatures Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 1fr',
            gap: '20px',
            alignItems: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid #E5E0D5',
          }}
        >
          {/* Left Signature: Director */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'serif',
                fontSize: '20px',
                color: '#17365D',
                fontStyle: 'italic',
                marginBottom: '4px',
              }}
            >
              Chief Insp. Evelyn Cross
            </div>
            <div style={{ width: '160px', height: '1px', backgroundColor: '#68777D', margin: '0 auto 6px' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#20343A' }}>
              Director of Training & Standards
            </div>
            <div style={{ fontSize: '10px', color: '#68777D' }}>{activeTenant.name}</div>
          </div>

          {/* Center Official Gold Shield Seal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AwardShieldBadge id="badge-course-completion" size={88} showGlow={false} />
            <div
              style={{
                fontSize: '9px',
                fontWeight: 800,
                color: '#8A5328',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              OFFICIAL VERIFIED
            </div>
          </div>

          {/* Right Signature: Academic Registrar & Date */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'serif',
                fontSize: '20px',
                color: '#17365D',
                fontStyle: 'italic',
                marginBottom: '4px',
              }}
            >
              Verification Registry
            </div>
            <div style={{ width: '160px', height: '1px', backgroundColor: '#68777D', margin: '0 auto 6px' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#20343A' }}>
              Issued: {formattedDate}
            </div>
            <div style={{ fontSize: '10px', color: '#68777D' }}>
              {latestPassedAttempt ? `Exam Score: ${latestPassedAttempt.scorePercentage}%` : 'Certified Status'}
            </div>
          </div>
        </div>

        {/* Certificate Identifier Serial */}
        <div
          style={{
            marginTop: '28px',
            fontSize: '10px',
            color: '#8E9995',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          CREDENTIAL ID: {certSerial}
        </div>
      </div>
    </div>
  );

  /* Modal Wrapper */
  if (isModal) {
    return (
      <div
        className="certificate-modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 22, 0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 9999,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
          }}
        >
          {/* Top Modal Controls (Hidden in print) */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FAF8F3',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#E0B84C" />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>
                Official Printable Security Certificate
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-accent"
                id="btn-print-certificate-modal"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>Print / Save as PDF</span>
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  id="btn-close-certificate-modal"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#FAF8F3',
                    padding: '8px',
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Certificate Card */}
          {certificateCard}
        </div>
      </div>
    );
  }

  /* Standalone Full-Page View */
  return (
    <div
      className="container animate-fade-in"
      style={{ padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Top Navigation & Action Header (Hidden in Print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/learner/progress')}
          className="btn btn-secondary btn-sm"
          id="btn-back-to-progress"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Progress</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-accent btn-lg"
            id="btn-print-certificate"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(184, 121, 85, 0.35)',
            }}
          >
            <Printer size={18} />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Certificate */}
      {certificateCard}
    </div>
  );
};
