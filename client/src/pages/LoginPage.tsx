import { SignIn } from '@clerk/react';
import { Scale } from 'lucide-react';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          left: '-15%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07), transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-15%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.04), transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.03), transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid overlay subtle */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          width: 440,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1)',
            }}
          >
            <Scale size={26} color="white" strokeWidth={2.2} />
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 6,
            }}
          >
            <span className="gradient-text">LegalPulse</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', letterSpacing: '0.02em' }}>
            AI-powered contract intelligence platform
          </p>
        </div>

        {/* Clerk Sign In */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#10141c',
              colorText: '#eef2ff',
              colorInputBackground: '#0a0d14',
              colorInputText: '#eef2ff',
              borderRadius: '10px',
              fontFamily: "'Inter', sans-serif",
            },
            elements: {
              card: 'glass-card',
              headerTitle: 'text-primary',
              headerSubtitle: 'text-tertiary',
              socialButtonsBlockButton: 'btn-secondary',
              formButtonPrimary: 'btn-primary',
              footerActionLink: 'text-accent',
            },
          }}
        />

        {/* Trust indicator */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-success)',
              boxShadow: '0 0 8px rgba(52,211,153,0.4)',
            }}
          />
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.03em' }}>
            End-to-end encrypted · SOC 2 compliant · Your data stays yours
          </p>
        </div>
      </div>
    </div>
  );
}
