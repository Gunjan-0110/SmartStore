import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Electronics', 'Hardware', 'Accessories', 'Software', 'Other'];
const STATUSES   = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

const emptyForm = { name: '', category: 'Electronics', sku: '', qty: '', safety: '', description: '', location: '' };

function statusOf(a) {
  if (a.qty === 0) return 'Out of Stock';
  if (a.qty <= a.safety) return 'Low Stock';
  return 'In Stock';
}

function StatusBadge({ asset }) {
  const s = statusOf(asset);
  const cls = s === 'Out of Stock' ? 'badge-out' : s === 'Low Stock' ? 'badge-low' : 'badge-in';
  return <span className={`badge ${cls}`}>{s}</span>;
}

/* ── Detail Modal ── */
function DetailModal({ asset, onClose, onEdit, canEdit }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">{asset.name}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'SKU',           value: <span className="mono">{asset.sku}</span> },
            { label: 'Category',      value: asset.category },
            { label: 'Quantity',      value: <strong style={{ fontSize: 18 }}>{asset.qty}</strong> },
            { label: 'Safety Stock',  value: asset.safety },
            { label: 'Status',        value: <StatusBadge asset={asset} /> },
            { label: 'Location',      value: asset.location || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px' }}>
              <div className="text-xs text-secondary" style={{ marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {asset.description && (
          <div style={{ marginTop: 16, background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px' }}>
            <div className="text-xs text-secondary" style={{ marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 13 }}>{asset.description}</div>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-secondary)' }}>
          Added {new Date(asset.createdAt).toLocaleString()}
          {asset.updatedAt !== asset.createdAt && ` · Updated ${new Date(asset.updatedAt).toLocaleString()}`}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {canEdit && <button className="btn btn-primary" onClick={() => onEdit(asset)}>Edit Asset</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Edit Modal ── */
function EditModal({ asset, onClose, onSaved }) {
  const [form, setForm]   = useState({ ...asset });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
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

/* ── Main Page ── */
export default function Inventory() {
  const { user } = useAuth();
  const [assets,    setAssets]    = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [stFilter,  setStFilter]  = useState('All');
  const [editAsset,   setEditAsset]   = useState(null);
  const [detailAsset, setDetailAsset] = useState(null);
  const [error, setError] = useState('');

  const canEdit   = user?.permissions?.edit   || user?.role === 'Admin';
  const canDelete = user?.permissions?.delete  || user?.role === 'Admin';

  useEffect(() => {
    api.get('/assets')
      .then(({ data }) => { setAssets(data.assets); setFiltered(data.assets); })
      .catch(() => setError('Failed to load assets'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(assets.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(q) || a.sku.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      const matchCat    = catFilter === 'All' || a.category === catFilter;
      const matchSt     = stFilter  === 'All' || statusOf(a) === stFilter;
      return matchSearch && matchCat && matchSt;
    }));
  }, [search, catFilter, stFilter, assets]);

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.name}"?`)) return;
    try {
      await api.delete(`/assets/${asset._id}`);
      setAssets(a => a.filter(x => x._id !== asset._id));
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const handleSaved = (updated) => {
    setAssets(a => a.map(x => x._id === updated._id ? updated : x));
    setEditAsset(null);
    setDetailAsset(null);
  };

  const openEdit = (asset) => { setDetailAsset(null); setEditAsset(asset); };

  return (
    <div className="page">
      {detailAsset && (
        <DetailModal
          asset={detailAsset}
          onClose={() => setDetailAsset(null)}
          onEdit={openEdit}
          canEdit={canEdit}
        />
      )}
      {editAsset && (
        <EditModal asset={editAsset} onClose={() => setEditAsset(null)} onSaved={handleSaved} />
      )}

      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">Inventory</div>
          <div className="text-xs text-secondary">{filtered.length} of {assets.length} assets</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, minWidth: 130 }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={stFilter}
            onChange={e => setStFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, minWidth: 130 }}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
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
                  <tr
                    key={a._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setDetailAsset(a)}
                  >
                    <td>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-secondary">{a.category}</div>
                    </td>
                    <td><span className="mono">{a.sku}</span></td>
                    <td className="font-bold">{a.qty}</td>
                    <td className="text-secondary">{a.safety}</td>
                    <td><StatusBadge asset={a} /></td>
                    {(canEdit || canDelete) && (
                      <td onClick={e => e.stopPropagation()}>
                        {canEdit && (
                          <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(a)}>
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
