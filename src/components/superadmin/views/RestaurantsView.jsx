import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Eye, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Key, 
  Sliders, 
  Monitor, 
  AlertCircle,
  Clock,
  Edit2,
  Lock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../../services/api';

export default function RestaurantsView({ onNavigate, preselectedTenant = null }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Modals & Active Selections
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    owner_name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    max_terminals: 2
  });

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.getRestaurantsList(statusFilter, search, token);
      setRestaurants(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleOpenViewModal = async (rest) => {
    setSelectedRestaurant(rest);
    setShowViewModal(true);
    setViewLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const details = await api.getRestaurantDetails(rest.tenant_id, token);
      setViewDetails(details);
    } catch (err) {
      alert('Failed to load full restaurant details: ' + err.message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenEditModal = (rest) => {
    setSelectedRestaurant(rest);
    setEditForm({
      name: rest.name,
      owner_name: rest.owner_name,
      mobile: rest.mobile,
      email: rest.email,
      address: rest.address || '',
      city: rest.city || 'Kalyan',
      state: rest.state || 'Maharashtra',
      pincode: rest.pincode || '421301',
      max_terminals: rest.terminal_limit || 2
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRestaurant) return;
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      await api.updateRestaurant(selectedRestaurant.tenant_id, editForm, token);
      setShowEditModal(false);
      fetchRestaurants();
      alert('Restaurant details updated successfully.');
    } catch (err) {
      alert('Failed to update restaurant: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (tenantId, action, reason = '', payload = {}) => {
    if (!confirm(`Are you sure you want to perform '${action.toUpperCase()}' on this restaurant?`)) return;
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      const res = await api.restaurantAction(tenantId, { action, reason, ...payload }, token);
      alert(res.message);
      fetchRestaurants();
      if (showViewModal && selectedRestaurant) {
        handleOpenViewModal(selectedRestaurant);
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('apex_admin_token');
      await api.restaurantAction(selectedRestaurant.tenant_id, {
        action: 'reset_password',
        new_password: newPassword
      }, token);
      setShowResetModal(false);
      setNewPassword('');
      alert('Password reset successfully. Owner will be required to change password upon next login.');
    } catch (err) {
      alert('Password reset failed: ' + err.message);
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
            Restaurant Accounts
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Manage registered restaurant tenants, annual subscriptions, terminal limits, and credentials.
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-restaurant')}
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
          <UserPlus size={16} /> Add Restaurant
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by restaurant name, owner, ID or mobile..."
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginRight: '4px' }}>Status:</span>
          {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === s ? '#2563eb' : '#f1f5f9',
                color: statusFilter === s ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: statusFilter === s ? '600' : '500',
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
          <button
            onClick={fetchRestaurants}
            title="Refresh Table"
            style={{
              padding: '6px 10px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', fontSize: '13px' }}>
            Loading restaurant accounts...
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <Building2 size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              No Restaurants Found
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              {statusFilter !== 'ALL' || search ? 'No records match your search or filter.' : 'Zero restaurants exist in the platform database.'}
            </p>
            <button
              onClick={() => onNavigate('add-restaurant')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
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
              <UserPlus size={14} /> Add Restaurant Now
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Restaurant ID</th>
                <th style={{ padding: '12px 16px' }}>Restaurant Name</th>
                <th style={{ padding: '12px 16px' }}>Owner</th>
                <th style={{ padding: '12px 16px' }}>Username</th>
                <th style={{ padding: '12px 16px' }}>Subscription</th>
                <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                <th style={{ padding: '12px 16px' }}>Terminals</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => {
                const isExpired = r.status === 'EXPIRED';
                const isSuspended = r.status === 'SUSPENDED';
                const isActive = r.status === 'ACTIVE';

                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#2563eb' }}>
                      {r.restaurant_id}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{r.mobile} • {r.city}</div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {r.owner_name}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#475569', fontFamily: 'monospace' }}>
                      {r.username}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '500' }}>
                        {r.subscription_plan}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: isExpired ? '#dc2626' : '#334155', fontWeight: isExpired ? '600' : 'normal' }}>
                      {r.subscription_expiry ? new Date(r.subscription_expiry).toLocaleDateString() : 'N/A'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: r.active_terminals >= r.terminal_limit ? '#ea580c' : '#16a34a'
                      }}>
                        <Monitor size={13} />
                        {r.active_terminals} / {r.terminal_limit}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: isActive ? '#dcfce7' : isSuspended ? '#fee2e2' : isExpired ? '#fef2f2' : '#fef3c7',
                        color: isActive ? '#166534' : isSuspended ? '#991b1b' : isExpired ? '#b91c1c' : '#92400e'
                      }}>
                        {r.status}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenViewModal(r)}
                          title="View Details"
                          style={{
                            padding: '6px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(r)}
                          title="Edit Details"
                          style={{
                            padding: '6px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={15} />
                        </button>

                        {isActive ? (
                          <button
                            onClick={() => handleAction(r.tenant_id, 'suspend', 'Suspended by admin')}
                            title="Suspend Account"
                            style={{
                              padding: '6px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <XCircle size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(r.tenant_id, 'activate', 'Activated by admin')}
                            title="Activate Account"
                            style={{
                              padding: '6px',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}

                        <button
                          onClick={() => handleAction(r.tenant_id, 'renew', 'Renewed annual license')}
                          title="Renew Subscription (+1 Year)"
                          style={{
                            padding: '6px',
                            background: '#f5f3ff',
                            color: '#7c3aed',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Clock size={15} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRestaurant(r);
                            setShowResetModal(true);
                          }}
                          title="Reset Password"
                          style={{
                            padding: '6px',
                            background: '#fffbeb',
                            color: '#b45309',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Key size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewModal && selectedRestaurant && (
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
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px' }}>
                  {selectedRestaurant.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  ID: {selectedRestaurant.restaurant_id} • Status: {selectedRestaurant.status}
                </span>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {viewLoading || !viewDetails ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>Loading full details...</div>
              ) : (
                <div>
                  {/* Entity Information */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#334155', textTransform: 'uppercase' }}>Restaurant Entity</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
                      <div><span style={{ color: '#64748b' }}>Owner:</span> <strong>{viewDetails.restaurant.owner_name}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Mobile:</span> <strong>{viewDetails.restaurant.mobile}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Email:</span> <strong>{viewDetails.restaurant.email}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Address:</span> {viewDetails.restaurant.address}</div>
                      <div><span style={{ color: '#64748b' }}>City/State:</span> {viewDetails.restaurant.city}, {viewDetails.restaurant.state}</div>
                      <div><span style={{ color: '#64748b' }}>GSTIN:</span> {viewDetails.restaurant.gstin || 'None'}</div>
                    </div>
                  </div>

                  {/* Registered Terminals */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#334155', textTransform: 'uppercase' }}>
                        Authorized Terminals ({viewDetails.terminals.length} / {viewDetails.restaurant.max_terminals})
                      </h4>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          onNavigate('terminals', viewDetails.restaurant.tenant_id);
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Manage Terminals →
                      </button>
                    </div>

                    {viewDetails.terminals.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
                        No terminals registered yet. Maximum allowed: {viewDetails.restaurant.max_terminals}.
                      </div>
                    ) : (
                      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', color: '#64748b', textAlign: 'left' }}>
                            <th style={{ padding: '6px 8px' }}>Terminal ID</th>
                            <th style={{ padding: '6px 8px' }}>Device ID</th>
                            <th style={{ padding: '6px 8px' }}>Name</th>
                            <th style={{ padding: '6px 8px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewDetails.terminals.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>{t.terminal_id}</td>
                              <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{t.device_id}</td>
                              <td style={{ padding: '6px 8px' }}>{t.device_name}</td>
                              <td style={{ padding: '6px 8px' }}>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  background: t.status === 'AUTHORIZED' ? '#dcfce7' : '#fee2e2',
                                  color: t.status === 'AUTHORIZED' ? '#166534' : '#991b1b'
                                }}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Feature Permissions */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#334155', textTransform: 'uppercase' }}>
                        Licensed Feature Modules
                      </h4>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          onNavigate('features', viewDetails.restaurant.tenant_id);
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Edit Permissions →
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {viewDetails.feature_permissions.map(p => (
                        <div
                          key={p.feature_key}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: p.is_enabled ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${p.is_enabled ? '#bbf7d0' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ fontWeight: '500', color: p.is_enabled ? '#166534' : '#64748b' }}>{p.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: p.is_enabled ? '#16a34a' : '#94a3b8' }}>
                            {p.is_enabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRestaurant && (
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
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px' }}>
              Edit Details for {selectedRestaurant.name}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Restaurant Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Owner Name</label>
                <input
                  type="text"
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Mobile Number</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Address</label>
              <textarea
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Terminal Limit (Max Allowed)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={editForm.max_terminals}
                onChange={(e) => setEditForm({ ...editForm, max_terminals: parseInt(e.target.value) || 1 })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSaveEdit}
                style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedRestaurant && (
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
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px' }}>
              Reset Owner Login Password
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
              Reset password for <strong>{selectedRestaurant.name}</strong> (Username: <code>{selectedRestaurant.username}</code>).
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                New Temporary Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#1e40af',
              marginBottom: '20px'
            }}>
              ✓ The owner will be required to change this password on their next login session.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword('');
                }}
                style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleResetPasswordSubmit}
                style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                {actionLoading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
