import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useUser, useClerk, OrganizationSwitcher, useOrganization } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Bell,
  Briefcase,
  Settings,
  Search,
  LogOut,
  Scale,
  Command,
} from 'lucide-react';
import api from '../lib/api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/contracts', label: 'Contracts', icon: FileText },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/matters', label: 'Matters', icon: Briefcase },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { isLoaded, isSignedIn, user } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { signOut } = useClerk();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts');
      return response.data;
    },
    enabled: !!organization,
  });

  const unreadCount = alerts.filter((a: any) => !a.is_read).length;

  if (!isLoaded || !isOrgLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-primary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse-glow 2s infinite',
            }}
          >
            <Scale size={22} color="white" />
          </div>
          <div className="skeleton" style={{ width: 120, height: 8, borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // If no organization is selected, force selection
  if (!organization) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-bg-primary)',
          padding: 20,
        }}
      >
        <div className="glass-card animate-fade-in" style={{ padding: '40px', maxWidth: 480, textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'var(--color-accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Scale size={32} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Welcome to LegalPulse
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-tertiary)', marginBottom: 32, lineHeight: 1.6 }}>
            To get started, please select an organization or create a new one. This ensures your data remains isolated and secure.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <OrganizationSwitcher
              hidePersonal={true}
              afterCreateOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
              appearance={{
                elements: {
                  rootBox: { width: '100%' },
                  organizationSwitcherTrigger: {
                    width: '100%',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-card)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: 'var(--color-text-primary)',
                    fontSize: '15px',
                    '&:hover': {
                      background: 'var(--color-bg-elevated)',
                    },
                  },
                },
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <button className="btn btn-ghost" onClick={() => signOut()}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--color-accent), #818cf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Scale size={18} color="white" />
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', display: 'block' }}>
                LegalPulse
              </span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contract Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Search Placeholder */}
        <div style={{ padding: '14px 14px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Search size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)', flex: 1 }}>
              Search...
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 10,
                color: 'var(--color-text-muted)',
                background: 'rgba(255,255,255,0.04)',
                padding: '2px 6px',
                borderRadius: 5,
                border: '1px solid var(--color-border)',
              }}
            >
              <Command size={9} />K
            </div>
          </div>
        </div>

        {/* Organization Switcher */}
        <div style={{ padding: '0 14px', marginBottom: 6 }}>
          <OrganizationSwitcher
            hidePersonal={true}
            afterCreateOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            appearance={{
              elements: {
                rootBox: { width: '100%' },
                organizationSwitcherTrigger: {
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: 'var(--color-text-primary)',
                  fontSize: '12.5px',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                },
              },
            }}
          />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '8px 14px 6px',
            }}
          >
            Menu
          </div>
          {navItems.map((item) => {
            const isActive =
              item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 18,
                      borderRadius: 3,
                      background: 'linear-gradient(180deg, #818cf8, #6366f1)',
                      boxShadow: '0 0 8px rgba(129,140,248,0.4)',
                    }}
                  />
                )}
                <Icon
                  size={17}
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                    transition: 'color 0.2s',
                  }}
                />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.label === 'Alerts' && unreadCount > 0 && (
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #f87171)',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: 9999,
                      minWidth: 18,
                      textAlign: 'center',
                      boxShadow: '0 0 8px rgba(239,68,68,0.3)',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile section */}
        <div
          style={{
            padding: '14px 14px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={user?.imageUrl}
              alt="Profile"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#34d399',
                border: '2px solid var(--color-bg-secondary)',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.fullName || user?.primaryEmailAddress?.emailAddress}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Legal Team</div>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              padding: 7,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <LogOut size={15} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
