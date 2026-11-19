import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Layers, 
  Users, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function TableManagementView() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: '',
    section: 'Main Dining',
    capacity: 4,
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const sectionsList = ['Main Dining', 'AC Hall', 'Garden', 'Family Section', 'Rooftop', 'Bar'];

  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTables();
      setTables(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({
      table_number: '',
      section: 'Main Dining',
      capacity: 4,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTable(t);
    setFormData({
      table_number: t.table_number,
      section: t.section,
      capacity: t.capacity,
      is_active: t.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.table_number.trim()) {
      setError('Table number is required (e.g. 01, T-01)');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingTable) {
        await api.updateTable(editingTable.id, formData);
        setSuccess(`Table ${formData.table_number} updated successfully`);
      } else {
        await api.createTable(formData);
        setSuccess(`Table ${formData.table_number} added successfully`);
      }
      setShowModal(false);
      loadTables();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save table');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, tableNum) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNum}?`)) return;
    try {
      await api.deleteTable(id);
      setSuccess(`Table ${tableNum} deleted`);
      loadTables();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete table');
    }
  };

  const filteredTables = tables.filter(t => {
    const matchesSearch = t.table_number.toLowerCase().includes(search.toLowerCase()) ||
                          t.section.toLowerCase().includes(search.toLowerCase());
    const matchesSection = filterSection === 'ALL' || t.section === filterSection;
    return matchesSearch && matchesSection;
  });

  const availableSections = ['ALL', ...new Set(tables.map(t => t.section))];

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store style={{ color: '#0284c7' }} /> Table Management
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Configure dining tables, seating capacity, and floor sections (AC Hall, Garden, Main Dining).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={loadTables}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            <Plus size={18} /> Add Table
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

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Tables</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{tables.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase' }}>Active Tables</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', marginTop: '4px' }}>{tables.filter(t => t.is_active).length}</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase' }}>Total Seating Capacity</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284c7', marginTop: '4px' }}>{tables.reduce((acc, t) => acc + (t.capacity || 0), 0)} seats</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#8b5cf6', textTransform: 'uppercase' }}>Floor Sections</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '4px' }}>{new Set(tables.map(t => t.section)).size}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search table number or section..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Section:</span>
          <select 
            value={filterSection} 
            onChange={e => setFilterSection(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
          >
            {availableSections.map(sec => (
              <option key={sec} value={sec}>{sec === 'ALL' ? 'All Sections' : sec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tables Grid / Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading dining tables...</p>
        </div>
      ) : tables.length === 0 ? (
        <div style={{ background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
          <Store size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>Zero Dining Tables Configured</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
            This newly provisioned restaurant starts with 0 tables. Add your restaurant's tables (e.g. Table 01, T-02) to prepare for order taking.
          </p>
          <button 
            onClick={handleOpenAdd}
            style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            + Add First Table
          </button>
        </div>
      ) : filteredTables.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No tables match your filter criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {filteredTables.map(t => (
            <div 
              key={t.id} 
              style={{ 
                background: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '10px', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                    Table {t.table_number}
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    background: t.is_active ? '#dcfce7' : '#fee2e2',
                    color: t.is_active ? '#15803d' : '#b91c1c'
                  }}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>
                  <Layers size={14} /> Section: <span style={{ fontWeight: '500', color: '#1e293b' }}>{t.section}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                  <Users size={14} /> Capacity: <span style={{ fontWeight: '500', color: '#1e293b' }}>{t.capacity} seats</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '16px' }}>
                <button 
                  onClick={() => handleOpenEdit(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#334155' }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(t.id, t.table_number)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#b91c1c' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '440px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {editingTable ? `Edit Table ${editingTable.table_number}` : 'Add New Dining Table'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Table Number / Identifier *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 01, 02, T-10, VIP-1"
                  value={formData.table_number}
                  onChange={e => setFormData({ ...formData, table_number: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Floor Section
                </label>
                <select 
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
                >
                  {sectionsList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Seating Capacity (Guests)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="table_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="table_active" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  Table is active and open for seating
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
                  {saving ? 'Saving...' : editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}