import React, { useState } from 'react';
import { Store, User, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { api } from '../../services/api';

export default function RestaurantLogin({ onLoginSuccess, onSwitchToSuperAdmin }) {
  const [username, setUsername] = useState('saidhaba');
  const [password, setPassword] = useState('SaiDhaba@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.restaurantLogin({
        username_or_email: username.trim(),
        password: password
      });
      sessionStorage.setItem('apex_restaurant_token', res.access_token);
      sessionStorage.setItem('apex_tenant_id', res.tenant_id);
      sessionStorage.setItem('apex_restaurant_name', res.restaurant_name);
      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Restaurant login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        padding: '36px 32px'
      }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            background: '#0284c7',
            color: '#ffffff',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Store size={24} />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Restaurant Client Portal
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Sign in to manage your restaurant workspace
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Restaurant Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. saidhaba / royal_owner"
                style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
              <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
              <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
          <span>Software Platform Administrator? </span>
          <button
            onClick={onSwitchToSuperAdmin}
            style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            Go to Platform Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}
