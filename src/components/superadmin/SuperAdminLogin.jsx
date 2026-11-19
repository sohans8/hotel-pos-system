import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function SuperAdminLogin({ onLoginSuccess, onSwitchToRestaurantLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('SuperAdmin@Apex2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.superAdminLogin({
        username_or_email: usernameOrEmail.trim(),
        password: password,
        remember_me: rememberMe
      });
      sessionStorage.setItem('apex_admin_token', res.access_token);
      sessionStorage.setItem('apex_admin_name', res.admin_name);
      if (onLoginSuccess) {
        onLoginSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Invalid administrator credentials.');
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
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        border: '1px solid #e2e8ef',
        borderRadius: '10px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        padding: '36px 32px'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
          }}>
            <Shield size={24} style={{ color: '#38bdf8' }} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>
            Platform Management Panel
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Super Admin Access • Multi-Tenant SaaS Licensing
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username or Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Username or Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin or superadmin@apexpos.com"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: '#2563eb' }}
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Super Admin Console'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Link to Restaurant Login */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <span>Are you a restaurant owner or cashier? </span>
          <button
            onClick={onSwitchToRestaurantLogin}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            Go to Restaurant Login
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px', color: '#0f172a' }}>Super Admin Password Recovery</h3>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              Platform Super Admin credentials can be reset using server environment variables (<code>SUPERADMIN_PASSWORD</code>) or via backend CLI utilities.
            </p>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#334155', marginBottom: '16px' }}>
              Default: admin / SuperAdmin@Apex2026!
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
