import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PERMISSIONS = [
  { key: 'read',          label: 'Read',           desc: 'View inventory and assets',           icon: '👁',  adminOnly: false },
  { key: 'add',           label: 'Add',            desc: 'Create new assets',                   icon: '➕', adminOnly: false },
  { key: 'edit',          label: 'Edit',           desc: 'Modify existing assets',              icon: '✏️',  adminOnly: false },
  { key: 'delete',        label: 'Delete',         desc: 'Remove assets from inventory',        icon: '🗑',  adminOnly: false },
  { key: 'auditLog',      label: 'Audit Log',      desc: 'View system audit trail',             icon: '📋', adminOnly: true  },
  { key: 'accessControl', label: 'Access Control', desc: 'Manage users and permissions',        icon: '🔐', adminOnly: true  },
];

export default function Profile() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [requestingItem, setRequestingItem] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/requests/mine').then(({ data }) => {
      setRequests(data.requests || []);
    }).catch(console.error);
  }, [user]);

  const requestAccess = async (permissionKey) => {
    setRequestingItem(permissionKey);
    try {
      const { data } = await api.post('/requests', { permission: permissionKey });
      setRequests(r => [data.request, ...r]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestingItem(null);
    }
  };

  const roleLabel = user?.isSuperAdmin ? 'Super Admin' : user?.role || 'User';
  const roleBadgeClass = user?.isSuperAdmin ? 'badge-super-admin' : user?.role === 'Admin' ? 'badge-admin' : 'badge-user';

  function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="page">
      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">My Profile</div>
          <div className="text-xs text-secondary">Account details and access rights</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, maxWidth: 860 }}>

        {/* Identity card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 1
          }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
            <div className="text-xs text-secondary" style={{ marginBottom: 12 }}>{user?.email}</div>
            <span className={`badge ${roleBadgeClass}`}>{roleLabel.toUpperCase()}</span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="text-secondary">Account type</span>
                <span className="font-medium">{roleLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="text-secondary">Status</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>● Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions card */}
        <div className="card">
          <div className="font-bold" style={{ marginBottom: 6 }}>Access Rights</div>
          <div className="text-xs text-secondary" style={{ marginBottom: 20 }}>
            Permissions granted to your account by an administrator.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PERMISSIONS
              .filter(p => !p.adminOnly || user?.role === 'Admin' || user?.isSuperAdmin)
              .map(({ key, label, desc, icon, adminOnly }) => {
                const isAdmin = user?.isSuperAdmin || user?.role === 'Admin';
                const granted = user?.isSuperAdmin || (adminOnly ? isAdmin : !!user?.permissions?.[key]);
                const pending = requests.find(r => r.permission === key && r.status === 'pending');

                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: granted ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.05)',
                    border: `1px solid ${granted ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                        <div className="text-xs text-secondary">{desc}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {granted ? (
                        <div style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: 'rgba(34,197,94,0.15)',
                          color: 'var(--accent-green)',
                        }}>
                          GRANTED
                        </div>
                      ) : (
                        <>
                          <div style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: 'rgba(239,68,68,0.12)',
                            color: 'var(--accent-red)',
                          }}>
                            DENIED
                          </div>
                          {pending ? (
                            <button className="btn btn-ghost btn-sm" disabled style={{ fontSize: 10, padding: '4px 8px' }}>
                              Pending…
                            </button>
                          ) : (
                            <button 
                              className="btn btn-ghost btn-sm"
                              onClick={() => requestAccess(key)}
                              disabled={requestingItem === key}
                              style={{ fontSize: 10, padding: '4px 8px' }}
                            >
                              {requestingItem === key ? '...' : 'Request Access'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {user?.isSuperAdmin && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
              fontSize: 12, color: 'var(--accent-purple)'
            }}>
              ⚡ As Super Admin, you have unrestricted access to all features.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
