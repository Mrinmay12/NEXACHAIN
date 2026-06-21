const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n || 0);

export default function DashboardCards({ summary, loading }) {
  const cards = [
    { label: 'Total Investments', value: summary?.totalInvestments, color: 'var(--teal)' },
    { label: "Today's ROI", value: summary?.todayRoi, color: 'var(--gold)' },
    { label: 'Total Level Income', value: summary?.totalLevelIncomeEarned, color: 'var(--rose)' },
    { label: 'Wallet Balance', value: summary?.walletBalance, color: 'var(--teal)' },
  ];

  return (
    <div className="card-grid">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="accent-bar" style={{ background: c.color }} />
          <div className="label">{c.label}</div>
          <div className="value">{loading ? '—' : `₹${fmt(c.value)}`}</div>
        </div>
      ))}
    </div>
  );
}
