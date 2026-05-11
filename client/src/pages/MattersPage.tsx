import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Filter,
  Briefcase,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api from '../lib/api';

export default function MattersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: matters = [], isLoading } = useQuery({
    queryKey: ['matters'],
    queryFn: async () => {
      const response = await api.get('/matters');
      return response.data;
    },
  });

  const filteredMatters = matters.filter((m: any) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Legal Matters
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Track and manage ongoing legal cases and projects
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          New Matter
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Matters', value: matters.filter((m: any) => m.status === 'active').length, color: 'var(--color-accent)' },
          { label: 'Pending Review', value: matters.filter((m: any) => m.status === 'pending').length, color: 'var(--color-warning)' },
          { label: 'Closed (MTD)', value: matters.filter((m: any) => m.status === 'closed').length, color: 'var(--color-success)' },
          { label: 'High Priority', value: matters.filter((m: any) => m.priority === 'high').length, color: 'var(--color-danger)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            placeholder="Search matters by title, client, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button className="btn btn-secondary"><Filter size={14} /> Filters</button>
      </div>

      {/* Matters List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px 40px', textAlign: 'center' }}>
            <Briefcase size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              No matters found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              {searchQuery ? 'Try a different search term.' : 'Start tracking your legal cases by creating your first matter.'}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary">
                <Plus size={16} /> New Matter
              </button>
            )}
          </div>
        ) : (
          filteredMatters.map((matter: any) => (
            <div key={matter.id} className="glass-card list-item-hover" style={{ padding: 20, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {matter.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={14} /> {matter.client_name || 'No Client'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} /> Updated {new Date(matter.updated_at).toLocaleDateString()}
                      </span>
                      {matter.priority === 'high' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}>
                          <AlertCircle size={14} /> High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge badge-${matter.status}`}>
                    {matter.status.charAt(0).toUpperCase() + matter.status.slice(1)}
                  </span>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
