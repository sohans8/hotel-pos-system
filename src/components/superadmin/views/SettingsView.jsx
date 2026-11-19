import React, { useState, useEffect } from 'react';
import { Settings, Shield, HardDrive, Key, CheckCircle, Server, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';

export default function SettingsView() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = sessionStorage.getItem('apex_admin_token');
        const res = await api.getPlatformSettings(token);
        setSettings(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
          Platform Settings & Security Architecture
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Super Administrator global configuration, license enforcement, and system parameters.
        </p>
      </div>

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Administrator Profile Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#2563eb" /> Super Administrator Authentication
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Admin Username:</span>
              <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{settings?.admin_username || 'admin'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Registered Email:</span>
              <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{settings?.admin_email || 'superadmin@apexpos.com'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Authentication Scheme:</span>
              <div style={{ color: '#334155', marginTop: '2px' }}>OAuth2 Bearer JWT (HS256)</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Role-Based Access:</span>
              <div style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>SUPER_ADMIN (Tenant-Isolated)</div>
            </div>
          </div>
        </div>

        {/* Commercial Licensing Policy Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="#2563eb" /> Licensing & Terminal Policies
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px' }}>
              <div>
                <strong>Terminal Limit Enforcement:</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Rejects additional devices beyond configured terminal capacity with HTTP 403</div>
              </div>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>STRICT (ACTIVE)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px' }}>
              <div>
                <strong>Default Subscription Duration:</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Standard commercial release license period</div>
              </div>
              <span style={{ color: '#2563eb', fontWeight: 'bold' }}>365 Days (1 Year)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px' }}>
              <div>
                <strong>Force Password Change on First Login:</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Requires owner to establish private credentials immediately upon onboarding</div>
              </div>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#2563eb" /> Backend Architecture
          </h2>

          <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
            <div>• <strong>Engine:</strong> Python FastAPI + SQLAlchemy ORM (PostgreSQL & SQLite compatible)</div>
            <div>• <strong>Tenant Data Isolation:</strong> Every business entity record is bound via strict foreign keys and indexed <code>tenant_id</code>.</div>
            <div>• <strong>Password Hashing:</strong> Bcrypt (12 rounds) with salted hash generation.</div>
            <div>• <strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Online & Synchronized</span></div>
          </div>
        </div>

      </div>

    </div>
  );
}
