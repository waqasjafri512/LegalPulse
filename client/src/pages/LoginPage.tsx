import { SignIn } from '@clerk/react';
import { Zap } from 'lucide-react';

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
      {/* Background gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="animate-fade-in" style={{ width: 420, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 32px rgba(59,130,246,0.3)',
            }}
          >
            <Zap size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            LegalPulse
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            AI-powered contract intelligence
          </p>
        </div>

        {/* Clerk Sign In */}
        <SignIn 
          appearance={{
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#161d2f',
              colorText: '#f1f5f9',
              colorInputBackground: '#0d1220',
              colorInputText: '#f1f5f9',
              borderRadius: '8px',
            },
            elements: {
              card: 'glass-card',
              headerTitle: 'text-primary',
              headerSubtitle: 'text-tertiary',
              socialButtonsBlockButton: 'btn-secondary',
              formButtonPrimary: 'btn-primary',
              footerActionLink: 'text-accent',
            }
          }}
        />

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 40 }}>
          Your data is encrypted and we never train AI on your contracts.
        </p>
      </div>
    </div>
  );
}
