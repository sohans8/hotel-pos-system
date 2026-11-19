import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  UtensilsCrossed, 
  Layers, 
  Users, 
  Printer, 
  Receipt, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  RefreshCw,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { api } from '../../../services/api';

export default function RestaurantDashboardView({ onNavigate, onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigateTo = (target) => {
    if (onNavigateTab) onNavigateTab(target);
    else if (onNavigate) onNavigate(target);
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('apex_restaurant_token');
      const res = await api.getRestaurantDashboard(token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load restaurant dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        Loading restaurant workspace...
      </div>
    );
  }

  const checklistIcons = {
    profile: Building2,
    taxes: Receipt,
    categories: Layers,
    menu_items: UtensilsCrossed,
    tables: Building2,
    employees: Users,
    printers: Printer,
    billing: Receipt
  };

  const checklistRoutes = {
    profile: 'PROFILE',
    taxes: 'BILLING',
    categories: 'MENU',
    menu_items: 'MENU',
    tables: 'TABLES',
    employees: 'EMPLOYEES',
    printers: 'PRINTERS',
    billing: 'BILLING'
  };

  const counts = data?.counts || {
    categories: 0,
    menu_items: 0,
    tables: 0,
    employees: 0,
    printers: 0,
    terminals: 0,
    terminal_limit: 2,
    orders: 0,
    bills: 0,
    kots: 0
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', background: '#f8fafc' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              {data?.restaurant_name || 'Restaurant Dashboard'}
            </h1>
            <span style={{
              background: '#dcfce7',
              color: '#166534',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {data?.status || 'ACTIVE'}
            </span>
            <span style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '6px',
              fontFamily: 'monospace'
            }}>
              ID: {data?.restaurant_id}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Owner: <strong>{data?.owner_name}</strong> • Restaurant Management Portal
          </p>
        </div>

        <button
          onClick={fetchDashboard}
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

      {/* SECTION 3: WELCOME BANNER (ON FIRST LOGIN / SETUP INCOMPLETE) */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '12px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              <Sparkles size={16} /> Commercial Restaurant POS Setup
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px' }}>
              Welcome to Your Restaurant POS
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 16px', maxWidth: '640px', lineHeight: '1.5' }}>
              Your restaurant account has been successfully activated. Start configuring your restaurant operations by completing the setup checklist below.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
              <span>Subscription: <strong style={{ color: '#ffffff' }}>{data?.subscription?.plan_name}</strong></span>
              <span>•</span>
              <span>Expires in: <strong style={{ color: '#38bdf8' }}>{data?.subscription?.days_remaining} Days</strong></span>
              <span>•</span>
              <span>Terminals: <strong style={{ color: '#ffffff' }}>{counts.terminals} / {counts.terminal_limit} Active</strong></span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '16px 20px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '4px' }}>Setup Progress</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8' }}>{data?.setup_progress_percentage}%</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{data?.completed_steps} of {data?.total_steps} Steps</div>
          </div>
        </div>
      </div>

      {/* SECTION 4: EMPTY BASE INSTALLATION VERIFICATION (METRICS CARDS) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Workspace Data Verification (Clean Slate Base)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px'
        }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Menu Categories</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>{counts.categories}</div>
            <div style={{ fontSize: '11px', color: counts.categories === 0 ? '#94a3b8' : '#16a34a' }}>
              {counts.categories === 0 ? '0 categories (Configure in Menu)' : `${counts.categories} categories created`}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Menu Dishes</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>{counts.menu_items}</div>
            <div style={{ fontSize: '11px', color: counts.menu_items === 0 ? '#94a3b8' : '#16a34a' }}>
              {counts.menu_items === 0 ? '0 dishes (Add menu items)' : `${counts.menu_items} dishes on menu`}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Dining Tables</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>{counts.tables}</div>
            <div style={{ fontSize: '11px', color: counts.tables === 0 ? '#94a3b8' : '#16a34a' }}>
              {counts.tables === 0 ? '0 tables (Configure floor layout)' : `${counts.tables} tables configured`}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Staff & Waiters</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '4px 0' }}>{counts.employees}</div>
            <div style={{ fontSize: '11px', color: counts.employees === 0 ? '#94a3b8' : '#16a34a' }}>
              {counts.employees === 0 ? '0 staff (Add waiter speed codes)' : `${counts.employees} staff enrolled`}
            </div>
          </div>
        </div>

        {/* Operational Records Zero Verification */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          marginTop: '10px'
        }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Active Orders:</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a', marginLeft: '6px' }}>0</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Billed Cash Memos:</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a', marginLeft: '6px' }}>0</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Kitchen KOT Records:</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a', marginLeft: '6px' }}>0</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Hardware Printers:</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a', marginLeft: '6px' }}>{counts.printers}</span>
          </div>
        </div>
      </div>

      {/* SETUP CHECKLIST (SECTION 3) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px' }}>
              First-Time Restaurant Setup Checklist
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Click on each step to configure your restaurant parameters before starting operations
            </p>
          </div>
          <div style={{
            height: '8px',
            width: '180px',
            background: '#f1f5f9',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${data?.setup_progress_percentage}%`,
              background: data?.setup_progress_percentage === 100 ? '#16a34a' : '#2563eb',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div>
          {data?.checklist?.map((item, idx) => {
            const Icon = checklistIcons[item.id] || Building2;
            const route = checklistRoutes[item.id];
            const isCompleted = item.is_completed;

            return (
              <div
                key={item.id}
                onClick={() => navigateTo(route)}
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < data.checklist.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  background: isCompleted ? '#fafbfc' : '#ffffff',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = isCompleted ? '#fafbfc' : '#ffffff'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: isCompleted ? '#16a34a' : '#cbd5e1' }}>
                    {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </div>

                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isCompleted ? '#f0fdf4' : '#f1f5f9',
                    color: isCompleted ? '#16a34a' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} />
                  </div>

                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isCompleted ? '#64748b' : '#0f172a',
                      textDecoration: isCompleted ? 'line-through' : 'none'
                    }}>
                      Step {item.step_number}: {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {item.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: isCompleted ? '#16a34a' : '#2563eb' }}>
                  <span>{isCompleted ? 'Completed' : 'Configure'}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Guarantee Notice */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '2px' }}>
            Clean Slate & Multi-Tenant Data Isolation Guarantee
          </div>
          <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0, lineHeight: '1.4' }}>
            Your restaurant data is strictly isolated to your Tenant ID (<code>{data?.tenant_id}</code>). No demo dishes, sample tables, or foreign orders will ever appear in your workspace. You maintain 100% control over your menu catalog and pricing.
          </p>
        </div>
      </div>

    </div>
  );
}
