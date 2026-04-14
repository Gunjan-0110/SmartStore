import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getOpPill(action) {
  if (action?.includes('Created') || action?.includes('Added') || action?.includes('Login'))
    return { cls: 'op-pill op-create', label: action.includes('Login') ? 'LOGIN' : 'CREATE' };
  if (action?.includes('Updated') || action?.includes('Changed'))
    return { cls: 'op-pill op-update', label: action.includes('Changed') ? 'ROLE' : 'UPDATE' };
  if (action?.includes('Deleted'))
    return { cls: 'op-pill op-delete', label: 'DELETE' };
  return { cls: 'op-pill op-update', label: action?.toUpperCase() || '' };
}

function getAvatarStyle(action = '') {
  if (action.includes('Created') || action.includes('Added') || action.includes('Login'))
    return { background: 'rgba(34,197,94,.15)', color: '#22c55e' };
  if (action.includes('Updated') || action.includes('Changed'))
    return { background: 'rgba(59,130,246,.15)', color: '#60a5fa' };
  if (action.includes('Deleted'))
    return { background: 'rgba(239,68,68,.15)', color: '#ef4444' };
  return { background: 'rgba(245,158,11,.15)', color: '#f59e0b' };
}


export default function Dashboard() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pendingReqs, setPendingReqs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always fetch assets
    api.get('/assets')
      .then(a => setAssets(a.data.assets || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Only fetch logs and requests if admin
    if (user?.role === 'Admin') {
      api.get('/logs')
        .then(l => setLogs((l.data.logs || []).slice(0, 6)))
        .catch(console.error);
        
      api.get('/requests')
        .then(r => setPendingReqs((r.data.requests || []).filter(x => x.status === 'pending').length))
        .catch(console.error);
    }
  }, []);

  const totalItems   = assets.reduce((s, a) => s + a.qty, 0);
  const lowStock     = assets.filter(a => a.qty > 0 && a.qty <= a.safety).length;
  const outOfStock   = assets.filter(a => a.qty === 0).length;
  const categories   = new Set(assets.map(a => a.category)).size;

  const categoryData = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.qty;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Safe', value: assets.filter(a => a.qty > a.safety).length, color: 'var(--accent-green)' },
    { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: outOfStock, color: 'var(--accent-red)' }
  ].filter(d => d.value > 0);

  const CATEGORY_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#64748b'];

  const composedData = assets.map(a => ({
    name: a.name.split(' ')[0],
    qty: a.qty,
    safety: a.safety
  })).slice(0, 10);

  if (loading) return <div className="page"><p className="text-secondary">Loading dashboard…</p></div>;

  return (
    <div className="page">
      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="text-xs text-secondary">Welcome back, {user?.name}</div>
        </div>
        <Link to="/add-asset" className="btn btn-primary btn-sm">+ Add Asset</Link>
      </div>

      {user?.role === 'Admin' && pendingReqs > 0 && (
        <div className="alert" style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: 'var(--accent-blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>You have <strong>{pendingReqs}</strong> pending permission request{pendingReqs !== 1 && 's'} awaiting approval.</span>
          <Link to="/access" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>Review</Link>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Assets</div>
          <div className="stat-value text-blue">{assets.length}</div>
          <div className="stat-sub">Unique SKUs tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{totalItems.toLocaleString()}</div>
          <div className="stat-sub">Units in inventory</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{lowStock}</div>
          <div className="stat-sub">Below safety threshold</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value text-red">{outOfStock}</div>
          <div className="stat-sub">Needs restocking</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{categories}</div>
          <div className="stat-sub">Asset types</div>
        </div>
      </div>      {/* Main Layout Grid */}
      <div className={user?.role === 'Admin' ? 'two-col' : ''}>
        
        {/* LEFT COLUMN: All Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. Composed Overlay Chart */}
            {assets.length > 0 && (
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-bold">Asset vs Safety Thresholds</div>
                    <div className="text-xs text-secondary">Actual inventory vs minimum limits</div>
                  </div>
                </div>
                <div style={{ width: '100%', flex: 1, minHeight: 260 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={composedData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 11 }} />
                      <Bar dataKey="qty" name="Current Stock" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} barSize={30} />
                      <Line type="monotone" dataKey="safety" name="Safety Threshold" stroke="var(--accent-yellow)" strokeWidth={2} dot={{ r: 4, fill: 'var(--bg-card)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}


        </div>

        {/* RIGHT COLUMN: Activity & Critical Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Activity Feed */}
            {user?.role === 'Admin' && (
              <div className="card" style={{ height: '100%' }}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-bold">Recent Activity</div>
                    <div className="text-xs text-secondary">Latest audit events</div>
                  </div>
                  <Link to="/audit" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: 11 }}>View All</Link>
                </div>
                {logs.length === 0
                  ? <p className="text-secondary text-sm">No activity yet</p>
                  : logs.map((log, i) => {
                      const pill = getOpPill(log.action);
                      return (
                        <div className="activity-item" key={log._id || i} style={{ padding: '8px 0' }}>
                          <div className="activity-avatar" style={{ ...getAvatarStyle(log.action), width: 28, height: 28, fontSize: 10 }}>
                            {getInitials(log.user)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: 2 }}>
                              <span className="font-medium" style={{ fontSize: 12 }}>{log.user}</span>
                              <span className={pill.cls} style={{ fontSize: 9 }}>{pill.label}</span>
                            </div>
                            <div className="activity-action" style={{ fontSize: 11 }}>
                              {log.action} — <span className="activity-target">{log.target}</span>
                            </div>
                            <div className="activity-time" style={{ fontSize: 10 }}>{new Date(log.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            )}

        </div>
      </div>

      {/* Low stock table - Now Full Width */}
      {(lowStock + outOfStock) > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="font-bold mb-4">⚠ Action Needed</div>
          <div className="table-wrap">
            <table style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px' }}>Asset</th><th style={{ padding: '8px 12px' }}>SKU</th><th style={{ padding: '8px 12px' }}>Qty</th><th style={{ padding: '8px 12px' }}>Safety</th><th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.filter(a => a.qty <= a.safety).map(a => (
                  <tr key={a._id}>
                    <td style={{ padding: '8px 12px' }}><div className="font-medium text-sm">{a.name}</div><div className="text-xs text-secondary">{a.category}</div></td>
                    <td style={{ padding: '8px 12px' }}><span className="mono">{a.sku}</span></td>
                    <td className="font-bold" style={{ padding: '8px 12px' }}>{a.qty}</td>
                    <td style={{ padding: '8px 12px' }} className="text-secondary">{a.safety}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className={`badge ${a.qty === 0 ? 'badge-out' : 'badge-low'}`} style={{ fontSize: 10 }}>
                        {a.qty === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
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
