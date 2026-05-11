import { useState } from 'react';
import { OrganizationProfile, useOrganization } from '@clerk/react';
import { 
  Building2, 
  User, 
  Bell, 
  Shield, 
  Users, 
  Loader2,
} from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Manage your organization and account settings
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={16} style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="glass-card" style={{ padding: activeTab === 'team' ? 0 : 28, overflow: 'hidden' }}>
          {activeTab === 'general' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--color-text-primary)' }}>
                Organization Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Company Name
                  </label>
                  <input className="input" placeholder="Acme Corporation" style={{ maxWidth: 400 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Industry
                  </label>
                  <select className="input" style={{ maxWidth: 400 }}>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Manufacturing</option>
                    <option>Other</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <OrganizationProfile 
              appearance={{
                elements: {
                  rootBox: { width: '100%' },
                  card: { width: '100%', boxShadow: 'none', background: 'transparent', border: 'none' },
                  navbar: { display: 'none' },
                  scrollBox: { borderRadius: 0 },
                }
              }}
            />
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--color-text-primary)' }}>Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Full Name</label>
                  <input className="input" placeholder="Your name" style={{ maxWidth: 400 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Email</label>
                  <input className="input" placeholder="your@email.com" style={{ maxWidth: 400 }} />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Save Changes</button>
              </div>
            </div>
          )}

          {/* ... other tabs ... */}
        </div>
      </div>
    </div>
  );
}
