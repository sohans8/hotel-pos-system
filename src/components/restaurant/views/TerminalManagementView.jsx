import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Layers, 
  HelpCircle, 
  KeyRound, 
  Info 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function TerminalManagementView() {
  const [terminalData, setTerminalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTerminals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getRestaurantTerminals();
      setTerminalData(data);
    } catch (err) {
      setError(err.message || 'Failed to load terminal hardware authorization');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerminals();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Monitor style={{ color: '#0284c7' }} /> Authorized POS Terminals
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Workstations and billing counters registered to punch orders and generate receipts for this restaurant.
          </p>
        </div>
        <button 
          onClick={loadTerminals}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading authorized terminals...</p>
        </div>
      ) : !terminalData ? null : (
        <>
          {/* Capacity Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Licensed Terminal Limit</div>
              <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>
                {terminalData.allowed_terminals}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Contracted counter capacity</span>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase' }}>Active Registered Devices</div>
              <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0284c7', marginTop: '6px' }}>
                {terminalData.active_count}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Currently authorized hardware</span>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase' }}>Available Slots</div>
              <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#16a34a', marginTop: '6px' }}>
                {terminalData.available_capacity}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Free slots for new PC registration</span>
            </div>
          </div>

          {/* Terminal List */}
          {terminalData.terminals.length === 0 ? (
            <div style={{ background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', marginBottom: '24px' }}>
              <Monitor size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>No Terminals Registered Yet</h3>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
                When you launch the desktop POS application on your billing counter PC, it will automatically register its hardware fingerprint with the platform.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>TERMINAL / PC NAME</th>
                    <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>DEVICE FINGERPRINT</th>
                    <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>REGISTRATION DATE</th>
                    <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>LAST ACTIVE</th>
                    <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {terminalData.terminals.map(term => (
                    <tr key={term.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Monitor size={16} style={{ color: '#0284c7' }} />
                          {term.device_name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569' }}>
                          {term.device_fingerprint}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {formatDate(term.created_at)}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {formatDate(term.last_active_at || term.created_at)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          background: term.is_active ? '#dcfce7' : '#fee2e2',
                          color: term.is_active ? '#15803d' : '#b91c1c'
                        }}>
                          {term.is_active ? 'Authorized' : 'Revoked'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Replacement Notice */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <KeyRound size={22} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                Hardware Replacement & De-authorization
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                To replace a broken counter PC or transfer a license slot to a new computer, request a terminal reset from the Super Admin panel or contact software support.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}