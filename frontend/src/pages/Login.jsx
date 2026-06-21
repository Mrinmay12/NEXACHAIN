import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="brand-mark">
          <span className="dot" />
          NEXACHAIN
        </div>
        <div className="auth-pitch">
          <h1>Every referral. Every return. One ledger.</h1>
          <p>
            Track active investments, daily ROI accrual, and your full referral network
            from a single dashboard built for clarity.
          </p>
        </div>
        <div className="ledger-strip">
          <div>
            <strong>5 Levels</strong>
            Referral depth
          </div>
          <div>
            <strong>Daily</strong>
            ROI processing
          </div>
          <div>
            <strong>Idempotent</strong>
            Payout engine
          </div>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to view your portfolio</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="switch-link">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
