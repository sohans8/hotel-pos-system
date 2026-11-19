import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Monitor, 
  Layers, 
  UserPlus, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  RefreshCw,
  Store
} from 'lucide-react';
import { api } from '../../../services/api';

export default function DashboardView({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      total_restaurants: 0,
      active_restaurants: 0,
      suspended_restaurants: 0,
      expired_subscriptions: 0,
      active_terminals: 0,
      available_terminal_capacity: 0
    },
    recent_restaurants: [],
    upcoming_expirations: [],
    recent_activities: []
  });
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.getAdminDashboard(token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = data.stats || {
    total_restaurants: 0,
    active_restaurants: 0,
    suspended_restaurants: 0,
    expired_subscriptions: 0,
    active_terminals: 0,
    available_terminal_capacity: 0
  };

  const statCards = [
    { title: 'Total Restaurants', value: stats.total_restaurants, icon: Building2, color: '#2563eb', bg: '#eff6ff', desc: 'Registered restaurant accounts' },
    { title: 'Active Restaurants', value: stats.active_restaurants, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', desc: 'Active & operational' },
    { title: 'Suspended Restaurants', value: stats.suspended_restaurants, icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed', desc: 'Temporarily blocked' },
    { title: 'Expired Subscriptions', value: stats.expired_subscriptions, icon: XCircle, color: '#dc2626', bg: '#fef2f2', desc: 'Needs license renewal' },
    { title: 'Active Terminals', value: stats.active_terminals, icon: Monitor, color: '#7c3aed', bg: '#f5f3ff', desc: 'Authorized hardware devices' },
    { title: 'Available Terminal Capacity', value: stats.available_terminal_capacity, icon: Layers, color: '#0284c7', bg: '#f0f9ff', desc: 'Remaining unassigned slots' }
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#f8fafc' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Platform Overview & Metrics
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Commercial Multi-Tenant SaaS Management Engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => onNavigate('add-restaurant')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            <UserPlus size={15} />
            Add Restaurant
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* 6 Key Metrics Cards (Section C) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>{c.title}</span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: c.bg,
                  color: c.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                {loading ? '...' : c.value}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {c.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE (When total_restaurants === 0) */}
      {!loading && stats.total_restaurants === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Store size={32} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px' }}>
            No Restaurants Registered Yet
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            The platform database is currently clean with <strong>zero restaurants</strong>. You can manually onboard your first restaurant client with an annual 1-year subscription and configured terminal limit.
          </p>
          <button
            onClick={() => onNavigate('add-restaurant')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
            }}
          >
            <UserPlus size={16} /> Register First Restaurant
          </button>
        </div>
      ) : (
        /* Content when restaurants exist */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '28px'
        }}>
          {/* Recently Onboarded Restaurants */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                Recently Registered Restaurants
              </h2>
              <button
                onClick={() => onNavigate('restaurants')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 10px' }}>Restaurant</th>
                    <th style={{ padding: '8px 10px' }}>Owner</th>
                    <th style={{ padding: '8px 10px' }}>Contact</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_restaurants.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.restaurant_id}</div>
                      </td>
                      <td style={{ padding: '10px', color: '#334155' }}>{r.owner_name}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{r.mobile}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: r.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                          color: r.status === 'ACTIVE' ? '#166534' : '#92400e'
                        }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Expirations */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px' }}>
              Upcoming Renewals (30 Days)
            </h2>

            {data.upcoming_expirations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '12px' }}>
                <Clock size={24} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                No subscriptions expiring in the next 30 days.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.upcoming_expirations.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      background: '#fff7ed',
                      border: '1px solid #ffedd5',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '12px', color: '#9a3412' }}>
                      {exp.restaurant_name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#c2410c', marginTop: '4px' }}>
                      <span>Sub: {exp.subscription_id}</span>
                      <span>{exp.days_remaining} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Administrative Activity Logs */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Recent Administrative Activity
          </h2>
          <button
            onClick={() => onNavigate('activity-logs')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Full Audit Trail <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
          </button>
        </div>

        {data.recent_activities.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
            No recent activity recorded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.recent_activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    background: '#e2e8f0',
                    color: '#334155'
                  }}>
                    {act.action}
                  </span>
                  <span style={{ color: '#0f172a' }}>{act.details || act.action}</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {new Date(act.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
