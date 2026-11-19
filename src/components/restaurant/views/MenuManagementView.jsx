import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Tag
} from 'lucide-react';
import { api } from '../../../services/api';

export default function MenuManagementView() {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories'
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catOrder, setCatOrder] = useState(0);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: '',
    short_code: '',
    price: '',
    is_veg: true,
    is_available: true,
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('apex_restaurant_token');
      const [cats, items] = await Promise.all([
        api.getCategories(token),
        api.getMenuItems(null, token)
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (err) {
      alert('Failed to load menu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const token = sessionStorage.getItem('apex_restaurant_token');
      await api.createCategory({ name: catName.trim(), display_order: catOrder }, token);
      setShowCatModal(false);
      setCatName('');
      setCatOrder(0);
      fetchData();
    } catch (err) {
      alert('Failed to create category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm('Are you sure you want to delete this category? Dishes in this category will become uncategorized.')) return;
    try {
      const token = sessionStorage.getItem('apex_restaurant_token');
      await api.deleteCategory(catId, token);
      fetchData();
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  // Menu Item Actions
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      short_code: '',
      price: '',
      is_veg: true,
      is_available: true,
      description: ''
    });
    setShowItemModal(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category_id: item.category_id || '',
      short_code: item.short_code || '',
      price: item.price,
      is_veg: item.is_veg,
      is_available: item.is_available,
      description: item.description || ''
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || itemForm.price === '') {
      alert('Dish name and price are mandatory.');
      return;
    }

    try {
      const token = sessionStorage.getItem('apex_restaurant_token');
      const payload = {
        name: itemForm.name.trim(),
        category_id: itemForm.category_id || null,
        short_code: itemForm.short_code ? itemForm.short_code.trim().toUpperCase() : null,
        price: parseFloat(itemForm.price) || 0.0,
        is_veg: itemForm.is_veg,
        is_available: itemForm.is_available,
        description: itemForm.description.trim() || null
      };

      if (editingItem) {
        await api.updateMenuItem(editingItem.id, payload, token);
      } else {
        await api.createMenuItem(payload, token);
      }

      setShowItemModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save dish: ' + err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      const token = sessionStorage.getItem('apex_restaurant_token');
      await api.deleteMenuItem(itemId, token);
      fetchData();
    } catch (err) {
      alert('Failed to delete dish: ' + err.message);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.short_code && item.short_code.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = filterCategory === 'ALL' || item.category_id === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
            Menu Master Catalog
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Configure menu categories, food items, prices, short codes (e.g. PL for Paneer Lababdar), and availability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'categories' ? (
            <button
              onClick={() => setShowCatModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Category
            </button>
          ) : (
            <button
              onClick={handleOpenAddItem}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Menu Item
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('items')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'items' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'items' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'items' ? '600' : '500',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UtensilsCrossed size={16} /> Menu Dishes ({menuItems.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'categories' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'categories' ? '600' : '500',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={16} /> Categories ({categories.length})
        </button>
      </div>

      {/* TAB 1: MENU ITEMS */}
      {activeTab === 'items' && (
        <div>
          {/* Search & Filter Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '380px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search dish or shortcut code (e.g. PL, Biryani)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#ffffff' }}
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            {menuItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <UtensilsCrossed size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
                  Your Menu is Empty
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                  No dishes found. Add your first dish to start building your restaurant's digital menu.
                </p>
                <button
                  onClick={handleOpenAddItem}
                  style={{
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
                  <Plus size={14} /> Add First Dish
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontSize: '13px' }}>
                No dishes match your search query.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Dish Name</th>
                    <th style={{ padding: '12px 16px' }}>Short Code</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Type</th>
                    <th style={{ padding: '12px 16px' }}>Rate / Price</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                        {item.name}
                        {item.description && <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>{item.description}</div>}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {item.short_code ? (
                          <span style={{ padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}>
                            {item.short_code}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {item.category_name}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: item.is_veg ? '#dcfce7' : '#fee2e2',
                          color: item.is_veg ? '#166534' : '#991b1b'
                        }}>
                          {item.is_veg ? '🟢 VEG' : '🔴 NON-VEG'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#0f172a' }}>
                        ₹{item.price.toFixed(2)}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: item.is_available ? '#16a34a' : '#dc2626'
                        }}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            title="Edit Dish"
                            style={{ padding: '5px 8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete Dish"
                            style={{ padding: '5px 8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Layers size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' }}>
                No Menu Categories
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                Categories organize your food menu into sections (e.g. Starters, Main Course, Rotis, Rice, Beverages).
              </p>
              <button
                onClick={() => setShowCatModal(true)}
                style={{
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
                <Plus size={14} /> Add First Category
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Display Order</th>
                  <th style={{ padding: '12px 16px' }}>Category Name</th>
                  <th style={{ padding: '12px 16px' }}>Total Dishes</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>
                      #{c.display_order}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#0f172a' }}>
                      {c.name}
                    </td>

                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {c.item_count} items
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: c.is_active ? '#16a34a' : '#64748b' }}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        style={{ padding: '5px 8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px' }}>Add Menu Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starters, Tandoor, Main Course"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Display Order</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCatModal(false)} style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MENU ITEM MODAL */}
      {showItemModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px' }}>
              {editingItem ? 'Edit Menu Dish' : 'Add New Menu Dish'}
            </h3>

            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Lababdar"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Category</label>
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', background: '#ffffff' }}
                  >
                    <option value="">(No Category)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Short Code (For Fast Typing)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PL, VMS, BR"
                    value={itemForm.short_code}
                    onChange={(e) => setItemForm({ ...itemForm, short_code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="280.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Dietary Classification</label>
                  <select
                    value={itemForm.is_veg ? 'VEG' : 'NON_VEG'}
                    onChange={(e) => setItemForm({ ...itemForm, is_veg: e.target.value === 'VEG' })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', background: '#ffffff' }}
                  >
                    <option value="VEG">🟢 Vegetarian</option>
                    <option value="NON_VEG">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Description / Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Rich cottage cheese cooked in creamy tomato and cashew gravy..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowItemModal(false)} style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {editingItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
