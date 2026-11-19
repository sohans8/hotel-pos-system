import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Wifi, 
  Usb, 
  Bluetooth, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function PrinterSettingsView() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Main Cashier Printer',
    printer_type: 'RECEIPT',
    connection_type: 'NETWORK',
    ip_address: '192.168.1.200',
    port: 9100,
    paper_width_mm: 80,
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const loadPrinters = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPrinters();
      setPrinters(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load printer configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleOpenAdd = () => {
    setEditingPrinter(null);
    setFormData({
      name: 'Main Cashier Printer',
      printer_type: 'RECEIPT',
      connection_type: 'NETWORK',
      ip_address: '192.168.1.200',
      port: 9100,
      paper_width_mm: 80,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPrinter(p);
    setFormData({
      name: p.name,
      printer_type: p.printer_type,
      connection_type: p.connection_type,
      ip_address: p.ip_address || '',
      port: p.port || 9100,
      paper_width_mm: p.paper_width_mm || 80,
      is_active: p.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Printer name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingPrinter) {
        await api.updatePrinter(editingPrinter.id, formData);
        setSuccess(`Printer "${formData.name}" updated successfully`);
      } else {
        await api.createPrinter(formData);
        setSuccess(`Printer "${formData.name}" configured successfully`);
      }
      setShowModal(false);
      loadPrinters();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save printer configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete printer "${name}"?`)) return;
    try {
      await api.deletePrinter(id);
      setSuccess(`Printer "${name}" removed`);
      loadPrinters();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete printer');
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer style={{ color: '#0284c7' }} /> Thermal Printer Settings
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Configure thermal receipt printers, Kitchen Order Ticket (KOT) printers, network IP endpoints, and paper formats (80mm / 58mm).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={loadPrinters}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            <Plus size={18} /> Add Printer
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

      {/* Printer List / Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading printer hardware profiles...</p>
        </div>
      ) : printers.length === 0 ? (
        <div style={{ background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
          <Printer size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>Zero Printers Configured</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
            This newly provisioned restaurant starts with 0 hardware configurations. Add a cashier receipt printer (80mm) or Kitchen KOT printer.
          </p>
          <button 
            onClick={handleOpenAdd}
            style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            + Add First Printer
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {printers.map(p => (
            <div 
              key={p.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '8px', 
                      background: p.printer_type === 'RECEIPT' ? '#e0f2fe' : '#fef3c7',
                      color: p.printer_type === 'RECEIPT' ? '#0369a1' : '#b45309',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Printer size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{p.name}</h3>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        {p.printer_type === 'RECEIPT' ? 'Cashier Receipt Printer' : 'Kitchen KOT Printer'}
                      </span>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    background: p.is_active ? '#dcfce7' : '#fee2e2',
                    color: p.is_active ? '#15803d' : '#b91c1c'
                  }}>
                    {p.is_active ? 'Online' : 'Disabled'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Interface:</span>
                    <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {p.connection_type === 'NETWORK' && <Wifi size={13} style={{ color: '#0284c7' }} />}
                      {p.connection_type === 'USB' && <Usb size={13} style={{ color: '#16a34a' }} />}
                      {p.connection_type === 'BLUETOOTH' && <Bluetooth size={13} style={{ color: '#6366f1' }} />}
                      {p.connection_type}
                    </span>
                  </div>

                  {p.connection_type === 'NETWORK' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>IP & Port:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                        {p.ip_address || '127.0.0.1'}:{p.port || 9100}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Paper Width:</span>
                    <span style={{ fontWeight: '600' }}>
                      {p.paper_width_mm} mm (ESC/POS)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px' }}>
                <button 
                  onClick={() => handleOpenEdit(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#334155' }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(p.id, p.name)}
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
          <div style={{ background: '#fff', width: '100%', maxWidth: '460px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {editingPrinter ? `Edit Printer: ${editingPrinter.name}` : 'Configure Thermal Printer'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Printer Identifier / Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cashier Main 80mm, Kitchen Tandoor KOT"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Printer Purpose
                  </label>
                  <select 
                    value={formData.printer_type}
                    onChange={e => setFormData({ ...formData, printer_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="RECEIPT">Customer Receipt</option>
                    <option value="KOT">Kitchen KOT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Connection
                  </label>
                  <select 
                    value={formData.connection_type}
                    onChange={e => setFormData({ ...formData, connection_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="NETWORK">Ethernet / LAN (TCP/IP)</option>
                    <option value="USB">Direct USB</option>
                    <option value="BLUETOOTH">Bluetooth Wireless</option>
                  </select>
                </div>
              </div>

              {formData.connection_type === 'NETWORK' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      IP Address
                    </label>
                    <input 
                      type="text" 
                      placeholder="192.168.1.200"
                      value={formData.ip_address}
                      onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Raw Port
                    </label>
                    <input 
                      type="number" 
                      value={formData.port}
                      onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) || 9100 })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Paper Roll Size
                </label>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="paper_width" 
                      checked={formData.paper_width_mm === 80} 
                      onChange={() => setFormData({ ...formData, paper_width_mm: 80 })} 
                    />
                    80 mm (Standard 3-Inch)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="paper_width" 
                      checked={formData.paper_width_mm === 58} 
                      onChange={() => setFormData({ ...formData, paper_width_mm: 58 })} 
                    />
                    58 mm (Compact 2-Inch)
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="printer_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="printer_active" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  Enable this printer for active printing
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
                  {saving ? 'Saving...' : editingPrinter ? 'Save Changes' : 'Save Printer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}