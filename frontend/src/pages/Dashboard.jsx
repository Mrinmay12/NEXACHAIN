import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import DashboardCards from '../components/DashboardCards.jsx';
import EarningsChart from '../components/EarningsChart.jsx';
import InvestmentTable from '../components/InvestmentTable.jsx';
import RoiTable from '../components/RoiTable.jsx';
import ReferralTable from '../components/ReferralTable.jsx';
import ReferralTree from '../components/ReferralTree.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [roiHistory, setRoiHistory] = useState([]);
  const [referralHistory, setReferralHistory] = useState([]);
  const [referralTree, setReferralTree] = useState(null);

  const [loading, setLoading] = useState({
    summary: true,
    investments: true,
    roi: true,
    referrals: true,
    tree: true,
  });
  const [error, setError] = useState('');

  const setLoadingKey = (key, val) => setLoading((prev) => ({ ...prev, [key]: val }));

  const loadSummary = useCallback(async () => {
    setLoadingKey('summary', true);
    try {
      const { data } = await api.get('/dashboard/summary');
      setSummary(data.data);
    } catch {
      setError('Failed to load dashboard summary');
    } finally {
      setLoadingKey('summary', false);
    }
  }, []);

  const loadInvestments = useCallback(async () => {
    setLoadingKey('investments', true);
    try {
      const { data } = await api.get('/investments');
      setInvestments(data.data);
    } catch {
      setError('Failed to load investments');
    } finally {
      setLoadingKey('investments', false);
    }
  }, []);

  const loadRoiHistory = useCallback(async () => {
    setLoadingKey('roi', true);
    try {
      const { data } = await api.get('/dashboard/roi-history');
      setRoiHistory(data.data);
    } catch {
      setError('Failed to load ROI history');
    } finally {
      setLoadingKey('roi', false);
    }
  }, []);

  const loadReferralHistory = useCallback(async () => {
    setLoadingKey('referrals', true);
    try {
      const { data } = await api.get('/dashboard/referral-income-history');
      setReferralHistory(data.data);
    } catch {
      setError('Failed to load referral income history');
    } finally {
      setLoadingKey('referrals', false);
    }
  }, []);

  const loadReferralTree = useCallback(async () => {
    setLoadingKey('tree', true);
    try {
      const { data } = await api.get('/referrals/tree');
      setReferralTree(data.data);
    } catch {
      setError('Failed to load referral tree');
    } finally {
      setLoadingKey('tree', false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadInvestments();
    loadRoiHistory();
    loadReferralHistory();
    loadReferralTree();
  }, [loadSummary, loadInvestments, loadRoiHistory, loadReferralHistory, loadReferralTree]);

  const handleInvestmentCreated = () => {
    loadInvestments();
    loadSummary();
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-area">
        <div className="page-header">
          <div>
            <p className="eyebrow">Portfolio overview</p>
            <h1>Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            Your code: <span style={{ color: 'var(--teal)' }}>{user?.referralCode}</span>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <DashboardCards summary={summary} loading={loading.summary} />

        <EarningsChart roiHistory={roiHistory} loading={loading.roi} />

        <InvestmentTable
          investments={investments}
          loading={loading.investments}
          onCreated={handleInvestmentCreated}
        />

        <RoiTable history={roiHistory} loading={loading.roi} />

        <ReferralTable history={referralHistory} loading={loading.referrals} />

        <ReferralTree tree={referralTree} loading={loading.tree} />
      </main>
    </div>
  );
}
