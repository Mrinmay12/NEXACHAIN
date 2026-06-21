import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
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
          <h1>Open your account, share your code, grow your tree.</h1>
          <p>
            Every member gets a unique referral code. Earn level income automatically as
            your downline invests.
          </p>
        </div>
        <div className="ledger-strip">
          <div>
            <strong>JWT</strong>
            Secured sessions
          </div>
          <div>
            <strong>Encrypted</strong>
            Password storage
          </div>
          <div>
            <strong>Real-time</strong>
            Wallet sync
          </div>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="sub">Start tracking your investments today</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Asha Verma"
              />
            </div>
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
              <label htmlFor="mobileNumber">Mobile number</label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                required
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="field">
              <label htmlFor="referralCode">Referral code (optional)</label>
              <input
                id="referralCode"
                name="referralCode"
                value={form.referralCode}
                onChange={handleChange}
                placeholder="NXC-XXXXXXXX"
              />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="switch-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
