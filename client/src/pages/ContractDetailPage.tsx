import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  Shield,
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Edit3,
  ExternalLink,
  TrendingUp,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const sectionConfigs = [
  { id: 'overview', label: 'Overview', icon: Scale, fields: ['contract_type', 'counterparty_name', 'governing_law'] },
  { id: 'financial', label: 'Financial', icon: TrendingUp, fields: ['contract_value', 'payment_terms'] },
  { id: 'risk', label: 'Risk & Liability', icon: Shield, fields: ['liability_cap', 'indemnification_party', 'risk_score'] },
  { id: 'termination', label: 'Termination', icon: AlertTriangle, fields: ['termination_notice_days', 'termination_for_convenience'] },
  { id: 'renewals', label: 'Renewals', icon: Clock, fields: ['auto_renewal', 'auto_renewal_terms'] },
  { id: 'dates', label: 'Key Dates', icon: Clock, fields: ['effective_date', 'expiration_date', 'opt_out_deadline'] },
];

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isFetchingText, setIsFetchingText] = useState(false);

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch text content for non-PDF or fake-PDF files
  useEffect(() => {
    if (contract && (contract.file_url.endsWith('.txt') || contract.title.includes('Contract.pdf'))) {
      setIsFetchingText(true);
      fetch(contract.file_url)
        .then(res => res.text())
        .then(text => {
          setTextContent(text);
          setIsFetchingText(false);
        })
        .catch(() => {
          setIsFetchingText(false);
        });
    }
  }, [contract]);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await api.patch(`/contracts/${id}`, { status: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      toast.success('Metadata validated successfully');
    } catch (error) {
      toast.error('Failed to validate metadata');
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-accent)' }} />
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading contract...</span>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="glass-card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, margin: '80px auto' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertTriangle size={24} style={{ color: 'var(--color-danger)' }} />
        </div>
        <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 8, fontSize: 20, fontWeight: 600 }}>Contract not found</h2>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 24, fontSize: 14 }}>
          The contract could not be found or there was an error fetching the data.
        </p>
        <button className="btn btn-secondary" onClick={() => navigate('/contracts')}>
          <ArrowLeft size={15} /> Back to Repository
        </button>
      </div>
    );
  }

  const renderField = (label: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;

    let displayValue = value;
    if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
    if (label.includes('date')) displayValue = new Date(value).toLocaleDateString();
    if (label === 'contract_value')
      displayValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const formattedLabel = label
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return (
      <div key={label} style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 3,
          }}
        >
          {formattedLabel}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
          {label === 'risk_score' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  maxWidth: 120,
                  height: 5,
                  borderRadius: 3,
                  background: 'var(--color-bg-tertiary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${value}%`,
                    height: '100%',
                    borderRadius: 3,
                    background:
                      value > 70
                         ? 'linear-gradient(90deg, #f87171, #ef4444)'
                        : value > 40
                        ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                        : 'linear-gradient(90deg, #34d399, #10b981)',
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: value > 70 ? '#f87171' : value > 40 ? '#fbbf24' : '#34d399' }}>
                {value}/100
              </span>
            </div>
          ) : (
            displayValue
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/contracts')}
          style={{ padding: 8, borderRadius: 10 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
              letterSpacing: '-0.02em',
            }}
          >
            {contract.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge badge-${contract.status === 'completed' ? 'active' : contract.status}`}>
              {contract.status}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Uploaded {new Date(contract.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={contract.file_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', padding: '8px 14px' }}
          >
            <ExternalLink size={14} /> Open File
          </a>
          <button className="btn btn-secondary" style={{ padding: '8px 14px' }}>
            <Download size={14} /> Download
          </button>
          {contract?.status !== 'completed' && (
            <button
              className="btn btn-primary"
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Validate
            </button>
          )}
        </div>
      </div>

      {/* Split Pane */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: 18,
          minHeight: 'calc(100vh - 160px)',
        }}
      >
        {/* Left — Preview Viewer */}
        <div
          className="glass-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8fafc'
          }}
        >
          {(() => {
            const isPDF = contract.file_mimetype === 'application/pdf' && !contract.title.includes('Contract.pdf');
            const isDocx = contract.file_mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                           contract.file_mimetype === 'application/msword';

            if (isPDF || isDocx) {
              return (
                <iframe
                  src={isPDF ? `${contract.file_url}#toolbar=0` : `https://docs.google.com/viewer?url=${encodeURIComponent(contract.file_url)}&embedded=true`}
                  style={{ width: '100%', flex: 1, border: 'none', minHeight: 600, background: 'white' }}
                  title="Document Preview"
                />
              );
            }

            // Text Fallback (Virtual PDF)
            if (textContent || isFetchingText) {
              return (
                <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto', background: '#f1f5f9' }}>
                  <div style={{ 
                    maxWidth: 800, 
                    margin: '0 auto', 
                    background: 'white', 
                    padding: '60px 80px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    minHeight: 1000,
                    borderRadius: 2
                  }}>
                    {isFetchingText ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                        <Loader2 className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                      </div>
                    ) : (
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'serif', 
                        fontSize: 14, 
                        lineHeight: 1.8,
                        color: '#1e293b' 
                      }}>
                        {textContent}
                      </pre>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 16,
                  padding: 40,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={32} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>
                  No preview available
                </p>
                <a
                  href={contract.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Open in New Tab
                </a>
              </div>
            );
          })()}
        </div>

        {/* Right — Key Terms Panel */}
        <div
          className="stagger-children"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingRight: 4,
          }}
        >
          {sectionConfigs.map((section) => {
            const Icon = section.icon;
            const hasData = section.fields.some(
              (field) => contract[field] !== null && contract[field] !== undefined
            );

            return (
              <div
                key={section.id}
                className="glass-card animate-fade-in"
                style={{ padding: '16px 18px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'var(--color-accent-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={14} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {section.label}
                  </h3>
                  <button
                    style={{
                      marginLeft: 'auto',
                      padding: 5,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                  >
                    <Edit3 size={12} style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                </div>

                {hasData ? (
                  <div>{section.fields.map((field) => renderField(field, contract[field]))}</div>
                ) : (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--color-text-muted)',
                      fontStyle: 'italic',
                      padding: '8px 0',
                    }}
                  >
                    {contract.status === 'processing' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Loader2 size={13} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                        <span>AI is extracting terms...</span>
                      </div>
                    ) : (
                      'No data extracted for this section'
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Analysis Summary */}
          {contract.summary && (
            <div className="glass-card animate-fade-in" style={{ padding: '16px 18px', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--color-accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  AI Contract Analysis
                </h3>
              </div>
              <div style={{ 
                fontSize: 14, 
                color: 'var(--color-text-secondary)', 
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                padding: '4px 0'
              }}>
                {contract.summary}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="glass-card animate-fade-in" style={{ padding: '16px 18px', marginTop: 10 }}>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 10,
              }}
            >
              Notes
            </h3>
            <textarea
              className="input"
              placeholder="Add notes about this contract..."
              rows={3}
              defaultValue={contract.notes || ''}
              style={{ resize: 'vertical', fontSize: 13 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
