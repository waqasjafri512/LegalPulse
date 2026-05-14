import { useState } from 'react';
import { OrganizationProfile, useOrganization } from '@clerk/react';
import { 
  Building2, 
  User, 
  Bell, 
  Shield, 
  Users, 
  Loader2,
  Settings,
  Sparkles,
  ChevronRight,
  Save,
} from 'lucide-react';

const tabs = [
  { id: 'general', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'profile', label: 'Personal Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & SSO', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading preferences...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Settings size={14} style={{ color: 'var(--color-accent)' }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Configuration
          </span>
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
          Manage your organization, team permissions, and account security
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
        {/* Tab Navigation */}
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    bottom: '25%',
                    width: 3,
                    background: 'var(--color-accent)',
                    borderRadius: 2,
                    boxShadow: '0 0 8px var(--color-accent-glow)'
                  }} />
                )}
                <Icon size={18} style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div 
          className={activeTab === 'team' ? "animate-fade-in-scale" : "glass-card animate-fade-in-scale"} 
          style={{ 
            padding: activeTab === 'team' ? 0 : 32, 
            minHeight: '600px',
            position: 'relative',
            background: activeTab === 'team' ? 'transparent' : 'rgba(16, 20, 28, 0.4)'
          }}
        >
          {activeTab === 'general' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Building2 size={16} style={{ color: 'var(--color-accent)', margin: 'auto' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                  Organization Settings
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                    Company Name
                  </label>
                  <input className="input" placeholder="Acme Corporation" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                    Industry Segment
                  </label>
                  <select className="input">
                    <option>Technology & SaaS</option>
                    <option>Healthcare & Biotech</option>
                    <option>Financial Services</option>
                    <option>Manufacturing</option>
                    <option>Legal Services</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Sparkles size={14} style={{ color: 'var(--color-warning)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Standard Plan</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                    Your organization is currently on the Professional plan. Up to 500 contracts per month.
                  </p>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 0', color: 'var(--color-accent)' }}>
                    View billing history <ChevronRight size={12} />
                  </button>
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div style={{ width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <OrganizationProfile 
                appearance={{
                  elements: {
                    rootBox: { width: '100%', maxWidth: '100%' },
                    card: { 
                      width: '100%', 
                      boxShadow: 'none', 
                      background: 'var(--color-bg-card)', 
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)'
                    },
                    navbar: { display: 'none' },
                    scrollBox: { borderRadius: 0 },
                    pageScrollBox: { padding: '32px' },
                    headerTitle: { color: 'var(--color-text-primary)', fontSize: '20px', fontWeight: '700' },
                    headerSubtitle: { color: 'var(--color-text-tertiary)' },
                    membersPage__title: { color: 'var(--color-text-primary)' },
                    userPreviewMainIdentifier: { color: 'var(--color-text-primary)' },
                    userPreviewSecondaryIdentifier: { color: 'var(--color-text-tertiary)' },
                  },
                  variables: {
                    colorPrimary: '#818cf8',
                    colorText: '#eef2ff',
                    colorBackground: '#10141c',
                    colorInputBackground: '#0a0d14',
                    colorInputText: '#eef2ff',
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <User size={16} style={{ color: 'var(--color-accent)', margin: 'auto' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                  Personal Profile
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Full Name</label>
                  <input className="input" placeholder="Your name" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Primary Email Address</label>
                  <input className="input" placeholder="your@email.com" disabled style={{ opacity: 0.6 }} />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                   <Save size={14} /> Update Profile
                </button>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={28} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>
                Advanced {activeTab} settings are managed via your IDP
              </p>
              <button className="btn btn-secondary">
                 Open Identity Manager <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
