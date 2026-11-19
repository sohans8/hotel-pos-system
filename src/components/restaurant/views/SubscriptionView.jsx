import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  Monitor, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SubscriptionView() {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getRestaurantSubscription();
      setSubData(data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard style={{ color: '#0284c7' }} /> Subscription & License Status
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            View your commercial software license entitlement, plan validity, and terminal allocation. (Read-Only)
          </p>
        </div>
        <button 
          onClick={loadSubscription}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading subscription details from platform registry...</p>
        </div>
      ) : !subData ? null : (
        <>
          {/* Main Plan Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '14px',
            padding: '28px',
            color: '#fff',
            marginBottom: '24px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                    <Sparkles size={14} /> COMMERCIAL SAAS TIER
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                    {subData.subscription_plan || 'Commercial Standard'} Plan
                  </h2>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                    Registered to: <strong style={{ color: '#fff' }}>{subData.restaurant_name}</strong> (Tenant ID: {subData.tenant_id})
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    background: subData.account_status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                    color: '#fff'
                  }}>
                    <ShieldCheck size={16} /> {subData.account_status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>LICENSE KEY</div>
                  <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold', marginTop: '4px', color: '#38bdf8' }}>
                    {subData.license_id || 'APEX-LIC-0000'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>ACTIVATION DATE</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>
                    {formatDate(subData.activation_date)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>EXPIRATION DATE</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>
                    {formatDate(subData.subscription_expiry)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>VALIDITY REMAINING</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80', marginTop: '2px' }}>
                    {subData.days_remaining} Days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Entitlement Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Monitor size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Terminal Hardware Allocation</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                Authorized Windows POS workstations allowed to operate concurrently under your commercial license.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>ALLOWED TERMINALS</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a' }}>{subData.allowed_terminals} Devices</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>ACTIVE IN DATABASE</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0284c7' }}>{subData.active_terminals} In Use</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <ShieldCheck size={20} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>License Terms & Compliance</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#475569', lineHeight: '1.8' }}>
                <li>Full multi-tenant tenant isolation guaranteed by cryptographic session token.</li>
                <li>One-year prepaid commercial SaaS subscription.</li>
                <li>Local SQLite offline-first fallback and cloud sync enabled.</li>
                <li>Receipt printer & KOT hardware acceleration active.</li>
              </ul>
            </div>
          </div>

          {/* Super Admin Support Notice */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <Info size={22} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', color: '#0369a1' }}>
                Plan Upgrades & Terminal Expansion
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                Subscription validity dates, tier quotas, and maximum terminal limits are centrally managed by the platform provider. To renew your license, upgrade your package, or authorize additional POS billing counters, please contact Apex POS Platform Administration (Super Admin).
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}