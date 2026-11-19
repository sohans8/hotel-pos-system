import React, { useState, useEffect } from 'react';
import { Building2, Save, RefreshCw, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { api } from '../../../services/api';

export default function RestaurantProfileView() {
  const [profile, setProfile] = useState({
    restaurant_id: '',
    name: '',
    logo_url: '',
    owner_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    mobile: '',
    email: '',
    gstin: '',
    fssai: '',
    restaurant_type: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_restaurant_token');
      const res = await api.getRestaurantProfile(token);
      setProfile(res);
    } catch (err) {
      setError(err.message || 'Failed to load restaurant profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = sessionStorage.getItem('apex_restaurant_token');
      const res = await api.updateRestaurantProfile(profile, token);
      setSuccessMsg(res.message || 'Profile saved successfully.');
      sessionStorage.setItem('apex_restaurant_name', profile.name);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Restaurant Business Profile
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Manage your legal entity details, billing address, contact information, and tax registration.
          </p>
        </div>

        <button
          onClick={fetchProfile}
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
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} style={{ maxWidth: '840px' }}>
        
        {/* Card 1: Entity & Branding */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#2563eb" /> General Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Restaurant ID (Assigned by Platform)
              </label>
              <input
                type="text"
                disabled
                value={profile.restaurant_id}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={profile.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Owner / Proprietor Name *
              </label>
              <input
                type="text"
                required
                name="owner_name"
                value={profile.owner_name}
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Brand Logo URL
              </label>
              <input
                type="text"
                name="logo_url"
                placeholder="https://example.com/logo.png"
                value={profile.logo_url || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Contact Phone Number *
              </label>
              <input
                type="text"
                required
                name="mobile"
                value={profile.mobile}
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Official Email Address *
              </label>
              <input
                type="email"
                required
                name="email"
                value={profile.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Address & Location */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px' }}>
            Location & Physical Address
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Full Billing Address *
            </label>
            <textarea
              required
              rows={2}
              name="address"
              value={profile.address}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>City</label>
              <input type="text" name="city" value={profile.city || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>State</label>
              <input type="text" name="state" value={profile.state || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>PIN Code</label>
              <input type="text" name="pincode" value={profile.pincode || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Country</label>
              <input type="text" disabled value={profile.country || 'India'} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Tax & Regulatory Identifiers */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px' }}>
            Tax & Regulatory Identifiers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                GSTIN (Goods and Services Tax ID)
              </label>
              <input
                type="text"
                name="gstin"
                placeholder="27ABCDE1234F1Z5"
                value={profile.gstin || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Printed on customer tax invoices & cash memos</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                FSSAI License Number
              </label>
              <input
                type="text"
                name="fssai"
                placeholder="11521024000123"
                value={profile.fssai || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Food safety license printed on thermal receipts</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '30px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}
