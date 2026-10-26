import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Award, User as UserIcon, LogOut, ChevronDown, Bell } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { TenantSwitcher } from '../common/TenantSwitcher';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header
      style={{
        backgroundColor: '#173B3A',
        borderBottom: '1px solid #215150',
        color: '#F5F2EA',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Left: Brand Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link
            to="/learner/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#F5F2EA',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#B87955',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Shield size={20} color="#FAF8F3" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '0.05em', lineHeight: 1.1 }}>
                AEGIS <span style={{ color: '#D49B65', fontWeight: 600 }}>SEC-TRAIN</span>
              </div>
              <div style={{ fontSize: '10px', color: '#DDE5D7', letterSpacing: '0.08em' }}>
                PROFESSIONAL LMS
              </div>
            </div>
          </Link>

          {/* Primary Learner Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/learner/dashboard"
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive('/learner/dashboard') ? '#FFFFFF' : '#DDE5D7',
                backgroundColor: isActive('/learner/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Dashboard
            </Link>

            <Link
              to="/learner/courses"
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive('/learner/courses') ? '#FFFFFF' : '#DDE5D7',
                backgroundColor: isActive('/learner/courses') ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BookOpen size={16} />
              <span>Courses</span>
            </Link>

            <Link
              to="/learner/progress"
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive('/learner/progress') ? '#FFFFFF' : '#DDE5D7',
                backgroundColor: isActive('/learner/progress') ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={16} />
              <span>My Qualifications</span>
            </Link>
          </nav>
        </div>

        {/* Right: Actions, Demo Badge & Profile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Notifications button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DDE5D7',
                backgroundColor: 'rgba(255,255,255,0.06)',
                position: 'relative',
              }}
              aria-label="View notifications"
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#B87955',
                }}
              />
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '300px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  border: '1px solid #E5E0D5',
                  padding: '16px',
                  color: '#242C2D',
                  zIndex: 60,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '8px' }}>
                  Training Notifications
                </div>
                <div style={{ fontSize: '12px', padding: '8px', backgroundColor: '#F5F2EA', borderRadius: '4px' }}>
                  <strong>Facility 04 Inspection:</strong> Complete the interactive room inspection simulation in Course 101 to earn your Safety Observer badge.
                </div>
              </div>
            )}
          </div>

          {/* Quick Admin Portal Switcher if user is admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="btn btn-sm"
              style={{
                backgroundColor: '#B87955',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
            >
              Admin Console
            </Link>
          )}

          {/* White-Label Organization Switcher */}
          <TenantSwitcher compact={true} />

          {/* User Profile Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Officer'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #B87955',
                }}
              />
              <div style={{ textAlign: 'left', display: 'none' }} className="d-md-block">
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAF8F3', lineHeight: 1.1 }}>
                  {user?.name || 'Officer'}
                </div>
                <div style={{ fontSize: '11px', color: '#DDE5D7' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Active Learner'}
                </div>
              </div>
              <ChevronDown size={14} color="#DDE5D7" />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '220px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #E5E0D5',
                  padding: '8px 0',
                  color: '#242C2D',
                  zIndex: 60,
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #E5E0D5' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#68716D' }}>
                    {user?.email}
                  </div>
                </div>

                <Link
                  to="/learner/profile"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#242C2D',
                    textDecoration: 'none',
                  }}
                  className="btn-ghost"
                >
                  <UserIcon size={16} />
                  <span>Officer Profile</span>
                </Link>

                <div style={{ borderTop: '1px solid #E5E0D5', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#B44D45',
                    textAlign: 'left',
                  }}
                  className="btn-ghost"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
