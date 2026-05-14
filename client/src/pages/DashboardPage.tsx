import { useState, useEffect } from 'react';
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
  Loader2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import api from '../lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const [statsData, setStatsData] = useState({
    totalContracts: 0,
    expiringContracts: 0,
    activeAlerts: 0,
    openMatters: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!isLoaded || !isSignedIn) return;

      try {
        const response = await api.get('/stats');
        setStatsData(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [isLoaded, isSignedIn]);

  const stats = [
    {
      label: 'Total Contracts',
      value: statsData.totalContracts,
      icon: FileText,
      color: '#818cf8',
      bg: 'rgba(129,140,248,0.08)',
    },
    {
      label: 'Expiring Soon',
      value: statsData.expiringContracts,
      icon: Clock,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.08)',
    },
    {
      label: 'Active Alerts',
      value: statsData.activeAlerts,
      icon: AlertTriangle,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
    },
    {
      label: 'Open Matters',
      value: statsData.openMatters,
      icon: TrendingUp,
      color: '#34d399',
      bg: 'rgba(52,211,153,0.08)',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          marginBottom: 32,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Overview
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
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            Your legal operations at a glance
          </p>
        </div>
        {isLoading && (
          <Loader2
            className="animate-spin"
            size={18}
            color="var(--color-text-muted)"
          />
        )}
      </div>

      {/* Stats Grid */}
      <div
        className="stagger-children"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="stat-card animate-fade-in"
              style={{
                padding: '22px 22px 20px',
                '--accent-color': stat.color,
              } as any}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                  }}
                >
                  {stat.label}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={17} style={{ color: stat.color }} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                {isLoading ? (
                  <div className="skeleton" style={{ width: 48, height: 34, borderRadius: 6 }} />
                ) : (
                  stat.value
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State — Onboarding */}
      {!isLoading && statsData.totalContracts === 0 && (
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '56px 48px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(34,211,238,0.02))',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 300,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)',
            }}
          />

          <div
            className="animate-float"
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 48px rgba(99,102,241,0.3)',
            }}
          >
            <Upload size={30} color="white" />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 10,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Upload your first contracts
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-tertiary)',
              maxWidth: 460,
              margin: '0 auto 28px',
              lineHeight: 1.7,
            }}
          >
            AI-powered extraction of key terms, automatic expiration alerts,
            and a complete contract repository — all within minutes.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/upload')}
            style={{ padding: '11px 28px', fontSize: 14 }}
          >
            <Upload size={15} />
            Upload Contracts
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Getting Started Checklist */}
      <div className="glass-card animate-fade-in" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
          }}
        >
          <Zap size={15} style={{ color: 'var(--color-accent)' }} />
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Getting Started
          </h3>
        </div>
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            {
              icon: Shield,
              label: 'Invite your team',
              desc: 'Add attorneys and paralegals to your workspace',
              done: false,
            },
            {
              icon: Upload,
              label: 'Upload contracts',
              desc: 'Drag and drop or import from Google Drive',
              done: statsData.totalContracts > 0,
            },
            {
              icon: Zap,
              label: 'Review AI extractions',
              desc: 'Verify and correct AI-extracted key terms',
              done: statsData.totalContracts > 0,
            },
            {
              icon: AlertTriangle,
              label: 'Set alert preferences',
              desc: 'Configure email and Slack notifications',
              done: false,
            },
            {
              icon: DollarSign,
              label: 'Create your first matter',
              desc: 'Track a legal matter from start to finish',
              done: statsData.openMatters > 0,
            },
          ].map((step) => {
            return (
              <div
                key={step.label}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '13px 16px',
                  borderRadius: 10,
                  background: step.done ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${step.done ? 'rgba(52,211,153,0.1)' : 'var(--color-border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: step.done ? 'none' : '1.5px solid var(--color-border-card)',
                    background: step.done ? 'rgba(52,211,153,0.12)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {step.done ? (
                    <CheckCircle size={16} style={{ color: '#34d399' }} />
                  ) : (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--color-border-card)',
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: step.done ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                      textDecoration: step.done ? 'line-through' : 'none',
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {step.desc}
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.15s' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
