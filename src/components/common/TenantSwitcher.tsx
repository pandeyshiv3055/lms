import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { tenantService, SEED_TENANTS } from '../../services/tenant.service';
import { TenantConfig } from '../../types';

export const TenantSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [activeTenant, setActiveTenant] = useState<TenantConfig>(tenantService.getActiveTenant());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      if (e.detail) {
        setActiveTenant(e.detail);
      }
    };
    window.addEventListener('aegis-tenant-changed', handleTenantChange);
    return () => window.removeEventListener('aegis-tenant-changed', handleTenantChange);
  }, []);

  const handleSelect = (tenantId: string) => {
    const updated = tenantService.setActiveTenant(tenantId);
    setActiveTenant(updated);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '4px 8px' : '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FAF8F3',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Switch Multi-Tenant Brand"
      >
        <Building2 size={14} color="#D49B65" />
        <span style={{ maxWidth: compact ? '110px' : '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeTenant.name.split(' ')[0]} ({activeTenant.id.replace('tenant-', '')})
        </span>
        <ChevronDown size={13} color="#DDE5D7" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '260px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            border: '1px solid #E5E0D5',
            padding: '8px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8E9995',
              padding: '6px 10px',
              borderBottom: '1px solid #ECE7DE',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Select Organization / White-Label
          </div>

          {SEED_TENANTS.map((t) => {
            const isSelected = t.id === activeTenant.id;
            return (
              <div
                key={t.id}
                onClick={() => handleSelect(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#FAF8F3' : 'transparent',
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? '#D49B65' : 'transparent'}`,
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: t.primaryColor,
                      border: `2px solid ${t.accentColor}`,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#173B3A' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#68716D' }}>
                      {t.domain}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={14} color="#387A5A" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
