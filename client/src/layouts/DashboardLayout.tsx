import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useUser, useClerk, OrganizationSwitcher } from '@clerk/react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Bell,
  Briefcase,
  Settings,
  Search,
  LogOut,
  Zap,
} from 'lucide-react';

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
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <div className="skeleton" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(59,130,246,0.3)',
              }}
            >
              <Zap size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                LegalPulse
              </h1>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}>
                Contract Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 16px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Search contracts...</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-tertiary)',
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
              }}
            >
              ⌘K
            </span>
          </div>
        </div>
        {/* Organization Switcher */}
        <div style={{ padding: '0 16px', marginBottom: 8 }}>
          <OrganizationSwitcher
            hidePersonal={true}
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: {
                  width: '100%',
                },
                organizationSwitcherTrigger: {
                  width: '100%',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  '&:hover': {
                    background: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-accent)',
                  }
                }
              }
            }}
          />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
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
                      height: 20,
                      borderRadius: 3,
                      background: 'var(--color-accent)',
                    }}
                  />
                )}
                <Icon size={18} style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
                {item.label}
                {item.label === 'Alerts' && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: 'var(--color-danger)',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: 9999,
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    3
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img
            src={user?.imageUrl}
            alt="Profile"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || user?.primaryEmailAddress?.emailAddress}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              Legal Team
            </div>
          </div>
          <button 
            className="btn-ghost" 
            onClick={() => signOut()}
            style={{ padding: 6, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', background: 'transparent' }}
          >
            <LogOut size={16} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
