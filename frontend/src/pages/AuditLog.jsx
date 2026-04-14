import { useState, useEffect } from 'react';
import api from '../services/api';

const ACTION_COLORS = {
  'Created Asset':    { bg: 'rgba(34,197,94,.1)',  color: '#22c55e', label: 'CREATE' },
  'Added User':       { bg: 'rgba(34,197,94,.1)',  color: '#22c55e', label: 'CREATE' },
  'Updated Asset':    { bg: 'rgba(59,130,246,.1)', color: '#60a5fa', label: 'UPDATE' },
  'Updated User':     { bg: 'rgba(59,130,246,.1)', color: '#60a5fa', label: 'UPDATE' },
  'Updated Inventory':{ bg: 'rgba(59,130,246,.1)', color: '#60a5fa', label: 'UPDATE' },
  'Changed User Role':{ bg: 'rgba(168,85,247,.1)', color: '#a855f7', label: 'ROLE' },
  'Deleted Asset':    { bg: 'rgba(239,68,68,.1)',  color: '#ef4444', label: 'DELETE' },
  'Deleted User':     { bg: 'rgba(239,68,68,.1)',  color: '#ef4444', label: 'DELETE' },
  'Login':            { bg: 'rgba(34,197,94,.1)',  color: '#22c55e', label: 'LOGIN' },
  'Logout':           { bg: 'rgba(245,158,11,.1)', color: '#f59e0b', label: 'LOGOUT' },
};

function getActionStyle(action) {
  return ACTION_COLORS[action] || { bg: 'rgba(255,255,255,.05)', color: '#8b949e', label: action };
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const FILTERS = ['All', 'CREATE', 'UPDATE', 'DELETE', 'ROLE', 'LOGIN'];

  useEffect(() => {
    api.get('/logs').then(({ data }) => {
      setLogs(data.logs || []);
      setFiltered(data.logs || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...logs];
    if (filter !== 'All') {
      list = list.filter(l => getActionStyle(l.action).label === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [logs, search, filter]);

  return (
    <div className="page">
      <div className="topbar" style={{ margin: '-32px -32px 32px', width: 'calc(100% + 64px)' }}>
        <div>
          <div className="topbar-title">Audit Log</div>
          <div className="text-xs text-secondary">{logs.length} events recorded</div>
        </div>
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <p className="text-secondary">Loading…</p> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Action</th><th>Target</th><th>Status</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>No logs found</td></tr>
                ) : filtered.map((log, i) => {
                  const style = getActionStyle(log.action);
                  return (
                    <tr key={log._id || i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(log.user)}
                          </div>
                          <span className="font-medium">{log.user}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, letterSpacing: '.5px' }}>
                          {style.label}
                        </span>
                        <span className="text-secondary text-xs" style={{ marginLeft: 8 }}>{log.action}</span>
                      </td>
                      <td className="font-medium">{log.target}</td>
                      <td>
                        <span className={`badge badge-${log.status?.toLowerCase()}`}>{log.status}</span>
                      </td>
                      <td className="text-secondary text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
