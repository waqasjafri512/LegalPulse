import { useState, useEffect } from 'react';
import { OrganizationProfile, useOrganization } from '@clerk/react';
import api from '../lib/api';
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
  const [settings, setSettings] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/users/me/settings');
        setSettings(response.data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await api.patch('/users/me/settings', { [key]: value });
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

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
          className="glass-card animate-fade-in-scale" 
          style={{ 
            padding: activeTab === 'team' ? 0 : 32, 
            minHeight: '620px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
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
            <div style={{ width: '100%', height: '100%', flex: 1, display: 'flex' }}>
              <OrganizationProfile 
                appearance={{
                  elements: {
                    rootBox: { width: '100%', maxWidth: '100%', height: '100%', display: 'flex' },
                    card: { 
                      width: '100%', 
                      height: '100%',
                      boxShadow: 'none', 
                      background: 'transparent', 
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'row'
                    },
                    navbar: { 
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRight: '1px solid var(--color-border-subtle)',
                      padding: '20px 0',
                      width: '200px'
                    },
                    navbarButton: {
                      color: 'var(--color-text-tertiary)',
                      borderRadius: 0,
                      '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                    },
                    navbarButton__active: {
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-subtle)',
                      borderLeft: '2px solid var(--color-accent)'
                    },
                    scrollBox: { background: 'transparent' },
                    pageScrollBox: { padding: '32px', background: 'transparent' },
                    headerTitle: { color: 'var(--color-text-primary)', fontSize: '20px', fontWeight: '700' },
                    headerSubtitle: { color: 'var(--color-text-tertiary)' },
                    membersPage__title: { color: 'var(--color-text-primary)' },
                    userPreviewMainIdentifier: { color: 'var(--color-text-primary)' },
                    userPreviewSecondaryIdentifier: { color: 'var(--color-text-tertiary)' },
                    organizationSwitcherTrigger: { color: 'var(--color-text-primary)' },
                  },
                  variables: {
                    colorPrimary: '#818cf8',
                    colorText: '#eef2ff',
                    colorBackground: '#0a0d14',
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

          {activeTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={16} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                  Notification Preferences
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                  Choose how you want to be notified about contract expirations and risk alerts.
                </p>
                
                {[
                  { id: 'email_alerts', title: 'Email Alerts', desc: 'Receive immediate summaries for critical contract events.' },
                  { id: 'slack_integration', title: 'Slack Integration', desc: 'Push risk alerts directly to your legal-alerts channel.' },
                  { id: 'weekly_summary', title: 'Weekly Summary', desc: 'A weekly digest of upcoming renewals and pending reviews.' },
                  { id: 'ai_insights', title: 'AI Insights', desc: 'Get notified when AI discovers unusual patterns in new uploads.' }
                ].map((item) => {
                  const isEnabled = settings[item.id] ?? false;
                  return (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '16px 20px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      borderRadius: 14,
                      border: '1px solid var(--color-border-subtle)'
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{item.desc}</div>
                      </div>
                      <div 
                        onClick={() => updateSetting(item.id, !isEnabled)}
                        style={{ 
                          width: 36, 
                          height: 20, 
                          borderRadius: 10, 
                          background: isEnabled ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          position: 'absolute', 
                          right: isEnabled ? 3 : 'auto', 
                          left: isEnabled ? 'auto' : 3,
                          top: 3,
                          width: 14, 
                          height: 14, 
                          borderRadius: '50%', 
                          background: 'white' 
                        }} />
                      </div>
                    </div>
                  );
                })}
                
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 12 }}>
                   <Save size={14} /> Update Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                  Security & Authentication
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
                <div style={{ padding: 20, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, border: '1px solid var(--color-border-subtle)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Password Management</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
                    Change your password or set up a secondary authentication method.
                  </p>
                  <button className="btn btn-secondary">Update Password</button>
                </div>

                <div style={{ padding: 20, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Multi-Factor Authentication (MFA)</h3>
                      <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 0 }}>
                        Add an extra layer of security to your account using TOTP or SMS.
                      </p>
                    </div>
                    <span className="badge badge-pending">Recommended</span>
                  </div>
                  <button className="btn btn-accent" style={{ marginTop: 16 }}>Enable MFA</button>
                </div>

                <div style={{ padding: 20, background: 'var(--color-accent-subtle)', borderRadius: 16, border: '1px solid var(--color-accent-glow)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Single Sign-On (SSO)</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                    Connect LegalPulse to your corporate Identity Provider (Okta, Azure AD, etc.)
                  </p>
                  <button className="btn btn-ghost" style={{ padding: 0, color: 'var(--color-accent)', fontWeight: 600 }}>
                    Contact Enterprise Support <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
