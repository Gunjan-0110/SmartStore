import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="login-logo">S</div>
          <div className="login-title">SmartStock OS</div>
          <div className="login-sub">Create your account</div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert" style={{ marginBottom: 16, background: 'rgba(34,197,94,.15)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)' }}>{success}</div>}

        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              placeholder="John Doe"
              value={form.name} onChange={handle} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              placeholder="you@smartstock.io"
              value={form.email} onChange={handle} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              placeholder="Min. 6 characters"
              value={form.password} onChange={handle} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm" name="confirm" type="password"
              placeholder="••••••••"
              value={form.confirm} onChange={handle} required
            />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading || !!success}>
            {loading && !success ? 'Creating account…' : success ? 'Success' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <div>Already have an account? <Link to="/">Sign In</Link></div>
        </div>
      </div>
    </div>
  );
}
