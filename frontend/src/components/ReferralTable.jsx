const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export default function ReferralTable({ history, loading }) {
  return (
    <div className="section">
      <h3>Referral Income History</h3>
      {loading ? (
        <div className="loading-state">Loading referral income...</div>
      ) : history.length === 0 ? (
        <div className="empty-state">No referral income yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>Level</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id}>
                <td>{fmtDate(h.date)}</td>
                <td style={{ fontFamily: 'var(--font-body)' }}>
                  {h.sourceUser?.fullName || 'Unknown'}
                </td>
                <td>L{h.level}</td>
                <td>₹{fmt(h.incomeAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
