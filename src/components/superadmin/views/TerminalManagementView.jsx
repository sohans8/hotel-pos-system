import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  ShieldCheck, 
  XCircle, 
  RefreshCw, 
  RotateCcw, 
  AlertTriangle, 
  Search,
  CheckCircle,
  Building2,
  HardDrive
} from 'lucide-react';
import { api } from '../../../services/api';

export default function TerminalManagementView({ onNavigate, preselectedTenant = null }) {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTenantFilter, setSelectedTenantFilter] = useState(preselectedTenant || '');

  const fetchTerminals = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.getTerminals(selectedTenantFilter || null, token);
      setTerminals(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch registered terminals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminals();
  }, [selectedTenantFilter]);

  const handleRevoke = async (terminalId) => {
    const reason = prompt('Please enter revocation reason (e.g. Unrecognized hardware device):');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.revokeTerminal(terminalId, reason, token);
      alert(res.message);
      fetchTerminals();
    } catch (err) {
      alert('Revocation failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplace = async (terminalId) => {
    const reason = prompt('Reason for marking device as replaced (e.g. Broken touch screen, replaced with new PC):');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.replaceTerminal(terminalId, reason, token);
      alert(res.message);
      fetchTerminals();
    } catch (err) {
      alert('Action failed: ' + err.message);
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
            Hardware Terminal & Device Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Inspect registered physical devices, enforce terminal limits, and authorize hardware replacements.
          </p>
        </div>

        <button
          onClick={fetchTerminals}
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

      {/* Terminal Architecture Guarantee Box */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '2px' }}>
            Device Fingerprint & Terminal Limit Policy
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
            Every client terminal registers a unique device identifier. The backend enforces strict device limits: devices attempting connection beyond the restaurant's configured terminal capacity are rejected with HTTP 403 Forbidden. When a device is broken, marking it as <strong>REPLACED</strong> frees up the slot so the replacement device can register without license violations. Multiple tabs/sessions from the same physical machine do not consume extra terminal slots.
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

      {/* Table of Registered Terminals */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', fontSize: '13px' }}>
            Loading hardware terminals...
          </div>
        ) : terminals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <Monitor size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              No Registered Terminals
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Terminals will automatically register when restaurant clients sign in and take orders from their counter devices.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Terminal Code</th>
                <th style={{ padding: '12px 16px' }}>Restaurant</th>
                <th style={{ padding: '12px 16px' }}>Device Identity</th>
                <th style={{ padding: '12px 16px' }}>Device Name / OS</th>
                <th style={{ padding: '12px 16px' }}>IP Address</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Last Active</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {terminals.map((t) => {
                const isAuthorized = t.status === 'AUTHORIZED';
                const isRevoked = t.status === 'REVOKED';
                const isReplaced = t.status === 'REPLACED';

                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#2563eb' }}>
                      {t.terminal_id}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {t.restaurant_name}
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569', fontSize: '12px' }}>
                      {t.device_id}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      <div>{t.device_name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.platform}</div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      {t.ip_address || '127.0.0.1'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: isAuthorized ? '#dcfce7' : isRevoked ? '#fee2e2' : '#f1f5f9',
                        color: isAuthorized ? '#166534' : isRevoked ? '#991b1b' : '#475569'
                      }}>
                        {t.status}
                      </span>
                      {t.replacement_notes && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                          {t.replacement_notes}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      {new Date(t.last_active_at).toLocaleString()}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {isAuthorized && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleReplace(t.id)}
                              title="Mark as Replaced (Free up slot for new hardware)"
                              style={{
                                padding: '5px 10px',
                                background: '#eff6ff',
                                border: '1px solid #dbeafe',
                                color: '#2563eb',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              Replace Device
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() => handleRevoke(t.id)}
                              title="Revoke Authorization"
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
                          </>
                        )}
                        {!isAuthorized && (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Decommissioned</span>
                        )}
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
