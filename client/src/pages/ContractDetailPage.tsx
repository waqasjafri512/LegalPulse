import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const sectionConfigs = [
  { id: 'overview', label: 'Overview', icon: FileText, fields: ['contract_type', 'counterparty_name', 'summary'] },
  { id: 'financial', label: 'Financial', icon: FileText, fields: ['contract_value', 'payment_terms'] },
  { id: 'risk', label: 'Risk & Liability', icon: Shield, fields: ['liability_cap', 'indemnification_party'] },
  { id: 'termination', label: 'Termination', icon: AlertTriangle, fields: ['termination_notice_days', 'termination_for_convenience'] },
  { id: 'renewals', label: 'Renewals', icon: Clock, fields: ['auto_renewal', 'auto_renewal_terms'] },
  { id: 'dates', label: 'Key Dates', icon: Clock, fields: ['effective_date', 'expiration_date', 'opt_out_deadline'] },
];

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

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
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-danger)', marginBottom: 12 }}>Error loading contract</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>The contract could not be found or there was an error fetching the data.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/contracts')}>Back to Repository</button>
      </div>
    );
  }

  const renderField = (label: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;
    
    let displayValue = value;
    if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
    if (label.includes('date')) displayValue = new Date(value).toLocaleDateString();
    if (label === 'contract_value') displayValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const formattedLabel = label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
      <div key={label} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
          {formattedLabel}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/contracts')} style={{ padding: 8 }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            {contract.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${contract.status === 'completed' ? 'active' : 'processing'}`}>
              {contract.status}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              Uploaded on {new Date(contract.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            <Download size={16} /> Download
          </button>
          {contract?.status !== 'completed' && (
            <button 
              className="btn btn-primary" 
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Validate Metadata
            </button>
          )}
        </div>
      </div>

      {/* Split Pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, minHeight: 'calc(100vh - 160px)' }}>
        {/* Left — PDF Viewer */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {contract.file_url.endsWith('.pdf') ? (
            <iframe 
              src={`${contract.file_url}#toolbar=0`} 
              style={{ width: '100%', flex: 1, border: 'none' }}
              title="Contract Preview"
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
               <FileText size={48} style={{ color: 'var(--color-text-muted)' }} />
               <p style={{ color: 'var(--color-text-tertiary)' }}>Preview not available for this file type</p>
               <a href={contract.file_url} target="_blank" rel="noreferrer" className="btn btn-ghost">Download to View</a>
            </div>
          )}
        </div>

        {/* Right — Key Terms Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', paddingRight: 4 }}>
          {sectionConfigs.map((section) => {
            const Icon = section.icon;
            const hasData = section.fields.some(field => contract[field] !== null && contract[field] !== undefined);

            return (
              <div key={section.id} className="glass-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {section.label}
                  </h3>
                  <button
                    className="btn-ghost"
                    style={{ marginLeft: 'auto', padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <Edit3 size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  </button>
                </div>
                
                {hasData ? (
                  <div>
                    {section.fields.map(field => renderField(field, contract[field]))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                    {contract.status === 'processing' 
                      ? 'AI is currently extracting terms...' 
                      : 'No data extracted for this section'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Notes */}
          <div className="glass-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              Notes
            </h3>
            <textarea
              className="input"
              placeholder="Add notes about this contract..."
              rows={3}
              defaultValue={contract.notes || ''}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
