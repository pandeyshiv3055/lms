import { TenantConfig } from '../types';

export const SEED_TENANTS: TenantConfig[] = [
  {
    id: 'tenant-aegis',
    name: 'AEGIS Defense & Security',
    brandTitle: 'AEGIS DEFENSE & SECURITY',
    logoUrl: '/favicon.svg',
    primaryColor: '#173B3A',
    accentColor: '#B87955',
    tagline: 'Enterprise Security & Defense Training Academy',
    domain: 'lms.aegis-security.com',
  },
  {
    id: 'tenant-ranucle',
    name: 'Ranucle Security Solutions',
    brandTitle: 'RANUCLE SECURITY SOLUTIONS',
    logoUrl: '/favicon.svg',
    primaryColor: '#1A2E40',
    accentColor: '#D97706',
    tagline: 'Commercial Physical Security & Guarding Operations',
    domain: 'training.ranucle-security.co.uk',
  },
  {
    id: 'tenant-apex',
    name: 'Apex Guard Services',
    brandTitle: 'APEX GUARD SERVICES',
    logoUrl: '/favicon.svg',
    primaryColor: '#1E293B',
    accentColor: '#059669',
    tagline: 'Critical Infrastructure & Industrial Facility Protection',
    domain: 'portal.apexguard.com',
  },
];

const TENANT_STORAGE_KEY = 'aegis_lms_v1_active_tenant';

class TenantService {
  private activeTenant: TenantConfig;

  constructor() {
    const savedId = localStorage.getItem(TENANT_STORAGE_KEY);
    const found = SEED_TENANTS.find((t) => t.id === savedId);
    this.activeTenant = found || SEED_TENANTS[0];
    this.applyBrandStyles(this.activeTenant);
  }

  public getTenants(): TenantConfig[] {
    return SEED_TENANTS;
  }

  public getActiveTenant(): TenantConfig {
    return this.activeTenant;
  }

  public setActiveTenant(tenantId: string): TenantConfig {
    const found = SEED_TENANTS.find((t) => t.id === tenantId);
    if (found) {
      this.activeTenant = found;
      localStorage.setItem(TENANT_STORAGE_KEY, found.id);
      this.applyBrandStyles(found);
      window.dispatchEvent(new CustomEvent('aegis-tenant-changed', { detail: found }));
      return found;
    }
    return this.activeTenant;
  }

  private applyBrandStyles(tenant: TenantConfig): void {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-brand-primary', tenant.primaryColor);
      document.documentElement.style.setProperty('--color-brand-accent', tenant.accentColor);
    }
  }
}

export const tenantService = new TenantService();
