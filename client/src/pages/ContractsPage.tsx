import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Download,
  FileText,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import api from '../lib/api';

const contractTypes = ['All Types', 'NDA', 'MSA', 'SOW', 'Employment', 'SaaS Subscription', 'Lease', 'IP License'];
const statusOptions = ['All Status', 'Active', 'Expiring Soon', 'Expired', 'Draft', 'Processing'];

export default function ContractsPage() {
  const navigate = useNavigate();
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

  const filteredContracts = contracts.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.counterparty_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All Types' || c.contract_type === selectedType;
    const matchesStatus = selectedStatus === 'All Status' || c.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Contracts
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {contracts.length} contracts in your repository
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <Plus size={16} />
          Upload Contracts
        </button>
      </div>

      {/* Search & Filters */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
          />
          <input
            className="input"
            placeholder='Search contracts... try "indemnification obligations" or "Acme Corp"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        <select
          className="input"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ width: 160 }}
        >
          {contractTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="input"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ width: 160 }}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button className="btn btn-secondary">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Table or Empty State */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
        </div>
      ) : filteredContracts.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: '64px 40px', textAlign: 'center' }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <FileText size={24} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>
            {searchQuery ? 'No matches found' : 'No contracts yet'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto 20px' }}>
            {searchQuery 
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Upload your first contracts to see them here. AI will automatically extract key terms, dates, and obligations.'}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              <Plus size={16} />
              Upload Contracts
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th><ArrowUpDown size={12} style={{ display: 'inline', marginRight: 4 }} />Name</th>
                <th>Counterparty</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expiration</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c: any) => (
                <tr key={c.id} onClick={() => navigate(`/contracts/${c.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td>{c.counterparty_name || '—'}</td>
                  <td><span className="badge badge-draft">{c.contract_type || 'Unclassified'}</span></td>
                  <td>
                    <span className={`badge badge-${c.status === 'completed' ? 'active' : 'processing'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.expiration_date || '—'}</td>
                  <td style={{ color: 'var(--color-text-tertiary)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
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
