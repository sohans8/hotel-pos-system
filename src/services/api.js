const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // 1. Super Admin Authentication
  superAdminLogin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Super Admin login failed');
    }
    return await res.json();
  },

  // 2. Dashboard Analytics
  getAdminDashboard: async (token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/dashboard`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return await res.json();
  },

  // 3. Restaurants Management
  getRestaurantsList: async (statusFilter = 'ALL', search = '', token) => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'ALL') params.append('status_filter', statusFilter);
    if (search) params.append('search', search);
    const url = `${API_BASE_URL}/super-admin/restaurants?${params.toString()}`;
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    return await res.json();
  },

  getRestaurantDetails: async (tenantId, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/restaurants/${tenantId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch restaurant details');
    return await res.json();
  },

  addRestaurant: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Restaurant registration failed');
    }
    return await res.json();
  },

  updateRestaurant: async (tenantId, data, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/restaurants/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update restaurant');
    }
    return await res.json();
  },

  restaurantAction: async (tenantId, actionPayload, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/restaurants/${tenantId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(actionPayload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Action failed');
    }
    return await res.json();
  },

  // 4. Subscription Management (Section E)
  getSubscriptions: async (token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/subscriptions`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    return await res.json();
  },

  subscriptionAction: async (subId, action, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/subscriptions/${subId}/action?action=${action}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update subscription');
    }
    return await res.json();
  },

  // 5. Terminal Management (Section F)
  getTerminals: async (tenantId = null, token) => {
    const url = tenantId 
      ? `${API_BASE_URL}/super-admin/terminals?tenant_id=${tenantId}`
      : `${API_BASE_URL}/super-admin/terminals`;
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch terminals');
    return await res.json();
  },

  revokeTerminal: async (terminalId, reason = '', token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/terminals/${terminalId}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to revoke terminal');
    return await res.json();
  },

  replaceTerminal: async (terminalId, reason = '', token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/terminals/${terminalId}/replace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to mark terminal as replaced');
    return await res.json();
  },

  // 6. Feature Permissions (Section G)
  getFeatures: async (token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/features`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to load features registry');
    return await res.json();
  },

  addFeature: async (featureData, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(featureData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add feature');
    }
    return await res.json();
  },

  getRestaurantFeatures: async (tenantId, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/restaurants/${tenantId}/features`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to load restaurant features');
    return await res.json();
  },

  toggleRestaurantFeature: async (tenantId, featureKey, isEnabled, token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/restaurants/${tenantId}/features`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ feature_key: featureKey, is_enabled: isEnabled })
    });
    if (!res.ok) throw new Error('Failed to update feature permission');
    return await res.json();
  },

  // 7. Activity Logs & Settings
  getActivityLogs: async (search = '', limit = 50, token) => {
    const params = new URLSearchParams({ limit });
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE_URL}/super-admin/activity-logs?${params.toString()}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return await res.json();
  },

  getPlatformSettings: async (token) => {
    const res = await fetch(`${API_BASE_URL}/super-admin/settings`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch platform settings');
    return await res.json();
  },

  // 8. Restaurant Client Portal Authentication & Password Change
  restaurantLogin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/restaurant-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Restaurant login failed');
    }
    return await res.json();
  },

  changePassword: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Password change failed');
    }
    return await res.json();
  },

  // Terminal Registration from Client Device
  registerTerminal: async (data) => {
    const res = await fetch(`${API_BASE_URL}/terminals/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Terminal registration failed');
    }
    return await res.json();
  },

  replaceDeviceRequest: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/terminals/replace-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Device replacement request failed');
    }
    return await res.json();
  },

  // 9. Restaurant Admin Portal APIs (Milestone 02)
  getRestaurantDashboard: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/dashboard`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch restaurant dashboard');
    }
    return await res.json();
  },

  getRestaurantProfile: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/profile`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch restaurant profile');
    return await res.json();
  },

  updateRestaurantProfile: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update profile');
    }
    return await res.json();
  },

  getRestaurantSubscription: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/subscription`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch subscription information');
    return await res.json();
  },

  getRestaurantFeatures: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/features`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch feature entitlements');
    return await res.json();
  },

  getCategories: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  createCategory: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create category');
    }
    return await res.json();
  },

  updateCategory: async (catId, data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/categories/${catId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return await res.json();
  },

  deleteCategory: async (catId, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/categories/${catId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return await res.json();
  },

  getMenuItems: async (categoryId = null, token) => {
    const url = categoryId 
      ? `${API_BASE_URL}/restaurant/menu-items?category_id=${categoryId}`
      : `${API_BASE_URL}/restaurant/menu-items`;
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return await res.json();
  },

  createMenuItem: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/menu-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add menu item');
    }
    return await res.json();
  },

  updateMenuItem: async (itemId, data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/menu-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return await res.json();
  },

  deleteMenuItem: async (itemId, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/menu-items/${itemId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return await res.json();
  },

  getTables: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/tables`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch tables');
    return await res.json();
  },

  createTable: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create table');
    }
    return await res.json();
  },

  updateTable: async (tableId, data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/tables/${tableId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update table');
    return await res.json();
  },

  deleteTable: async (tableId, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/tables/${tableId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to delete table');
    return await res.json();
  },

  getEmployees: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/employees`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch employees');
    return await res.json();
  },

  createEmployee: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add employee');
    }
    return await res.json();
  },

  updateEmployee: async (empId, data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/employees/${empId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return await res.json();
  },

  deleteEmployee: async (empId, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/employees/${empId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    return await res.json();
  },

  getPrinters: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/printers`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch printer configurations');
    return await res.json();
  },

  createPrinter: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/printers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to configure printer');
    }
    return await res.json();
  },

  updatePrinter: async (printerId, data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/printers/${printerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update printer');
    return await res.json();
  },

  deletePrinter: async (printerId, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/printers/${printerId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to delete printer');
    return await res.json();
  },

  getBillingSettings: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/billing`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch billing settings');
    return await res.json();
  },

  updateBillingSettings: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/billing`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save billing settings');
    return await res.json();
  },

  getRestaurantTerminals: async (token) => {
    const res = await fetch(`${API_BASE_URL}/restaurant/terminals`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch restaurant terminals');
    return await res.json();
  }
};
