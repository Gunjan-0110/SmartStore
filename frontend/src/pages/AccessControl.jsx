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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  // Can the current user edit target user u?
  const canEdit = (u) => {
    if (u.isSuperAdmin) return false;                              // super admin is locked for everyone
    if (!me?.isSuperAdmin && u.role === 'Admin') return false;    // only super admin can edit other admins
    return true;
  };

  // Can the current user promote/demote user u?
  const canToggleRole = (u) => {
    if (u.isSuperAdmin) return false;                              // super admin role is locked forever
    if (!me?.isSuperAdmin && u.role === 'Admin') return false;    // only super admin can demote admins
    return true;
  };

  // Can the current user delete user u?
  const canDelete = (u) => {
    if (u.isSuperAdmin) return false;                              // super admin can never be deleted
    if (u._id === me?._id) return false;                           // can't delete yourself
    if (!me?.isSuperAdmin && u.role === 'Admin') return false;    // only super admin can delete admins
    return true;
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/users'), api.get('/requests')])
      .then(([uRes, rRes]) => {
        setUsers(uRes.data.users || []);
        setRequests(rRes.data.requests || []);
      })
      .catch(() => setError('Failed to load access data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'Admin' ? 'User' : 'Admin';
    const updatedPermissions = newRole === 'Admin'
      ? { read: true, edit: true, delete: true, add: true }
      : u.permissions;
    try {
      const { data } = await api.put(`/users/${u._id}`, { ...u, role: newRole, permissions: updatedPermissions });
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

  const handleRequestAction = async (request, action) => {
    try {
      await api.put(`/requests/${request._id}`, { action });
      
      // Instantly remove from the requests list
      setRequests(list => list.filter(r => r._id !== request._id));

      // If approved, instantly toggle the checkbox in the user table
      if (action === 'approved') {
        setUsers(list => list.map(u => {
          if (u._id === request.userId) {
            return { ...u, permissions: { ...u.permissions, [request.permission]: true } };
          }
          return u;
        }));
      }
    } catch (err) {
      console.error("HANDLE REQUEST ACTION ERROR:", err);
      setError(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

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

      {/* Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="card" style={{ marginBottom: 32 }}>
          <div className="font-bold mb-4" style={{ color: 'var(--accent-blue)' }}>
            Pending Permission Requests ({pendingRequests.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingRequests.map(req => (
              <div key={req._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: 10
              }}>
                <div>
                  <div className="font-medium">{req.userName} <span className="text-secondary text-sm font-normal">({req.userEmail})</span></div>
                  <div className="text-sm mt-1">
                    Requested <strong style={{ color: 'var(--accent-blue)' }}>{req.permission.toUpperCase()}</strong> permission 
                    <span className="text-xs text-secondary"> • {new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRequestAction(req, 'rejected')}>Reject</button>
                  <button className="btn btn-success btn-sm" onClick={() => handleRequestAction(req, 'approved')}>Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <div className="font-medium">{u.name || (u.isSuperAdmin ? 'Super Admin' : 'User')}</div>
                      <div className="text-xs text-secondary">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.isSuperAdmin ? 'badge-super-admin' : u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.isSuperAdmin ? 'SUPER ADMIN' : u.role.toUpperCase()}
                      </span>
                    </td>
                    {['read', 'edit', 'delete', 'add'].map(perm => (
                      <td key={perm} className="perm-cell">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={!!u.permissions?.[perm]}
                          disabled={!canEdit(u)}
                          onChange={e => handlePermChange(u, perm, e.target.checked)}
                        />
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {u._id === me?._id && <span className="text-xs text-secondary">(You)</span>}
                        {canToggleRole(u) && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleToggleRole(u)}>
                            {u.role === 'Admin' ? 'Demote' : 'Promote'}
                          </button>
                        )}
                        {canDelete(u) && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>
                            Delete
                          </button>
                        )}
                        {!canEdit(u) && u._id !== me?._id && (
                          <span className="text-xs text-secondary">Protected</span>
                        )}
                      </div>
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
