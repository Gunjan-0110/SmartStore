import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Electronics', 'Hardware', 'Accessories', 'Software', 'Other'];
const empty = { name: '', category: 'Electronics', sku: '', qty: '', safety: '', description: '', location: '' };

export default function AddAsset() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const canAdd = user?.permissions?.add || user?.role === 'Admin';

  if (!canAdd) {
    return (
      <div className="page">
        <div className="alert alert-error">You don't have permission to add assets.</div>
      </div>
    );
  }

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api.post('/assets', form);
      setSuccess(`Asset "${form.name}" added successfully!`);
      setForm(empty);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add asset');
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">Add Asset</div>
          <div className="text-xs text-secondary">Register a new inventory item</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')}>← Back</button>
      </div>

      <div className="card" style={{ maxWidth: 660 }}>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Asset Name *</label>
              <input name="name" placeholder="e.g. Dell XPS 15 Laptop" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>SKU *</label>
              <input name="sku" placeholder="e.g. ELEC-DXPS-001" value={form.sku} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" placeholder="e.g. Warehouse A, Shelf 3" value={form.location} onChange={handle} />
            </div>
            <div className="form-group">
              <label>Initial Quantity *</label>
              <input name="qty" type="number" min="0" placeholder="0" value={form.qty} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Safety Stock *</label>
              <input name="safety" type="number" min="0" placeholder="Minimum before alert" value={form.safety} onChange={handle} required />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea name="description" rows={3} placeholder="Optional description…" value={form.description} onChange={handle} />
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add Asset'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(empty)}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
