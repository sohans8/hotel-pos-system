import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SubscriptionManagementView({ onNavigate }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.getSubscriptions(token);
      setSubscriptions(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async (subId, action) => {
    if (!confirm(`Are you sure you want to ${action.toUpperCase()} subscription ${subId}?`)) return;
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.subscriptionAction(subId, action, token);
      alert(res.message);
      fetchSubscriptions();
    } catch (err) {
      alert(`Failed to ${action} subscription: ` + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Annual Subscription Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Policy enforcement: 1-Year commercial licenses only. Manage activation, renewals, and revocations.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
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
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Policy Notice Box */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Clock size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '2px' }}>
            1-Year Fixed Commercial Subscription Model (Release 1.0)
          </div>
          <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0, lineHeight: '1.4' }}>
            Every subscription is provisioned for exactly 365 days from activation. When renewed, an additional 365 days is added to the valid period. Accounts with expired, suspended, or revoked subscriptions are blocked by the backend API gateway from executing POS or kitchen operations. Historical subscription records are preserved permanently.
          </p>
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

      {/* Subscriptions Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', fontSize: '13px' }}>
            Loading subscription records...
          </div>
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <Clock size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              No Subscriptions Found
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              Subscriptions are automatically created when new restaurants are registered.
            </p>
            <button
              onClick={() => onNavigate('add-restaurant')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add Restaurant & Subscription
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Subscription ID</th>
                <th style={{ padding: '12px 16px' }}>Restaurant Name</th>
                <th style={{ padding: '12px 16px' }}>Plan / Tier</th>
                <th style={{ padding: '12px 16px' }}>Start Date</th>
                <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => {
                const isExpired = s.status === 'EXPIRED';
                const isSuspended = s.status === 'SUSPENDED';
                const isRevoked = s.status === 'REVOKED';
                const isActive = s.status === 'ACTIVE';

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#2563eb', fontFamily: 'monospace' }}>
                      {s.subscription_id}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {s.restaurant_name}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {s.plan_name}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {new Date(s.start_date).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: isExpired ? '700' : '500', color: isExpired ? '#dc2626' : '#0f172a' }}>
                      {new Date(s.expiry_date).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: isActive ? '#dcfce7' : isSuspended ? '#fee2e2' : isRevoked ? '#450a0a' : '#fef2f2',
                        color: isActive ? '#166534' : isSuspended ? '#991b1b' : isRevoked ? '#f87171' : '#b91c1c'
                      }}>
                        {s.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {isActive ? (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleAction(s.id, 'suspend')}
                            style={{
                              padding: '5px 10px',
                              background: '#fff7ed',
                              border: '1px solid #ffedd5',
                              color: '#c2410c',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleAction(s.id, 'activate')}
                            style={{
                              padding: '5px 10px',
                              background: '#f0fdf4',
                              border: '1px solid #dcfce7',
                              color: '#16a34a',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Activate
                          </button>
                        )}

                        <button
                          disabled={actionLoading}
                          onClick={() => handleAction(s.id, 'renew')}
                          style={{
                            padding: '5px 10px',
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            color: '#2563eb',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          +1 Year Renew
                        </button>

                        <button
                          disabled={actionLoading}
                          onClick={() => handleAction(s.id, 'revoke')}
                          style={{
                            padding: '5px 10px',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            color: '#dc2626',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
