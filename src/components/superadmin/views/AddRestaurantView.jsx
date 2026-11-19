import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Key, 
  Lock, 
  Monitor, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AddRestaurantView({ onNavigate }) {
  const [formData, setFormData] = useState({
    restaurant_name: '',
    owner_name: '',
    mobile: '',
    email: '',
    address: '',
    city: 'Kalyan',
    state: 'Maharashtra',
    pincode: '421301',
    country: 'India',
    gstin: '',
    fssai: '',
    restaurant_type: 'Family Restaurant',
    username: '',
    initial_password: '',
    max_terminals: 2
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Auto-generate calculated dates
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_terminals' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (isActivated) => {
    setError('');
    
    // Validations
    if (!formData.restaurant_name.trim() || !formData.owner_name.trim()) {
      setError('Restaurant name and owner name are mandatory.');
      return;
    }
    if (!formData.mobile.trim() || !formData.email.trim()) {
      setError('Mobile number and email are mandatory.');
      return;
    }
    if (!formData.address.trim()) {
      setError('Business address is required.');
      return;
    }
    if (!formData.username.trim() || !formData.initial_password.trim()) {
      setError('Login username and initial password are required.');
      return;
    }
    if (formData.initial_password.length < 6) {
      setError('Initial password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const payload = {
        ...formData,
        is_activated: isActivated
      };
      const res = await api.addRestaurant(payload, token);
      setSuccessResult(res);
    } catch (err) {
      setError(err.message || 'Failed to onboard restaurant.');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div style={{ flex: 1, padding: '36px', background: '#f8fafc', overflowY: 'auto' }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={32} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px' }}>
            Restaurant Registered Successfully!
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>
            The tenant has been provisioned with an annual 1-year subscription and license key.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Restaurant ID:</span>
                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{successResult.restaurant_id}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Account Status:</span>
                <div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: successResult.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                    color: successResult.status === 'ACTIVE' ? '#166534' : '#92400e'
                  }}>
                    {successResult.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>License Key:</span>
                <div style={{ fontWeight: '600', color: '#2563eb' }}>{successResult.license_id}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Subscription ID:</span>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{successResult.subscription_id}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Activation Date:</span>
                <div style={{ color: '#334155' }}>{new Date(successResult.activation_date).toLocaleDateString()}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Annual Expiry Date:</span>
                <div style={{ fontWeight: '600', color: '#16a34a' }}>{new Date(successResult.expiry_date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '12px 16px',
            borderRadius: '6px',
            color: '#b45309',
            fontSize: '12px',
            textAlign: 'left',
            marginBottom: '24px',
            display: 'flex',
            gap: '8px'
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Security Policy Enforced:</strong> The restaurant owner credentials have been created with <code>must_change_password = True</code>. Upon their first login, they will be required to choose a new private password.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => onNavigate('restaurants')}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View in Restaurants List
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setFormData({
                  restaurant_name: '',
                  owner_name: '',
                  mobile: '',
                  email: '',
                  address: '',
                  city: 'Kalyan',
                  state: 'Maharashtra',
                  pincode: '421301',
                  country: 'India',
                  gstin: '',
                  fssai: '',
                  restaurant_type: 'Family Restaurant',
                  username: '',
                  initial_password: '',
                  max_terminals: 2
                });
              }}
              style={{
                padding: '10px 20px',
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Register Another Restaurant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => onNavigate('restaurants')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '6px',
              padding: 0
            }}
          >
            <ArrowLeft size={14} /> Back to Restaurants
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Add New Restaurant Client
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Register restaurant entity, provision 1-year annual license, and configure POS terminals.
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
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div style={{ maxWidth: '960px' }}>
        
        {/* Section 1: Business Details */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#2563eb" /> 1. Business & Entity Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Restaurant Name *
              </label>
              <input
                type="text"
                name="restaurant_name"
                value={formData.restaurant_name}
                onChange={handleChange}
                placeholder="e.g. Hotel Royal, Thane"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Restaurant Type
              </label>
              <select
                name="restaurant_type"
                value={formData.restaurant_type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Family Restaurant">Family Restaurant</option>
                <option value="Fine Dining">Fine Dining</option>
                <option value="Casual Dining">Casual Dining</option>
                <option value="Dhaba">Dhaba</option>
                <option value="Café">Café</option>
                <option value="Bar & Restaurant">Bar & Restaurant</option>
                <option value="Cloud Kitchen">Cloud Kitchen</option>
                <option value="Food Court">Food Court</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Owner Name *
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Shetty"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9819723454"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. owner@hotelroyal.in"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Full Business Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="Shop No. 4-5, Near Station Road, Kalyan (W)"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>PIN Code</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                GSTIN (Optional)
              </label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="27ABCDE1234F1Z5"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                FSSAI License No. (Optional)
              </label>
              <input
                type="text"
                name="fssai"
                value={formData.fssai}
                onChange={handleChange}
                placeholder="11521024000123"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Annual Subscription & Terminal Capacity */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#2563eb" /> 2. Annual 1-Year Subscription & Hardware Capacity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Subscription Policy (Release 1.0)
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>
                Annual 1-Year Commercial License
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Validity: <strong>365 Days</strong> from activation date ({today.toLocaleDateString()} to {nextYear.toLocaleDateString()})
              </div>
              <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>
                ✓ Includes all modular feature entitlements by default
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Number of Allowed Terminals (Hardware Limit) *
              </label>
              <input
                type="number"
                name="max_terminals"
                value={formData.max_terminals}
                onChange={handleChange}
                min={1}
                max={50}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0' }}>
                Defines the maximum simultaneous POS machines/terminals authorized to connect for this restaurant.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Owner Account Credentials */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="#2563eb" /> 3. Owner Login Credentials
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Restaurant Login Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. hotelroyal"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Initial Password (Securely Hashed) *
              </label>
              <input
                type="password"
                name="initial_password"
                value={formData.initial_password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} />
            <span>
              <strong>First-Login Password Policy:</strong> The password will be hashed using Bcrypt. The owner will be required to change it on their initial sign-in.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', paddingBottom: '30px' }}>
          <button
            type="button"
            onClick={() => onNavigate('restaurants')}
            style={{
              padding: '10px 18px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Save as Pending (Review Later)
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            style={{
              padding: '10px 24px',
              background: '#2563eb',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
            }}
          >
            {loading ? 'Registering...' : 'Approve & Activate Restaurant'}
          </button>
        </div>

      </div>

    </div>
  );
}
