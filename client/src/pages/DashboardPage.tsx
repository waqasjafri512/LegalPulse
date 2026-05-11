import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Upload,
  ArrowRight,
  Zap,
  Shield,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Total Contracts', value: '0', icon: FileText, color: '#3b82f6' },
  { label: 'Expiring in 90 Days', value: '0', icon: Clock, color: '#f59e0b' },
  { label: 'Active Alerts', value: '0', icon: AlertTriangle, color: '#ef4444' },
  { label: 'Matters Open', value: '0', icon: CheckCircle, color: '#10b981' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Welcome back. Here's your legal operations overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card" style={{ padding: '20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-md)',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State — Onboarding */}
      <div
        className="glass-card"
        style={{
          padding: '48px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.04))',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 32px rgba(59,130,246,0.3)',
          }}
        >
          <Upload size={28} color="white" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>
          Upload your first contracts
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 480, margin: '0 auto 24px' }}>
          Drag and drop your contracts to get AI-powered extraction of key terms, automatic expiration alerts, 
          and a complete contract repository — all within minutes.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/upload')}
          style={{ padding: '10px 24px', fontSize: 15 }}
        >
          <Upload size={16} />
          Upload Contracts
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Getting Started Checklist */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>
          Getting Started
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: Shield, label: 'Invite your team', desc: 'Add attorneys and paralegals to your workspace', done: false },
            { icon: Upload, label: 'Upload contracts', desc: 'Drag and drop or import from Google Drive', done: false },
            { icon: Zap, label: 'Review AI extractions', desc: 'Verify and correct AI-extracted key terms', done: false },
            { icon: AlertTriangle, label: 'Set alert preferences', desc: 'Configure email and Slack notifications', done: false },
            { icon: DollarSign, label: 'Create your first matter', desc: 'Track a legal matter from start to finish', done: false },
          ].map((step) => {
            return (
              <div
                key={step.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '2px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {step.done && <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{step.desc}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
