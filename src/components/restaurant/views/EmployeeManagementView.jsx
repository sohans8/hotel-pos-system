import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Shield, 
  Phone, 
  BadgeCheck, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function EmployeeManagementView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    role: 'WAITER',
    phone: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const rolesList = ['WAITER', 'CAPTAIN', 'CASHIER', 'CHEF', 'MANAGER'];

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      employee_code: '',
      name: '',
      role: 'WAITER',
      phone: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      employee_code: emp.employee_code,
      name: emp.name,
      role: emp.role,
      phone: emp.phone || '',
      is_active: emp.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_code.trim()) {
      setError('Employee code is required (e.g. E01, W02)');
      return;
    }
    if (!formData.name.trim()) {
      setError('Staff name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingEmp) {
        await api.updateEmployee(editingEmp.id, formData);
        setSuccess(`Employee ${formData.name} (${formData.employee_code}) updated`);
      } else {
        await api.createEmployee(formData);
        setSuccess(`Employee ${formData.name} (${formData.employee_code}) added`);
      }
      setShowModal(false);
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name, code) => {
    if (!window.confirm(`Are you sure you want to delete ${name} (${code})?`)) return;
    try {
      await api.deleteEmployee(id);
      setSuccess(`Employee ${code} deleted`);
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                          emp.employee_code.toLowerCase().includes(search.toLowerCase()) ||
                          (emp.phone && emp.phone.includes(search));
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ color: '#0284c7' }} /> Employee & Staff Management
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Configure waiters, captains, cashiers, and assigned employee codes (E01, E02) for rapid keyboard-driven order punching.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={loadEmployees}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <Check size={18} /> {success}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Staff</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{employees.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase' }}>Active Waiters</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', marginTop: '4px' }}>
            {employees.filter(e => e.role === 'WAITER' && e.is_active).length}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase' }}>Captains & Cashiers</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284c7', marginTop: '4px' }}>
            {employees.filter(e => ['CAPTAIN', 'CASHIER'].includes(e.role)).length}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#8b5cf6', textTransform: 'uppercase' }}>Keyboard Codes</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '4px' }}>
            {employees.map(e => e.employee_code).length} Codes
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by name, employee code (e.g. E01), or phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Role:</span>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
          >
            <option value="ALL">All Roles</option>
            {rolesList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table / Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading staff members...</p>
        </div>
      ) : employees.length === 0 ? (
        <div style={{ background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
          <Users size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>Zero Staff Configured</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
            This newly provisioned restaurant starts with 0 employees. Add your waiters and assign rapid short codes (e.g. E01 = Rahul, E02 = Amit).
          </p>
          <button 
            onClick={handleOpenAdd}
            style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            + Add First Employee
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No staff match your search criteria.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>CODE</th>
                <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>STAFF NAME</th>
                <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>ROLE</th>
                <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>PHONE</th>
                <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>STATUS</th>
                <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      background: '#f1f5f9', 
                      color: '#0284c7', 
                      fontWeight: '700', 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      {emp.employee_code}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a' }}>
                    {emp.name}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: emp.role === 'WAITER' ? '#e0f2fe' : emp.role === 'CAPTAIN' ? '#f3e8ff' : '#fef3c7',
                      color: emp.role === 'WAITER' ? '#0369a1' : emp.role === 'CAPTAIN' ? '#6b21a8' : '#92400e'
                    }}>
                      {emp.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    {emp.phone || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      background: emp.is_active ? '#dcfce7' : '#fee2e2',
                      color: emp.is_active ? '#15803d' : '#b91c1c'
                    }}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenEdit(emp)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', marginRight: '14px', padding: '4px' }}
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id, emp.name, emp.employee_code)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '440px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {editingEmp ? `Edit Staff: ${editingEmp.name}` : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Employee Short Code * (Used in POS Order Entry)
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. E01, E02, W01"
                  value={formData.employee_code}
                  onChange={e => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', fontWeight: '600', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Typing this code on the POS order screen auto-selects the staff member.
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Role / Designation
                </label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
                >
                  {rolesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Phone Number (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="emp_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="emp_active" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  Active employee (can take orders)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '9px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#475569' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{ padding: '9px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  {saving ? 'Saving...' : editingEmp ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}