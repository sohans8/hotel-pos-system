import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  UtensilsCrossed, 
  Store, 
  Users, 
  Printer, 
  Receipt, 
  CreditCard, 
  Monitor, 
  LogOut, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import RestaurantDashboardView from './views/RestaurantDashboardView';
import RestaurantProfileView from './views/RestaurantProfileView';
import MenuManagementView from './views/MenuManagementView';
import TableManagementView from './views/TableManagementView';
import EmployeeManagementView from './views/EmployeeManagementView';
import PrinterSettingsView from './views/PrinterSettingsView';
import BillingSettingsView from './views/BillingSettingsView';
import SubscriptionView from './views/SubscriptionView';
import TerminalManagementView from './views/TerminalManagementView';

export default function RestaurantAdminLayout({ onLogout, onSwitchToSuperAdmin }) {
  const [currentTab, setCurrentTab] = useState('DASHBOARD');
  const restaurantName = sessionStorage.getItem('apex_restaurant_name') || 'Apex Restaurant';
  const tenantId = sessionStorage.getItem('apex_tenant_id') || 'TENANT-001';

  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'PROFILE', label: 'Restaurant Profile', icon: Building2 },
    { id: 'MENU', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'TABLES', label: 'Table Management', icon: Store },
    { id: 'EMPLOYEES', label: 'Employee Management', icon: Users },
    { id: 'PRINTERS', label: 'Printer Settings', icon: Printer },
    { id: 'BILLING', label: 'Billing Settings', icon: Receipt },
    { id: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard },
    { id: 'TERMINALS', label: 'Terminal Management', icon: Monitor },
  ];

  const handleNavigate = (tabId) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        flexShrink: 0
      }}>
        {/* Brand / Restaurant Header */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)'
            }}>
              <Store size={22} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {restaurantName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '600' }}>
                  {tenantId}
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', padding: '6px 12px', letterSpacing: '0.05em' }}>
            Restaurant Portal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#1e293b';
                      e.currentTarget.style.color = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#ffffff' : '#64748b' }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <ChevronRight size={14} style={{ opacity: 0.7 }} />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Portal Switcher & Logout */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid #1e293b', background: '#0b1120' }}>
          {onSwitchToSuperAdmin && (
            <button
              onClick={onSwitchToSuperAdmin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#cbd5e1',
                fontSize: '12px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <ExternalLink size={14} style={{ color: '#38bdf8' }} /> Switch to Super Admin
            </button>
          )}

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} /> Logout Restaurant
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, background: '#f8fafc', overflowY: 'auto' }}>
        {currentTab === 'DASHBOARD' && (
          <RestaurantDashboardView onNavigateTab={handleNavigate} />
        )}
        {currentTab === 'PROFILE' && <RestaurantProfileView />}
        {currentTab === 'MENU' && <MenuManagementView />}
        {currentTab === 'TABLES' && <TableManagementView />}
        {currentTab === 'EMPLOYEES' && <EmployeeManagementView />}
        {currentTab === 'PRINTERS' && <PrinterSettingsView />}
        {currentTab === 'BILLING' && <BillingSettingsView />}
        {currentTab === 'SUBSCRIPTION' && <SubscriptionView />}
        {currentTab === 'TERMINALS' && <TerminalManagementView />}
      </main>
    </div>
  );
}