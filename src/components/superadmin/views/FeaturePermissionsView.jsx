import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Plus, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../../../services/api';

export default function FeaturePermissionsView({ onNavigate, preselectedTenant = null }) {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(preselectedTenant || '');
  const [featuresRegistry, setFeaturesRegistry] = useState([]);
  const [restaurantFeatures, setRestaurantFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    feature_key: '',
    name: '',
    description: '',
    category: 'Core Operations'
  });
  const [savingFeature, setSavingFeature] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_admin_token');
      
      const [allRest, allFeat] = await Promise.all([
        api.getRestaurantsList('ALL', '', token),
        api.getFeatures(token)
      ]);

      setRestaurants(allRest);
      setFeaturesRegistry(allFeat);

      const targetTenant = selectedTenant || (allRest.length > 0 ? allRest[0].tenant_id : '');
      if (targetTenant) {
        setSelectedTenant(targetTenant);
        const tenantFeat = await api.getRestaurantFeatures(targetTenant, token);
        setRestaurantFeatures(tenantFeat);
      }
    } catch (err) {
      setError(err.message || 'Failed to load feature permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectTenant = async (tenantId) => {
    setSelectedTenant(tenantId);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const tenantFeat = await api.getRestaurantFeatures(tenantId, token);
      setRestaurantFeatures(tenantFeat);
    } catch (err) {
      alert('Failed to load restaurant features: ' + err.message);
    }
  };

  const handleToggle = async (featureKey, currentStatus) => {
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const nextStatus = !currentStatus;
      await api.toggleRestaurantFeature(selectedTenant, featureKey, nextStatus, token);
      
      // Update local state
      setRestaurantFeatures(prev => prev.map(f => {
        if (f.feature_key === featureKey) {
          return { ...f, is_enabled: nextStatus };
        }
        return f;
      }));
    } catch (err) {
      alert('Failed to toggle feature: ' + err.message);
    }
  };

  const handleAddFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!newFeature.feature_key.trim() || !newFeature.name.trim()) {
      alert('Feature key and name are required.');
      return;
    }
    setSavingFeature(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      await api.addFeature(newFeature, token);
      setShowAddModal(false);
      setNewFeature({ feature_key: '', name: '', description: '', category: 'Core Operations' });
      fetchData();
      alert('New modular feature added to platform registry.');
    } catch (err) {
      alert('Failed to add feature: ' + err.message);
    } finally {
      setSavingFeature(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Feature Permissions & Modular Registry
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Fine-grained license access control. Selectively enable or disable features per restaurant tenant.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
          }}
        >
          <Plus size={16} /> Register New Software Feature
        </button>
      </div>

      {/* Security Architecture Box */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '2px' }}>
            Modular Feature Permission Engine
          </div>
          <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0, lineHeight: '1.4' }}>
            When a feature is disabled for a restaurant, its protected backend APIs return HTTP 403 Forbidden, and entry points are hidden on client terminals. Historical data is fully preserved. Future platform updates introduce new modules into this central registry that can be selectively licensed to individual restaurants.
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

      {/* Tenant Selector & Permissions View */}
      {restaurants.length === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          <Sliders size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px' }}>
            No Restaurants Registered
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
            Feature permissions are scoped per restaurant. Please register a restaurant first to assign and manage feature permissions.
          </p>
          <button
            onClick={() => onNavigate('add-restaurant')}
            style={{
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
            Add Restaurant
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          
          {/* Restaurant Selector Sidebar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            height: 'fit-content',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
              Select Restaurant
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {restaurants.map((r) => {
                const isSelected = selectedTenant === r.tenant_id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectTenant(r.tenant_id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1e40af' : '#0f172a',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{r.restaurant_id}</div>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: r.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: r.status === 'ACTIVE' ? '#166534' : '#991b1b'
                    }}>
                      {r.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Matrix for Selected Restaurant */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                  Feature Entitlements for {restaurants.find(r => r.tenant_id === selectedTenant)?.name || 'Selected Restaurant'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Click toggle button to instantly enable or revoke access for this restaurant
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {restaurantFeatures.map((f) => {
                const isEnabled = f.is_enabled;

                return (
                  <div
                    key={f.feature_key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      background: isEnabled ? '#f8fafc' : '#fafafa',
                      border: `1px solid ${isEnabled ? '#cbd5e1' : '#e2e8f0'}`
                    }}
                  >
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: isEnabled ? '#0f172a' : '#64748b' }}>
                          {f.name}
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: '#e2e8f0',
                          color: '#475569',
                          fontFamily: 'monospace'
                        }}>
                          {f.feature_key}
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: '#f1f5f9',
                          color: '#0284c7'
                        }}>
                          {f.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {f.description}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => handleToggle(f.feature_key, isEnabled)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: 'none',
                          background: isEnabled ? '#16a34a' : '#cbd5e1',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isEnabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* REGISTER NEW FEATURE MODAL (SECTION G) */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: '0 0 8px' }}>
              Register New Software Module
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
              Add a new modular upgrade feature to the platform registry. It can then be selectively granted to restaurants.
            </p>

            <form onSubmit={handleAddFeatureSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Feature Key (Unique Identifier) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. table_qr_ordering"
                  value={newFeature.feature_key}
                  onChange={(e) => setNewFeature({ ...newFeature, feature_key: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Feature Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table QR Self-Ordering"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newFeature.category}
                  onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', background: '#ffffff' }}
                >
                  <option value="Core Operations">Core Operations</option>
                  <option value="Kitchen Operations">Kitchen Operations</option>
                  <option value="Billing Operations">Billing Operations</option>
                  <option value="Hardware Integration">Hardware Integration</option>
                  <option value="Marketing & CRM">Marketing & CRM</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Inventory">Inventory</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of feature capabilities..."
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFeature}
                  style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {savingFeature ? 'Registering...' : 'Register Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
