import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  HelpCircle,
  Building,
  Image,
  Users,
  BarChart3,
  Settings,
  Shield,
  ExternalLink,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Film,
  Activity,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { TenantSwitcher } from '../common/TenantSwitcher';

export const AdminShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Course Catalog', path: '/admin/courses', icon: BookOpen },
    { label: 'Lessons & Slides', path: '/admin/lessons', icon: Layers },
    { label: 'Interactive Modules', path: '/admin/interactive-modules', icon: Film },
    { label: 'Room Scenarios', path: '/admin/scenarios', icon: Building },
    { label: 'Assessments', path: '/admin/quizzes', icon: HelpCircle },
    { label: 'SCORM & xAPI Tracking', path: '/admin/tracking', icon: Activity },
    { label: 'Content Library', path: '/admin/content-library', icon: Image },
    { label: 'Learners', path: '/admin/learners', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Compute current page title from path
  const currentItem = navItems.find((item) => isActive(item.path));
  const pageTitle = currentItem ? currentItem.label : 'Admin Portal';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F2EA' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#173B3A',
          color: '#F5F2EA',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #215150',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          flexShrink: 0,
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #215150',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
            }}
          >
            <Shield size={20} color="#FAF8F3" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              AEGIS <span style={{ color: '#D49B65' }}>ADMIN</span>
            </div>
            <div style={{ fontSize: '10px', color: '#DDE5D7', letterSpacing: '0.08em' }}>
              MANAGEMENT CONSOLE
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#FFFFFF' : '#DDE5D7',
                  backgroundColor: active ? 'rgba(184, 121, 85, 0.25)' : 'transparent',
                  borderLeft: active ? '3px solid #D49B65' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} color={active ? '#D49B65' : '#DDE5D7'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: View Learner Portal & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #215150', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/learner/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FAF8F3',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            <span>Switch to Learner View</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              color: '#E8ABA7',
              fontSize: '12px',
              fontWeight: 600,
            }}
            className="btn-ghost"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E0D5',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Breadcrumbs & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', padding: '6px', color: '#242C2D' }}
              className="d-md-none"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={{ fontSize: '12px', color: '#68716D', fontWeight: 500 }}>Administration</span>
            <ChevronRight size={14} color="#A3AFAC" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#173B3A', margin: 0 }}>
              {pageTitle}
            </h2>
          </div>

          {/* Right Header: Demo Mode Pill & Admin Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* White-Label Organization Switcher */}
            <TenantSwitcher compact={false} />

            <div
              style={{
                backgroundColor: 'rgba(212, 155, 101, 0.15)',
                border: '1px solid #D49B65',
                color: '#966142',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#D49B65',
                }}
              />
              <span>DEMO PERSISTENCE ACTIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Administrator'}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #173B3A',
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#173B3A', lineHeight: 1.1 }}>
                  {user?.name || 'Chief Cross'}
                </div>
                <div style={{ fontSize: '11px', color: '#68716D' }}>
                  System Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
