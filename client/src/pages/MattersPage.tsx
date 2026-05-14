import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  FileText,
} from 'lucide-react';
import api from '../lib/api';

export default function MattersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMatter, setNewMatter] = useState({ title: '', matter_type: 'Litigation', priority: 'medium', description: '' });

  const { data: matters = [], isLoading, refetch } = useQuery({
    queryKey: ['matters'],
    queryFn: async () => {
      const response = await api.get('/matters');
      return response.data;
    },
  });

  const { data: matterDocuments = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ['matter_documents'],
    queryFn: async () => {
      const response = await api.get('/contracts');
      return response.data.filter((c: any) => c.contract_type === 'Matter Document');
    },
  });

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/matters', newMatter);
      setIsModalOpen(false);
      setNewMatter({ title: '', matter_type: 'Litigation', priority: 'medium', description: '' });
      refetch();
    } catch (err) {
      console.error('Failed to create matter:', err);
      alert('Failed to create matter. Please try again.');
    }
  };

  const filteredMatters = matters.filter((m: any) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Briefcase size={14} style={{ color: 'var(--color-accent)' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Operations
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
            Legal Matters
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            Track and manage active cases, litigation, and projects
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New Matter
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div 
        className="stagger-children"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}
      >
        {[
          { label: 'Active Matters', value: matters.filter((m: any) => m.status === 'open' || m.status === 'active').length, color: 'var(--color-accent)', icon: Briefcase },
          { label: 'Pending Review', value: matters.filter((m: any) => m.status === 'pending').length, color: 'var(--color-warning)', icon: Clock },
          { label: 'Closed (MTD)', value: matters.filter((m: any) => m.status === 'closed').length, color: 'var(--color-success)', icon: Calendar },
          { label: 'High Priority', value: matters.filter((m: any) => m.priority === 'high').length, color: 'var(--color-danger)', icon: AlertCircle },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="stat-card animate-fade-in" 
            style={{ 
              padding: '22px 22px 20px',
              '--accent-color': stat.color 
            } as any}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500, letterSpacing: '0.01em' }}>
                {stat.label}
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <stat.icon size={17} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {isLoading ? (
                <div className="skeleton" style={{ width: 48, height: 34, borderRadius: 6 }} />
              ) : (
                stat.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '12px 16px', 
          marginBottom: 16, 
          display: 'flex', 
          alignItems: 'center',
          gap: 10 
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            placeholder="Search matters by title, client, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36, background: 'transparent', border: '1px solid transparent' }}
          />
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />
        <button className="btn btn-secondary" style={{ fontSize: 12.5, padding: '8px 14px' }}>
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Matters List */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading matters...</span>
            </div>
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="glass-card animate-fade-in" style={{ padding: '72px 40px', textAlign: 'center' }}>
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
              <Briefcase size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              {searchQuery ? 'No matters found' : 'No active matters'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
              {searchQuery ? 'Try a different search term.' : 'Start tracking your legal cases by creating your first matter.'}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> New Matter
              </button>
            )}
          </div>
        ) : (
          filteredMatters.map((matter: any) => (
            <div 
              key={matter.id} 
              className="glass-card animate-fade-in" 
              style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-card)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                      {matter.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {new Date(matter.updated_at).toLocaleDateString()}
                      </span>
                      {matter.priority === 'high' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}>
                          <AlertCircle size={13} /> High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={`badge badge-${matter.status === 'open' ? 'active' : matter.status}`}>
                    {matter.status}
                  </span>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Matter Documents Section */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>
          Recent Matter Documents
        </h2>
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {isLoadingDocs ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 14 }} />
              <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 14 }} />
            </div>
          ) : matterDocuments.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No matter documents uploaded yet.</p>
          ) : (
            matterDocuments.map((doc: any) => (
              <div 
                key={doc.id}
                className="glass-card animate-fade-in"
                style={{ padding: '16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all 0.2s' }}
                onClick={() => navigate(`/contracts/${doc.id}`)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-card)')}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: 'rgba(129, 140, 248, 0.1)',
                  color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                    {doc.title}
                  </h4>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} /> {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Matter Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--color-bg-overlay)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-card animate-fade-in-scale" style={{ width: 500, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 24 }}>Create New Matter</h2>
            <form onSubmit={handleCreateMatter} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Matter Title</label>
                <input 
                  required 
                  className="input" 
                  placeholder="e.g., Acme vs Global Logistics"
                  value={newMatter.title}
                  onChange={(e) => setNewMatter({ ...newMatter, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Matter Type</label>
                <select 
                  className="input"
                  value={newMatter.matter_type}
                  onChange={(e) => setNewMatter({ ...newMatter, matter_type: e.target.value })}
                >
                  <option value="Litigation">Litigation</option>
                  <option value="Corporate">Corporate / M&A</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                  <option value="Employment">Employment</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Priority</label>
                <select 
                  className="input"
                  value={newMatter.priority}
                  onChange={(e) => setNewMatter({ ...newMatter, priority: e.target.value })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Description (Optional)</label>
                <textarea 
                  className="input" 
                  placeholder="Brief summary of the matter..."
                  rows={3}
                  value={newMatter.description}
                  onChange={(e) => setNewMatter({ ...newMatter, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Matter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
