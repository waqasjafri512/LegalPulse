import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
  Circle,
  PlayCircle,
  MessageSquare,
  Send,
  X,
  Sparkles,
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

const lifecycleStages = [
  { id: 'review', label: 'Review', description: 'AI Extraction & Metadata Audit' },
  { id: 'negotiation', label: 'Negotiation', description: 'Legal Terms Refinement' },
  { id: 'active', label: 'Active', description: 'Fully Executed & In Effect' },
  { id: 'expired', label: 'Expired', description: 'Contract Term Completed' },
  { id: 'archived', label: 'Archived', description: 'Historical Record Only' },
];

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isFetchingText, setIsFetchingText] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const updateStageMutation = useMutation({
    mutationFn: async (stage: string) => {
      await api.patch(`/contracts/${id}`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      toast.success('Contract stage updated');
    },
    onError: () => {
      toast.error('Failed to update stage');
    }
  });

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await api.post(`/contracts/${id}/chat`, { query });
      return response.data;
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    },
    onError: () => {
      toast.error('AI failed to respond');
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatMutation.isPending) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    chatMutation.mutate(userMessage);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
      await api.patch(`/contracts/${id}`, { status: 'completed', stage: 'active' });
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
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
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
          <button 
            className="btn btn-accent" 
            onClick={() => setIsChatOpen(true)}
            style={{ padding: '8px 14px', background: 'var(--color-accent)', color: 'white' }}
          >
            <Sparkles size={14} /> Ask AI
          </button>
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

      {/* Lifecycle Stepper */}
      <div 
        className="glass-card animate-fade-in" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: 20, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 10, 
            background: 'var(--color-accent-subtle)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <PlayCircle size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifecycle Stage</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{lifecycleStages.find(s => s.id === contract.stage)?.label || 'In Review'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 3, justifyContent: 'center' }}>
          {lifecycleStages.map((stage, index) => {
            const isCompleted = lifecycleStages.findIndex(s => s.id === contract.stage) >= index;
            const isCurrent = contract.stage === stage.id;
            
            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <button
                  onClick={() => updateStageMutation.mutate(stage.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--color-accent)' : isCompleted ? 'var(--color-accent-subtle)' : 'var(--color-bg-tertiary)',
                    border: isCurrent ? '4px solid var(--color-bg-primary)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCurrent ? 'white' : isCompleted ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    zIndex: 2,
                    boxShadow: isCurrent ? '0 0 15px var(--color-accent-subtle)' : 'none'
                  }}
                  title={stage.description}
                >
                  {isCompleted && !isCurrent ? <CheckCircle size={16} /> : <Circle size={isCurrent ? 8 : 12} fill={isCurrent ? "white" : "none"} />}
                </button>
                {index < lifecycleStages.length - 1 && (
                  <div style={{ 
                    width: 60, 
                    height: 2, 
                    background: isCompleted && lifecycleStages.findIndex(s => s.id === contract.stage) > index ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                    zIndex: 1
                  }} />
                )}
                {/* Tooltip Label */}
                <div style={{ 
                  position: 'absolute', 
                  top: 40, 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  fontSize: 10, 
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap'
                }}>
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Pane */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: 18,
          minHeight: 'calc(100vh - 250px)',
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

      {/* AI Chat Sidebar */}
      {isChatOpen && (
        <div 
          className="glass-card animate-fade-in"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 400,
            height: 600,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-accent-subtle)',
            background: 'var(--color-bg-primary)'
          }}
        >
          {/* Chat Header */}
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-bg-tertiary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Legal AI Assistant</div>
                <div style={{ fontSize: 11, color: 'var(--color-success)' }}>● Analyzing {contract.title}</div>
              </div>
            </div>
            <button 
              className="btn btn-ghost" 
              style={{ padding: 4 }}
              onClick={() => setIsChatOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--color-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageSquare size={24} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Ask anything about this contract</h4>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 240, margin: '0 auto' }}>
                  "What are the payment terms?" or "Summarize the termination clause."
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                fontSize: 13,
                lineHeight: 1.5,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                {msg.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--color-bg-tertiary)', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', display: 'flex', gap: 4 }}>
                <div className="animate-bounce" style={{ width: 4, height: 4, background: 'var(--color-accent)', borderRadius: '50%' }}></div>
                <div className="animate-bounce" style={{ width: 4, height: 4, background: 'var(--color-accent)', borderRadius: '50%', animationDelay: '0.2s' }}></div>
                <div className="animate-bounce" style={{ width: 4, height: 4, background: 'var(--color-accent)', borderRadius: '50%', animationDelay: '0.4s' }}></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={handleSendMessage}
            style={{ 
              padding: 16, 
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: 10
            }}
          >
            <input 
              type="text"
              className="input"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, borderRadius: 12, height: 40 }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={chatMutation.isPending || !chatInput.trim()}
              style={{ width: 40, height: 40, padding: 0, borderRadius: 12, flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
