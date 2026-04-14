import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const IconLog = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">S</div>
        <div>
          <div className="logo-text">SmartStock</div>
          <div className="logo-sub">OS v2.0</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">Main</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <IconDashboard /> Dashboard
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <IconBox /> Inventory
          </NavLink>
          <NavLink to="/add-asset" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <IconPlus /> Add Asset
          </NavLink>
        {user?.role === 'Admin' && (
          <div className="nav-section">
            <div className="nav-label">Management</div>
            <NavLink to="/audit" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <IconLog /> Audit Log
            </NavLink>
            <NavLink to="/access" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <IconUsers /> Access Control
            </NavLink>
          </div>
        )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <Link to="/profile" className="user-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="avatar">{getInitials(user?.name)}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.isSuperAdmin ? 'Super Admin' : user?.role}</div>
          </div>
        </Link>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  );
}
