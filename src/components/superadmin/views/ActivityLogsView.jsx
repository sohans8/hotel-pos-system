import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, Shield, Clock } from 'lucide-react';
import { api } from '../../../services/api';

export default function ActivityLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.getActivityLogs(search, 100, token);
      setLogs(res);
    } catch (err) {
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            System Audit & Activity Logs
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Immutable administrative audit trail recording all platform actions, security events, and licensing changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
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
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by action, actor, target or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </form>
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

      {/* Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', fontSize: '13px' }}>
            Loading audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '13px' }}>
            No audit logs recorded yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Actor</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
                <th style={{ padding: '12px 16px' }}>Target</th>
                <th style={{ padding: '12px 16px' }}>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>
                    {new Date(l.timestamp).toLocaleString()}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{l.actor_name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{l.actor_type}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: '#f1f5f9',
                      color: '#334155',
                      fontFamily: 'monospace'
                    }}>
                      {l.action}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: '500', fontSize: '12px' }}>
                    {l.target_id || 'Platform'}
                  </td>

                  <td style={{ padding: '12px 16px', color: '#334155', fontSize: '12px' }}>
                    {l.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
