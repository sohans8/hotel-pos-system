import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  UserPlus, 
  Clock, 
  Sliders, 
  Monitor, 
  Activity, 
  Settings, 
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import RestaurantsView from './views/RestaurantsView';
import AddRestaurantView from './views/AddRestaurantView';
import SubscriptionManagementView from './views/SubscriptionManagementView';
import FeaturePermissionsView from './views/FeaturePermissionsView';
import TerminalManagementView from './views/TerminalManagementView';
import ActivityLogsView from './views/ActivityLogsView';
import SettingsView from './views/SettingsView';

export default function SuperAdminLayout({ onLogout, onSwitchToRestaurantLogin }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTenantForDetails, setSelectedTenantForDetails] = useState(null);
  const adminName = sessionStorage.getItem('apex_admin_name') || 'Super Administrator';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: Building2 },
    { id: 'add-restaurant', label: 'Add Restaurant', icon: UserPlus },
    { id: 'subscriptions', label: 'Subscription Management', icon: Clock },
    { id: 'features', label: 'Feature Permissions', icon: Sliders },
    { id: 'terminals', label: 'Terminal Management', icon: Monitor },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (tab, payload = null) => {
    if (payload) {
      setSelectedTenantForDetails(payload);
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case 'restaurants':
        return <RestaurantsView onNavigate={handleNavigate} preselectedTenant={selectedTenantForDetails} />;
      case 'add-restaurant':
        return <AddRestaurantView onNavigate={handleNavigate} />;
      case 'subscriptions':
        return <SubscriptionManagementView onNavigate={handleNavigate} />;
      case 'features':
        return <FeaturePermissionsView onNavigate={handleNavigate} preselectedTenant={selectedTenantForDetails} />;
      case 'terminals':
        return <TerminalManagementView onNavigate={handleNavigate} preselectedTenant={selectedTenantForDetails} />;
      case 'activity-logs':
        return <ActivityLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a',
      overflow: 'hidden'
    }}>
      
      {/* Dark Navy Sidebar (#0f172a) */}
      <aside style={{
        width: '260px',
        background: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            background: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#f8fafc' }}>
              ApexPOS Platform
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Super Admin Console
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', padding: '0 8px 10px', letterSpacing: '0.05em' }}>
            Platform Modules
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedTenantForDetails(null);
                    setActiveTab(item.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#1e293b';
                      e.currentTarget.style.color = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom User Profile & Logout */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #1e293b',
          background: '#090d16'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {adminName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Platform Owner</div>
            </div>
            <span style={{
              background: '#166534',
              color: '#86efac',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onSwitchToRestaurantLogin && (
              <button
                onClick={onSwitchToRestaurantLogin}
                title="Open Restaurant Client Portal"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '5px',
                  padding: '7px 8px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={12} /> Client View
              </button>
            )}

            <button
              onClick={onLogout}
              title="Sign Out of Super Admin"
              style={{
                flex: onSwitchToRestaurantLogin ? 1 : 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: '#450a0a',
                color: '#f87171',
                border: '1px solid #7f1d1d',
                borderRadius: '5px',
                padding: '7px 8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Clean White Background #ffffff / #f8fafc) */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#ffffff'
      }}>
        {renderContent()}
      </main>

    </div>
  );
}
