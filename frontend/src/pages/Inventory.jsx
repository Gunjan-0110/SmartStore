import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Electronics', 'Hardware', 'Accessories', 'Software', 'Other'];

const emptyForm = { name: '', category: 'Electronics', sku: '', qty: '', safety: '', description: '', location: '' };

function EditModal({ asset, onClose, onSaved }) {
  const [form, setForm] = useState({ ...asset });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put(`/assets/${asset._id}`, form);
      onSaved(data.asset);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Edit Asset</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Asset Name</label>
              <input name="name" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input name="sku" value={form.sku} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input name="qty" type="number" min="0" value={form.qty} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Safety Stock</label>
              <input name="safety" type="number" min="0" value={form.safety} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location || ''} onChange={handle} placeholder="e.g. Warehouse A" />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea name="description" rows={2} value={form.description || ''} onChange={handle} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editAsset, setEditAsset] = useState(null);
  const [error, setError] = useState('');

  const canEdit   = user?.permissions?.edit   || user?.role === 'Admin';
  const canDelete = user?.permissions?.delete || user?.role === 'Admin';

  useEffect(() => {
    api.get('/assets').then(({ data }) => {
      setAssets(data.assets);
      setFiltered(data.assets);
    }).catch(() => setError('Failed to load assets'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.sku.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    ));
  }, [search, assets]);

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.name}"?`)) return;
    try {
      await api.delete(`/assets/${asset._id}`);
      setAssets(a => a.filter(x => x._id !== asset._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSaved = (updated) => {
    setAssets(a => a.map(x => x._id === updated._id ? updated : x));
    setEditAsset(null);
  };

  const statusBadge = (a) => {
    if (a.qty === 0) return <span className="badge badge-out">Out of Stock</span>;
    if (a.qty <= a.safety) return <span className="badge badge-low">Low Stock</span>;
    return <span className="badge badge-in">In Stock</span>;
  };

  return (
    <div className="page">
      {editAsset && <EditModal asset={editAsset} onClose={() => setEditAsset(null)} onSaved={handleSaved} />}

      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">Inventory</div>
          <div className="text-xs text-secondary">{assets.length} assets tracked</div>
        </div>
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <p className="text-secondary">Loading…</p> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th><th>SKU</th><th>Qty</th><th>Safety</th><th>Status</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>No assets found</td></tr>
                ) : filtered.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-secondary">{a.category}</div>
                    </td>
                    <td><span className="mono">{a.sku}</span></td>
                    <td className="font-bold">{a.qty}</td>
                    <td className="text-secondary">{a.safety}</td>
                    <td>{statusBadge(a)}</td>
                    {(canEdit || canDelete) && (
                      <td>
                        {canEdit && (
                          <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => setEditAsset(a)}>
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a)}>
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
