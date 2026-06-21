import { useState } from 'react';
import api from '../api/axios.js';

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export default function InvestmentTable({ investments, loading, onCreated }) {
  const [form, setForm] = useState({
    investmentAmount: '',
    planName: '',
    durationInDays: '',
    dailyRoiPercentage: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/investments', {
        investmentAmount: Number(form.investmentAmount),
        planName: form.planName,
        durationInDays: Number(form.durationInDays),
        dailyRoiPercentage: Number(form.dailyRoiPercentage),
      });
      setForm({ investmentAmount: '', planName: '', durationInDays: '', dailyRoiPercentage: '' });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create investment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <h3>New Investment</h3>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="investment-form">
          <div className="field">
            <label>Plan name</label>
            <input
              name="planName"
              required
              value={form.planName}
              onChange={handleChange}
              placeholder="Growth Plan"
            />
          </div>
          <div className="field">
            <label>Amount (₹)</label>
            <input
              name="investmentAmount"
              type="number"
              min="1"
              required
              value={form.investmentAmount}
              onChange={handleChange}
              placeholder="10000"
            />
          </div>
          <div className="field">
            <label>Duration (days)</label>
            <input
              name="durationInDays"
              type="number"
              min="1"
              required
              value={form.durationInDays}
              onChange={handleChange}
              placeholder="90"
            />
          </div>
          <div className="field">
            <label>Daily ROI (%)</label>
            <input
              name="dailyRoiPercentage"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.dailyRoiPercentage}
              onChange={handleChange}
              placeholder="1.2"
            />
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={submitting} style={{ maxWidth: 200 }}>
          {submitting ? 'Submitting...' : 'Create investment'}
        </button>
      </form>

      <h3 style={{ marginTop: 28 }}>Investment History</h3>
      {loading ? (
        <div className="loading-state">Loading investments...</div>
      ) : investments.length === 0 ? (
        <div className="empty-state">No investments yet. Create your first one above.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Amount</th>
              <th>Daily ROI</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv._id}>
                <td style={{ fontFamily: 'var(--font-body)' }}>{inv.planDetails?.name}</td>
                <td>₹{fmt(inv.investmentAmount)}</td>
                <td>{inv.dailyRoiPercentage}%</td>
                <td>{fmtDate(inv.startDate)}</td>
                <td>{fmtDate(inv.endDate)}</td>
                <td>
                  <span className={`badge ${inv.status.toLowerCase()}`}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
