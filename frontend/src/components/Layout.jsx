import { useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="layout">
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-content" style={{ position: 'relative' }}>
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'absolute', top: 18, left: 16, zIndex: 60,
            background: 'transparent', border: 'none', color: 'var(--text-primary)',
            cursor: 'pointer', padding: '4px'
          }}
        >
          <HamburgerIcon />
        </button>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title="Toggle Dark Mode"
          style={{ 
            position: 'absolute', top: 16, right: 32, zIndex: 60,
            width: 38, height: 38, borderRadius: '50%', padding: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        {children}
      </main>
    </div>
  );
}
