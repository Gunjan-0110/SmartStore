import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const empty = { name: '', email: '', password: '', role: 'User', permissions: { read: true, edit: false, delete: false, add: false } };

function AddUserModal({ onClose, onAdded }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePerm = e => setForm(f => ({ ...f, permissions: { ...f.permissions, [e.target.name]: e.target.checked } }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const { data } = await api.post('/users', form);
      onAdded(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add User</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input name="password" type="password" value={form.password} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handle}>
                <option>User</option>
                <option>Admin</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 10 }}>Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['read', 'edit', 'delete', 'add'].map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" className="checkbox" name={perm} checked={form.permissions[perm]} onChange={handlePerm} />
                  {perm.charAt(0).toUpperCase() + perm.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccessControl() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users || []))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'Admin' ? 'User' : 'Admin';
    try {
      const { data } = await api.put(`/users/${u._id}`, { ...u, role: newRole });
      setUsers(list => list.map(x => x._id === u._id ? data.user : x));
    } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
  };

  const handlePermChange = async (u, perm, val) => {
    const updated = { ...u, permissions: { ...u.permissions, [perm]: val } };
    try {
      const { data } = await api.put(`/users/${u._id}`, updated);
      setUsers(list => list.map(x => x._id === u._id ? data.user : x));
    } catch (err) { alert('Permission update failed'); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers(list => list.filter(x => x._id !== u._id));
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const handleAdded = (newUser) => {
    setUsers(list => [newUser, ...list]);
    setShowAdd(false);
  };

  return (
    <div className="page">
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}

      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">Access Control</div>
          <div className="text-xs text-secondary">{users.length} users registered</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add User</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <p className="text-secondary">Loading…</p> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th>
                  <th style={{ textAlign: 'center' }}>Read</th>
                  <th style={{ textAlign: 'center' }}>Edit</th>
                  <th style={{ textAlign: 'center' }}>Delete</th>
                  <th style={{ textAlign: 'center' }}>Add</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-secondary">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    {['read', 'edit', 'delete', 'add'].map(perm => (
                      <td key={perm} className="perm-cell">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={!!u.permissions?.[perm]}
                          disabled={u._id === me?._id}
                          onChange={e => handlePermChange(u, perm, e.target.checked)}
                        />
                      </td>
                    ))}
                    <td>
                      {u._id !== me?._id && (
                        <>
                          <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => handleToggleRole(u)}>
                            {u.role === 'Admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>
                            Delete
                          </button>
                        </>
                      )}
                      {u._id === me?._id && <span className="text-xs text-secondary">(You)</span>}
                    </td>
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
