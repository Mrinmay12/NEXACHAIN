const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export default function RoiTable({ history, loading }) {
  return (
    <div className="section">
      <h3>ROI History</h3>
      {loading ? (
        <div className="loading-state">Loading ROI history...</div>
      ) : history.length === 0 ? (
        <div className="empty-state">No ROI credited yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Plan</th>
              <th>ROI Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id}>
                <td>{fmtDate(h.date)}</td>
                <td style={{ fontFamily: 'var(--font-body)' }}>
                  {h.investment?.planDetails?.name || '—'}
                </td>
                <td>₹{fmt(h.roiAmount)}</td>
                <td>
                  <span className="badge active">{h.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
