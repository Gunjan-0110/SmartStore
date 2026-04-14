import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect email or password. Please verify your credentials.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="login-logo">S</div>
          <div className="login-title">SmartStock OS</div>
          <div className="login-sub">Inventory Management System</div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert" style={{ marginBottom: 16, background: 'rgba(34,197,94,.15)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)' }}>{success}</div>}

        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              placeholder="you@smartstock.io"
              value={form.email} onChange={handle} required
              disabled={!!success}
            />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password} onChange={handle} required
              style={{ paddingRight: '40px' }}
              disabled={!!success}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: "4px" }}
              tabIndex="-1"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading || !!success}>
            {loading && !success ? 'Signing in…' : success ? 'Authenticated' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <div>Demo: admin@smartstock.io / admin123</div>
          <div>Don't have an account? <Link to="/signup">Sign Up</Link></div>
        </div>
      </div>
    </div>
  );
}
