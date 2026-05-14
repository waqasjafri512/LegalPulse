import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  FileText,
  Filter,
  Clock,
  Loader2,
  AlertTriangle,
  Sparkles,
  Eye,
  Trash2,
} from 'lucide-react';
import api from '../lib/api';

const contractTypes = ['All Types', 'NDA', 'Service Agreement', 'Employment', 'License', 'Other'];
const statuses = ['All Statuses', 'Processing', 'Completed'];

export default function ContractsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: contracts = [], isLoading, refetch } = useQuery({
    queryKey: ['contracts', debouncedSearch, selectedType, selectedStatus],
    queryFn: async () => {
      let url = '/contracts';
      if (debouncedSearch) {
        url = `/contracts/search?q=${encodeURIComponent(debouncedSearch)}`;
      }
      const response = await api.get(url);
      
      let results = response.data;
      // Filter out Matter Documents so they don't show up in Contracts list
      results = results.filter((c: any) => c.contract_type !== 'Matter Document');

      // Secondary local filtering for type and status if needed
      if (selectedType !== 'All Types') {
        results = results.filter((c: any) => c.contract_type === selectedType);
      }
      if (selectedStatus !== 'All Statuses') {
        results = results.filter((c: any) => c.status === selectedStatus.toLowerCase());
      }
      
      return results;
    },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    
    try {
      await api.post(`/contracts/${id}/delete`);
      refetch();
    } catch (err) {
      console.error('Failed to delete contract:', err);
      alert('Failed to delete contract. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            Contracts Repository
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            Manage and analyze your organization's legal documents
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <Plus size={16} /> New Contract
        </button>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          {debouncedSearch && (
            <Sparkles 
              size={12} 
              style={{ 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-accent)',
                animation: 'pulse 2s infinite'
              }} 
            />
          )}
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 38, paddingRight: 38 }}
            placeholder='Search contracts... try "AI data privacy" or "30 day notice"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="input"
          style={{ width: 160 }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {contractTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="input"
          style={{ width: 160 }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary">
          <Filter size={15} /> Filters
        </button>
      </div>

      {/* Table Content */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Contract Name
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Counterparty
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Stage
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Risk
              </th>
              <th style={{ width: 180 }}></th>
            </tr>
          </thead>
          <tbody className="stagger-children">
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Searching repository...</span>
                  </div>
                </td>
              </tr>
            ) : contracts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: 'var(--color-bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <AlertTriangle size={24} />
                    </div>
                    <div style={{ maxWidth: 300 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        {searchQuery ? 'No matches found' : 'No contracts yet'}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                        {searchQuery
                          ? 'Try adjusting your search or filters to find what you are looking for.'
                          : 'Start by uploading your first legal document to begin AI analysis.'}
                      </p>
                    </div>
                    {!searchQuery && (
                      <button className="btn btn-accent" onClick={() => navigate('/upload')}>
                        <Plus size={14} /> Upload First Contract
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map((contract: any) => (
                <tr
                  key={contract.id}
                  className="animate-fade-in hover-bg"
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--color-bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-accent)',
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {contract.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {new Date(contract.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                    {contract.counterparty_name || '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {contract.contract_type || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge badge-${contract.status}`}>
                      {contract.status === 'processing' ? 'Processing' : 'Completed'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      fontSize: 12, 
                      fontWeight: 600, 
                      textTransform: 'capitalize',
                      color: contract.stage === 'active' ? 'var(--color-success)' : 'var(--color-text-primary)'
                    }}>
                      {contract.stage || 'Review'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {contract.risk_score !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 4,
                            borderRadius: 2,
                            background: 'var(--color-bg-tertiary)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${contract.risk_score}%`,
                              height: '100%',
                              background:
                                contract.risk_score > 70
                                  ? '#f87171'
                                  : contract.risk_score > 40
                                  ? '#fbbf24'
                                  : '#34d399',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {contract.risk_score}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                      >
                        <Eye size={14} /> View
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-danger)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contract.id);
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
