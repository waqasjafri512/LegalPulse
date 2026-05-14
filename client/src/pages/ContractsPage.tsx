import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Download,
  FileText,
  ArrowUpDown,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Eye,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';

const contractTypes = ['All Types', 'NDA', 'MSA', 'SOW', 'Employment', 'SaaS Subscription', 'Lease', 'IP License'];
const statusOptions = ['All Status', 'Active', 'Expiring Soon', 'Expired', 'Draft', 'Processing'];

export default function ContractsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await api.get('/contracts');
      return response.data;
    },
  });

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      await api.post(`/contracts/${id}/delete`);
      toast.success('Contract deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    } catch (err) {
      toast.error('Failed to delete contract');
    }
  };

  const filteredContracts = contracts.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.counterparty_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All Types' || c.contract_type === selectedType;
    const matchesStatus = selectedStatus === 'All Status' || c.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      {/* ... (Header and Search & Filters unchanged) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileText size={14} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Repository
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Contracts
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {contracts.length} contracts in your repository
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ padding: '8px 14px' }}>
            <Download size={14} /> Export
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Plus size={15} /> Upload
          </button>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
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
          <input
            className="input"
            placeholder='Search contracts... try "indemnification" or "Acme Corp"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36, background: 'transparent', border: '1px solid transparent' }}
          />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

        <SlidersHorizontal size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />

        <select
          className="input"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ width: 150, background: 'transparent', border: '1px solid transparent', fontSize: 12.5 }}
        >
          {contractTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="input"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ width: 140, background: 'transparent', border: '1px solid transparent', fontSize: 12.5 }}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading contracts...</span>
          </div>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: '72px 40px', textAlign: 'center' }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'var(--color-accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <FileText size={28} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            {searchQuery ? 'No matches found' : 'No contracts yet'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
            {searchQuery
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Upload your first contracts to see them here. AI will automatically extract key terms, dates, and obligations.'}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              <Sparkles size={15} />
              Upload Contracts
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowUpDown size={10} /> Name
                  </div>
                </th>
                <th>Counterparty</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expiration</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c: any) => (
                <tr key={c.id} onClick={() => navigate(`/contracts/${c.id}`)}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: 'var(--color-accent-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                        {c.title}
                      </span>
                    </div>
                  </td>
                  <td>{c.counterparty_name || '—'}</td>
                  <td>
                    <span className="badge badge-draft">{c.contract_type || 'Unclassified'}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${c.status === 'completed' ? 'active' : c.status}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{c.expiration_date || '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 12.5 }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: 6, borderRadius: 6 }}
                        onClick={() => navigate(`/contracts/${c.id}`)}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: 6, borderRadius: 6, color: 'var(--color-danger)' }}
                        onClick={(e) => handleRemove(e, c.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
