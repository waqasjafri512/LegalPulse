import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AlertsPage() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts');
      return response.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert marked as read');
    },
  });

  const checkAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/alerts/check');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`Check complete. ${data.created} new alerts created.`);
    },
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Compliance Alerts
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Stay ahead of expirations, renewals, and legal obligations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => checkAlertsMutation.mutate()}
            disabled={checkAlertsMutation.isPending}
          >
            {checkAlertsMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Scan for Alerts
          </button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20, borderBottom: '1px solid var(--color-border-subtle)' }}>
        {['All Alerts', 'Unread', 'Critical'].map((tab) => (
          <button
            key={tab}
            style={{
              padding: '8px 4px 12px',
              fontSize: 14,
              fontWeight: tab === 'All Alerts' ? 600 : 500,
              color: tab === 'All Alerts' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              borderBottom: tab === 'All Alerts' ? '2px solid var(--color-accent)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px 40px', textAlign: 'center' }}>
            <CheckCircle size={40} style={{ color: 'var(--color-success)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              You are all caught up!
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No active compliance alerts or pending expirations found.
            </p>
          </div>
        ) : (
          alerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`glass-card ${alert.is_read ? 'opacity-60' : ''}`}
              style={{
                padding: '16px 20px',
                display: 'flex',
                gap: 16,
                borderLeft: !alert.is_read ? `4px solid ${alert.priority === 'high' ? 'var(--color-danger)' : 'var(--color-accent)'}` : undefined,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: alert.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: alert.priority === 'high' ? 'var(--color-danger)' : 'var(--color-accent)',
                  flexShrink: 0,
                }}
              >
                {alert.type === 'expiration' ? <Calendar size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {alert.title}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  {alert.message}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {!alert.is_read && (
                    <button 
                      className="btn btn-ghost" 
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      onClick={() => markReadMutation.mutate(alert.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px', color: 'var(--color-accent)' }}>
                    View Contract
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
