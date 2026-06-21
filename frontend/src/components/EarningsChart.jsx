import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export default function EarningsChart({ roiHistory, loading }) {
  const chartData = [...(roiHistory || [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((h) => ({ date: fmtDate(h.date), roi: h.roiAmount }));

  return (
    <div className="section">
      <h3>Earnings Trend (ROI)</h3>
      {loading ? (
        <div className="loading-state">Loading chart...</div>
      ) : chartData.length === 0 ? (
        <div className="empty-state">Not enough data yet to chart earnings.</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#243049" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke="#8d9bb8" fontSize={11} tickLine={false} />
            <YAxis stroke="#8d9bb8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: '#19233a',
                border: '1px solid #243049',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e7ecf5' }}
            />
            <Area
              type="monotone"
              dataKey="roi"
              stroke="#2dd4bf"
              strokeWidth={2}
              fill="url(#roiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
