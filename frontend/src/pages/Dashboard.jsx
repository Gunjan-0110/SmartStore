import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

function BarChart({ assets }) {
  if (!assets.length) return <p className="text-secondary text-sm">No data</p>;
  const maxQty = Math.max(...assets.map(a => a.qty), 1);
  const shown = assets.slice(0, 8);
  return (
    <div className="chart-bar-wrap">
      {shown.map(a => {
        const pct = Math.max((a.qty / maxQty) * 100, a.qty === 0 ? 0 : 4);
        const color = a.qty === 0 ? '#ef4444' : a.qty <= a.safety ? '#f59e0b' : '#3b82f6';
        return (
          <div className="chart-bar-item" key={a._id} title={`${a.name}: ${a.qty}`}>
            <div className="chart-bar-val">{a.qty}</div>
            <div className="chart-bar-track" style={{ flex: 1, minHeight: 80 }}>
              <div className="chart-bar-fill" style={{ height: `${pct}%`, background: color }} />
            </div>
            <div className="chart-bar-label">{a.name.split(' ')[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/assets'), api.get('/logs')])
      .then(([a, l]) => {
        setAssets(a.data.assets || []);
        setLogs((l.data.logs || []).slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalItems   = assets.reduce((s, a) => s + a.qty, 0);
  const lowStock     = assets.filter(a => a.qty > 0 && a.qty <= a.safety).length;
  const outOfStock   = assets.filter(a => a.qty === 0).length;
  const categories   = new Set(assets.map(a => a.category)).size;

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
      </div>

      {/* Charts + Activity */}
      <div className="two-col">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-bold">Stock Levels</div>
              <div className="text-xs text-secondary">Current quantity per asset</div>
            </div>
          </div>
          <BarChart assets={assets} />
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-bold">Recent Activity</div>
              <div className="text-xs text-secondary">Latest audit events</div>
            </div>
            <Link to="/audit" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {logs.length === 0
            ? <p className="text-secondary text-sm">No activity yet</p>
            : logs.map((log, i) => {
                const pill = getOpPill(log.action);
                return (
                  <div className="activity-item" key={log._id || i}>
                    <div className="activity-avatar" style={getAvatarStyle(log.action)}>
                      {getInitials(log.user)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: 2 }}>
                        <span className="font-medium text-sm">{log.user}</span>
                        <span className={pill.cls}>{pill.label}</span>
                      </div>
                      <div className="activity-action text-sm">
                        {log.action} — <span className="activity-target">{log.target}</span>
                      </div>
                      <div className="activity-time">{new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Low stock table */}
      {(lowStock + outOfStock) > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="font-bold mb-4">⚠ Assets Needing Attention</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th><th>SKU</th><th>Qty</th><th>Safety</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.filter(a => a.qty <= a.safety).map(a => (
                  <tr key={a._id}>
                    <td><div className="font-medium">{a.name}</div><div className="text-xs text-secondary">{a.category}</div></td>
                    <td><span className="mono">{a.sku}</span></td>
                    <td className="font-bold">{a.qty}</td>
                    <td className="text-secondary">{a.safety}</td>
                    <td>
                      <span className={`badge ${a.qty === 0 ? 'badge-out' : 'badge-low'}`}>
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
