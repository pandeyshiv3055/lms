import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, User, KeyRound } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('learner@demo.test');
  const [password, setPassword] = useState('Learner123!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if user came from a protected redirect
  const from = (location.state as any)?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        if (from) {
          navigate(from, { replace: true });
        } else if (result.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/learner/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(result.message || 'Invalid authentication credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'learner' | 'admin') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await authService.demoLogin(role);
      if (result.success && result.user) {
        if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/learner/dashboard', { replace: true });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#102928',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #173B3A 0%, #0E1A1A 85%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: '#F5F2EA',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: '#B87955',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            marginBottom: '16px',
          }}
        >
          <Shield size={32} color="#FAF8F3" />
        </div>
        <h1 style={{ fontSize: '28px', color: '#FAF8F3', margin: 0, fontWeight: 800, letterSpacing: '0.04em' }}>
          AEGIS DEFENSE & SECURITY
        </h1>
        <p style={{ color: '#DDE5D7', fontSize: '14px', marginTop: '6px' }}>
          Interactive E-Learning & Operational Readiness LMS
        </p>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid #E5E0D5',
          overflow: 'hidden',
          color: '#242C2D',
        }}
      >
        {/* Card Header Strip */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#173B3A',
            color: '#F5F2EA',
            borderBottom: '1px solid #215150',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', color: '#FAF8F3', margin: 0 }}>Portal Authentication</h2>
            <p style={{ fontSize: '12px', color: '#DDE5D7', margin: '2px 0 0' }}>
              Sign in with your officer or supervisor credentials
            </p>
          </div>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(212, 155, 101, 0.2)',
              border: '1px solid #D49B65',
              fontSize: '11px',
              fontWeight: 700,
              color: '#D49B65',
            }}
          >
            DEMO ACCESS
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* One-Click Quick Demo Access Bar */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#68716D', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Evaluation Access:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('learner')}
                disabled={loading}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F2EA',
                  border: '1px solid #DDE5D7',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                className="btn-ghost"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>
                  <User size={15} color="#B87955" />
                  <span>Demo Learner</span>
                </div>
                <div style={{ fontSize: '11px', color: '#68716D', marginTop: '2px' }}>
                  Officer Alex Taylor
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F2EA',
                  border: '1px solid #DDE5D7',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                className="btn-ghost"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>
                  <KeyRound size={15} color="#173B3A" />
                  <span>Demo Admin</span>
                </div>
                <div style={{ fontSize: '11px', color: '#68716D', marginTop: '2px' }}>
                  Chief Evelyn Cross
                </div>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '18px 0',
              color: '#8E9995',
              fontSize: '12px',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E0D5' }} />
            <span>or sign in manually</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E0D5' }} />
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#FAEEEC',
                border: '1px solid #E8ABA7',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#B44D45',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="emailInput">
                <span>Email Address</span>
                <span style={{ fontSize: '11px', color: '#8E9995' }}>demo format</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8E9995',
                  }}
                />
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="learner@demo.test or admin@demo.test"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="passInput">
                <span>Password</span>
                <span style={{ fontSize: '11px', color: '#8E9995' }}>Learner123! or Admin123!</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8E9995',
                  }}
                />
                <input
                  id="passInput"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Enter Security Training LMS'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Demo Note */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#FAF8F3',
              border: '1px solid #E5E0D5',
              fontSize: '11px',
              color: '#68716D',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#173B3A', marginBottom: '2px' }}>
              <CheckCircle2 size={13} color="#387A5A" />
              <span>Client-Side Demo System</span>
            </div>
            This is an interactive frontend demo featuring persistent local progression and room inspection simulation. No backend server is required.
          </div>
        </div>
      </div>
    </div>
  );
};
