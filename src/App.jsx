import React, { useState, useEffect } from 'react';
import SuperAdminLogin from './components/superadmin/SuperAdminLogin';
import SuperAdminLayout from './components/superadmin/SuperAdminLayout';
import RestaurantLogin from './components/restaurant/RestaurantLogin';
import RestaurantAdminLayout from './components/restaurant/RestaurantAdminLayout';

export default function App() {
  // Support #client hash to test client login / password change
  const [viewMode, setViewMode] = useState(() => {
    return window.location.hash.toLowerCase().includes('client') ? 'CLIENT' : 'SUPER_ADMIN';
  });

  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('apex_admin_token'));
  const [restaurantToken, setRestaurantToken] = useState(() => sessionStorage.getItem('apex_restaurant_token'));

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.toLowerCase().includes('client')) {
        setViewMode('CLIENT');
      } else {
        setViewMode('SUPER_ADMIN');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleAdminLogout = () => {
    sessionStorage.removeItem('apex_admin_token');
    sessionStorage.removeItem('apex_admin_name');
    setAdminToken(null);
  };

  const handleRestaurantLogout = () => {
    sessionStorage.removeItem('apex_restaurant_token');
    sessionStorage.removeItem('apex_tenant_id');
    sessionStorage.removeItem('apex_restaurant_name');
    setRestaurantToken(null);
  };

  if (viewMode === 'CLIENT') {
    return (
      <div style={{ minHeight: '100vh', width: '100vw' }}>
        {restaurantToken ? (
          <RestaurantAdminLayout
            onLogout={handleRestaurantLogout}
            onSwitchToSuperAdmin={() => {
              window.location.hash = '';
              setViewMode('SUPER_ADMIN');
            }}
          />
        ) : (
          <RestaurantLogin
            onLoginSuccess={(res) => setRestaurantToken(res.access_token)}
            onSwitchToSuperAdmin={() => {
              window.location.hash = '';
              setViewMode('SUPER_ADMIN');
            }}
          />
        )}
      </div>
    );
  }

  // DEFAULT & PRIMARY MILESTONE EXPERIENCE: SUPER ADMIN MANAGEMENT PANEL
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {adminToken ? (
        <SuperAdminLayout
          onLogout={handleAdminLogout}
          onSwitchToRestaurantLogin={() => {
            window.location.hash = 'client';
            setViewMode('CLIENT');
          }}
        />
      ) : (
        <SuperAdminLogin
          onLoginSuccess={(res) => setAdminToken(res.access_token)}
          onSwitchToRestaurantLogin={() => {
            window.location.hash = 'client';
            setViewMode('CLIENT');
          }}
        />
      )}
    </div>
  );
}
