import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
  Loader2,
  Bell,
  ChevronRight,
  Clock,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AlertsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All Alerts');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts');
      return response.data;
    },
  });

  const filteredAlerts = alerts.filter((alert: any) => {
    if (activeTab === 'Unread') return !alert.is_read;
    if (activeTab === 'Critical') return alert.priority === 'high';
    return true;
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
            <Bell size={14} style={{ color: 'var(--color-accent)' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Intelligence
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
            Compliance Alerts
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            Monitor expirations, obligations, and critical legal risks
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => checkAlertsMutation.mutate()}
          disabled={checkAlertsMutation.isPending}
        >
          {checkAlertsMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Scan for Alerts
        </button>
      </div>

      {/* Filter Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 24, 
          marginBottom: 24, 
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '0 4px'
        }}
      >
        {['All Alerts', 'Unread', 'Critical'].map((tab) => {
          const isActive = tab === activeTab;
          const unreadCount = alerts.filter((a: any) => !a.is_read).length;
          const criticalCount = alerts.filter((a: any) => a.priority === 'high' && !a.is_read).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 0 14px',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span style={{ 
                  marginLeft: 6, 
                  fontSize: 10, 
                  background: 'var(--color-accent)', 
                  color: 'white', 
                  padding: '1px 6px', 
                  borderRadius: 10,
                  verticalAlign: 'middle'
                }}>
                  {unreadCount}
                </span>
              )}
              {tab === 'Critical' && criticalCount > 0 && (
                <span style={{ 
                  marginLeft: 6, 
                  fontSize: 10, 
                  background: 'var(--color-danger)', 
                  color: 'white', 
                  padding: '1px 6px', 
                  borderRadius: 10,
                  verticalAlign: 'middle'
                }}>
                  {criticalCount}
                </span>
              )}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, paddingBottom: 10 }}>
           <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: '6px 10px' }}>
             <Filter size={14} /> Filter
           </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Analyzing compliance risks...</span>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-card animate-fade-in" style={{ padding: '72px 40px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'rgba(52, 211, 153, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle size={28} style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              No {activeTab.toLowerCase()} alerts
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              There are no {activeTab.toLowerCase()} compliance alerts currently.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`glass-card animate-fade-in ${alert.is_read ? 'opacity-60' : ''}`}
              style={{
                padding: '18px 20px',
                display: 'flex',
                gap: 18,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Priority indicator line */}
              {!alert.is_read && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: alert.priority === 'high' ? 'var(--color-danger)' : 'var(--color-accent)',
                  boxShadow: `0 0 10px ${alert.priority === 'high' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(129, 140, 248, 0.3)'}`
                }} />
              )}

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: alert.priority === 'high' ? 'rgba(248, 113, 113, 0.08)' : 'rgba(129, 140, 248, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: alert.priority === 'high' ? 'var(--color-danger)' : 'var(--color-accent)',
                  flexShrink: 0,
                  border: `1px solid ${alert.priority === 'high' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(129, 140, 248, 0.1)'}`
                }}
              >
                {alert.type === 'expiration' ? <Calendar size={20} /> : <AlertTriangle size={20} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                    {alert.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12 }}>
                    <Clock size={12} />
                    {new Date(alert.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.5, maxWidth: '90%' }}>
                  {alert.message}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!alert.is_read && (
                    <button 
                      className="btn btn-accent" 
                      style={{ fontSize: 12, padding: '5px 12px', height: 'auto' }}
                      onClick={() => markReadMutation.mutate(alert.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: 12, padding: '5px 12px', height: 'auto', color: 'var(--color-accent)' }}
                    onClick={() => navigate(`/contracts`)} // Assuming navigation to list, detail would be better if ID exists
                  >
                    View Contract <ChevronRight size={12} />
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
