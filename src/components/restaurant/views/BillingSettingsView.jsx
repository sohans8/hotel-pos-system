import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Check, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Percent, 
  DollarSign, 
  Sliders, 
  FileText 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function BillingSettingsView() {
  const [formData, setFormData] = useState({
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    service_charge_rate: 0.0,
    round_off_bills: true,
    currency_symbol: '₹',
    receipt_header: 'Welcome to our Restaurant! We hope you enjoy your meal.',
    receipt_footer: 'Thank you for dining with us! Please visit again.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getBillingSettings();
      if (data) {
        setFormData({
          cgst_rate: data.cgst_rate ?? 2.5,
          sgst_rate: data.sgst_rate ?? 2.5,
          service_charge_rate: data.service_charge_rate ?? 0.0,
          round_off_bills: data.round_off_bills ?? true,
          currency_symbol: data.currency_symbol || '₹',
          receipt_header: data.receipt_header || '',
          receipt_footer: data.receipt_footer || ''
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load billing parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.updateBillingSettings({
        cgst_rate: parseFloat(formData.cgst_rate) || 0,
        sgst_rate: parseFloat(formData.sgst_rate) || 0,
        service_charge_rate: parseFloat(formData.service_charge_rate) || 0,
        round_off_bills: Boolean(formData.round_off_bills),
        currency_symbol: formData.currency_symbol,
        receipt_header: formData.receipt_header,
        receipt_footer: formData.receipt_footer
      });
      setSuccess('Billing and tax settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update billing settings');
    } finally {
      setSaving(false);
    }
  };

  const totalGst = (parseFloat(formData.cgst_rate) || 0) + (parseFloat(formData.sgst_rate) || 0);

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt style={{ color: '#0284c7' }} /> Billing & Tax Configuration
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Configure GST / VAT rates, service charge, cash memo round-off rounding, currency, and custom receipt notes.
          </p>
        </div>
        <button 
          onClick={loadSettings}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}
        >
          <RefreshCw size={15} /> Reset
        </button>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading tax and billing configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Tax Rates Card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Percent size={18} style={{ color: '#0284c7' }} /> Goods & Services Tax (GST) Rates
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  CGST Rate (%)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="50"
                    value={formData.cgst_rate}
                    onChange={e => setFormData({ ...formData, cgst_rate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '9px', color: '#94a3b8', fontSize: '13px' }}>%</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Central GST (Default 2.5%)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  SGST Rate (%)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="50"
                    value={formData.sgst_rate}
                    onChange={e => setFormData({ ...formData, sgst_rate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '9px', color: '#94a3b8', fontSize: '13px' }}>%</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>State GST (Default 2.5%)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Optional Service Charge (%)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0" 
                    max="30"
                    value={formData.service_charge_rate}
                    onChange={e => setFormData({ ...formData, service_charge_rate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '9px', color: '#94a3b8', fontSize: '13px' }}>%</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Set to 0 if not applied</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Effective Combined Tax Rate:</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0284c7' }}>
                Total GST = {totalGst}% (CGST {formData.cgst_rate}% + SGST {formData.sgst_rate}%)
              </span>
            </div>
          </div>

          {/* Currency and Calculation Parameters */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: '#0284c7' }} /> Calculation & Display Rules
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Currency Symbol
                </label>
                <input 
                  type="text" 
                  value={formData.currency_symbol}
                  onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '24px' }}>
                <input 
                  type="checkbox" 
                  id="round_off_bills"
                  checked={formData.round_off_bills}
                  onChange={e => setFormData({ ...formData, round_off_bills: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="round_off_bills" style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', cursor: 'pointer' }}>
                  Auto Round-off Final Invoice Amounts to Nearest Rupee (Recommended)
                </label>
              </div>
            </div>
          </div>

          {/* Receipt Custom Messages */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: '#0284c7' }} /> Printed Cash Memo Header & Footer Notes
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Receipt Header Greeting
              </label>
              <input 
                type="text" 
                value={formData.receipt_header}
                onChange={e => setFormData({ ...formData, receipt_header: e.target.value })}
                placeholder="e.g. Pure Vegetarian Indian Cuisine"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Receipt Footer Closing Note
              </label>
              <textarea 
                rows="2"
                value={formData.receipt_footer}
                onChange={e => setFormData({ ...formData, receipt_footer: e.target.value })}
                placeholder="e.g. Thank you for dining with us! For catering call: 9876543210"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Billing Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}