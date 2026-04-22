import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Label, AreaChart, Area
} from 'recharts';

import { toIC, toRupees, formatIC } from '../utils/conversionUtils';
import Leaderboard from '../components/Leaderboard';
import toast from 'react-hot-toast';
import Tree from 'react-d3-tree';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import ICIcon from '../components/ICIcon';
import LoginCalendar from '../components/LoginCalendar';
import UnifiedIcon from '../components/UnifiedIcon';

// Modular Components
import StatCards from '../components/student/StatCards';
import ReferralLadder from '../components/student/ReferralLadder';
import EarningsHistory from '../components/student/EarningsHistory';
import WithdrawalStatus from '../components/student/WithdrawalStatus';
import ProfilePanel from '../components/student/ProfilePanel';
import SettingsPanel from '../components/student/SettingsPanel';
import HowEarningsWork from '../components/student/HowEarningsWork';
import BottomNav from '../components/BottomNav';

const Sidebar = ({ active, setActive, sidebarOpen, setSidebarOpen, dashboard }) => {
  const { user, logout } = useAuth();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Category' },
    { id: 'referrals', label: 'My Referrals', icon: 'People' },
    { id: 'tree', label: 'Referral Tree', icon: 'Diagram' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'Ranking' },
    { id: 'earnings', label: 'Earnings', icon: 'WalletMoney' },
    { id: 'how-it-works', label: 'Point System', icon: 'LampCharge' },
    { id: 'profile', label: 'My Profile', icon: 'UserSquare' },
    { id: 'settings', label: 'Settings', icon: 'Setting2' },
  ];

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} className="lg:hidden" />
        )}
      </AnimatePresence>

      <aside className="sidebar" style={{ transform: sidebarOpen ? 'translateX(0)' : undefined, width: 'var(--sidebar-width)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Logo */}
        <div style={{ padding: 'var(--space-card)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UnifiedIcon name="Monitor" size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontFamily: 'Outfit', fontSize: '1rem' }}>IGCIM</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', letterSpacing: '0.08em' }} className="hidden xs:block">COMPUTER CENTRE</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem', margin: '0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00B4D8, #0096BB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{user?.fullName?.[0]}</span>
            </div>
            {dashboard?.milestoneBadge && (
                <div style={{ 
                    padding: '0.2rem 0.6rem', 
                    background: 'rgba(245, 158, 11, 0.2)', 
                    border: '1px solid rgba(245, 158, 11, 0.4)', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.3rem',
                    color: '#fbbf24',
                    fontSize: '0.6rem',
                    fontWeight: '800'
                }}>
                    <UnifiedIcon name="Award" size={14} color="#fbbf24" /> {dashboard.milestoneBadge.toUpperCase()}
                </div>
            )}
          </div>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.15rem' }}>{user?.fullName}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{user?.systemId}</div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {links.map(({ id, label, icon }) => (
            <button key={id} onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`sidebar-link ${active === id ? 'active' : ''}`}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UnifiedIcon name={icon} size={18} /> {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem' }}>
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UnifiedIcon name="Logout" size={18} color="#fca5a5" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', upi_id: '' });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawTotalPages, setWithdrawTotalPages] = useState(1);
  
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [earningsPage, setEarningsPage] = useState(1);
  const [earningsTotalPages, setEarningsTotalPages] = useState(1);

  const [showCalendar, setShowCalendar] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', education: '', address: '', bio: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Core Data states
  const [dashboard, setDashboard] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [referralTree, setReferralTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const treeContainerRef = useRef(null);
  const [treeDims, setTreeDims] = useState({ width: 0, height: 0 });
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 0 });
  const [treeZoom, setTreeZoom] = useState(0.8);
  const [isFullscreenTree, setIsFullscreenTree] = useState(false);

  useEffect(() => {
    if (active !== 'tree' || !treeContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setTreeDims({ width, height });
          setTreeTranslate({ x: width / 2, y: 80 });
        }
      }
    });

    observer.observe(treeContainerRef.current);
    return () => observer.disconnect();
  }, [active, referralTree]);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [dashRes, withdrawRes, earnHistoryRes, profileRes] = await Promise.all([
        api.get('/dashboard/student'),
        api.get(`/commissions/withdrawals?limit=10&page=${withdrawPage}`),
        api.get(`/dashboard/earnings/history?limit=10&page=${earningsPage}`),
        api.get('/users/profile')
      ]);

      if (dashRes.data.success) {
        setDashboard(dashRes.data.data.stats);
        setEarningsData(dashRes.data.data.breakdown);
        setChartData(dashRes.data.data.chart);
        setRecentAdmissions(dashRes.data.data.recentAdmissions);
        setReferralTree(dashRes.data.data.tree);
      }
      
      if (withdrawRes.data.success) {
        setWithdrawHistory(withdrawRes.data.data);
        setWithdrawTotalPages(withdrawRes.data.pagination.totalPages);
      }

      if (earnHistoryRes.data.success) {
        setEarningsHistory(earnHistoryRes.data.data);
        setEarningsTotalPages(earnHistoryRes.data.pagination.totalPages);
      }
      
      if (profileRes.data.success) {
        setProfileForm(profileRes.data.data);
      }
    } catch (err) {
      console.error('Dashboard Fetch Failure:', err);
      setError('Dashboard unavailable. Please check your connection.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [withdrawPage, earningsPage]);

  useEffect(() => {
    loadData();
    const onFocus = () => loadData(false);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadData]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toTreeData = (node) => ({
    name: node.full_name || node.root?.full_name || 'You',
    attributes: { ID: node.system_id || node.root?.system_id },
    children: (node.children || []).map(toTreeData),
  });

  const getStatusBadge = (status) => (
    <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', width: '100%', maxWidth: '100vw' }}>
      <Sidebar active={active} setActive={setActive} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} dashboard={dashboard} />

      <main className="main-content">
        {/* Top bar */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.25rem', display: 'flex' }} className="lg:hidden">
              <UnifiedIcon name="Menu" size={22} />
            </button>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'Outfit' }}>
                {active === 'dashboard' ? 'Dashboard' : active === 'referrals' ? 'My Referrals' : active === 'tree' ? 'Referral Tree' : active === 'leaderboard' ? 'Leaderboard' : active === 'earnings' ? 'Earnings' : active.charAt(0).toUpperCase() + active.slice(1)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} className="hidden sm:block">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCalendar(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.875rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px' }}>
              <UnifiedIcon name="Calendar" size={16} color="white" /> Daily Rewards
            </button>
            <ThemeToggle />
            <NotificationBell scope="student" />
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hidden lg:flex">
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{user?.referralCode}</span>
              <button onClick={copyReferralCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                {copied ? <UnifiedIcon name="TickCircle" size={13} /> : <UnifiedIcon name="Copy" size={13} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: 'var(--space-page)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--border)', borderTopColor: 'var(--text-primary)' }} />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <UnifiedIcon name="Danger" size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Oops! Something went wrong</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UnifiedIcon name="Refresh" size={16} /> Retry Now
              </button>
            </div>
          ) : (
            <>
              {active === 'dashboard' && (
                <>
                  {/* Boost Status Banner */}
                  {dashboard?.boost_level !== undefined && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                      style={{ 
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                        borderRadius: '16px', 
                        padding: '1rem 1.5rem', 
                        marginBottom: '1.5rem', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        boxShadow: '0 8px 20px rgba(217, 119, 6, 0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '12px' }}>
                          <UnifiedIcon lib="lordicon" name="vlvjquun" size={24} color="white" trigger="hover" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             Boost Level {dashboard.boost_level} Active
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>
                            Currently earning {dashboard.boost_level === 2 ? '+ ₹25' : dashboard.boost_level === 1 ? '+ ₹10' : 'base'} bonus per referral
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '2px' }}>Referral Progress</div>
                        <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{dashboard.directCount}/6</div>
                      </div>
                    </motion.div>
                  )}

                  <StatCards stats={dashboard} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Earnings Breakdown</h3>
                      <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Direct', value: earningsData?.direct || 0, fill: '#10b981' },
                                { name: 'Overrides', value: (earningsData?.overrideL1 || 0) + (earningsData?.overrideL2 || 0), fill: '#3b82f6' },
                                { name: 'Bonuses', value: earningsData?.bonus || 0, fill: '#f59e0b' }
                              ]}
                              innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                            >
                              <Label value={`${formatIC(toIC((earningsData?.direct || 0) + (earningsData?.overrideL1 || 0) + (earningsData?.overrideL2 || 0) + (earningsData?.bonus || 0)))}`} position="center" style={{ fontSize: '1rem', fontWeight: 'bold', fill: 'var(--text-primary)' }} />
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <ReferralLadder currentCount={dashboard?.directCount || 0} />
                    
                    <WithdrawalStatus 
                      balance={dashboard?.withdrawablePoints || 0} 
                      isLocked={dashboard?.isLockedByLeftRight} 
                      stats={dashboard || {}} 
                      onWithdraw={() => setWithdrawModal(true)} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                      <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Earning Trend (IC)</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                          <Tooltip content={(props) => (
                            props.active && props.payload && props.payload.length ? (
                              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{props.label}</div>
                                <div style={{ color: '#10b981', fontWeight: 'bold' }}>{formatIC(props.payload[0].value)} IC</div>
                              </div>
                            ) : null
                          )} />
                          <Area type="monotone" dataKey="points" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Recent Referrals</h3>
                      </div>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr><th>Name</th><th>System ID</th><th>Status</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                             {recentAdmissions.length === 0 ? (
                               <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No recent enrollments yet.</td></tr>
                             ) : (
                               recentAdmissions.slice(0, 5).map(r => (
                                 <tr key={r.id}>
                                   <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.student_name || r.full_name}</td>
                                   <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.system_id || '—'}</td>
                                   <td>{getStatusBadge(r.status || 'pending')}</td>
                                   <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                 </tr>
                               ))
                             )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}

              {active === 'leaderboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Leaderboard />
                </motion.div>
              )}

              {active === 'referrals' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                   <div className="stat-card" style={{ background: 'var(--bg-card)' }}>
                      <div style={{ color: '#00B4D8', fontSize: '1.25rem', fontWeight: '800' }}>{dashboard?.leftCount || 0}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Left Tree</div>
                   </div>
                   <div className="stat-card" style={{ background: 'var(--bg-card)' }}>
                      <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: '800' }}>{dashboard?.rightCount || 0}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Right Tree</div>
                   </div>
                </div>
              )}

              {active === 'tree' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    border: '1px solid var(--border)', 
                    height: isFullscreenTree ? '100vh' : '600px',
                    position: isFullscreenTree ? 'fixed' : 'relative',
                    top: isFullscreenTree ? 0 : 'auto',
                    left: isFullscreenTree ? 0 : 'auto',
                    width: isFullscreenTree ? '100vw' : '100%',
                    zIndex: isFullscreenTree ? 1000 : 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Referral Tree</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Visual map of your multi-level referral network</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setTreeZoom(z => Math.max(0.2, z - 0.2))} className="btn-icon" title="Zoom Out"><UnifiedIcon name="Minus" size={18} /></button>
                      <button onClick={() => setTreeZoom(z => Math.min(2, z + 0.2))} className="btn-icon" title="Zoom In"><UnifiedIcon name="Add" size={18} /></button>
                      <button onClick={() => setIsFullscreenTree(!isFullscreenTree)} className="btn-icon" title="Toggle Fullscreen">
                        <UnifiedIcon name={isFullscreenTree ? "ArrowDown" : "Maximize"} size={18} />
                      </button>
                    </div>
                  </div>
                  {referralTree ? (
                    <div ref={treeContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg)', borderRadius: '12px' }}>
                      {treeDims.width > 0 && (
                        <Tree 
                          data={toTreeData(referralTree)} 
                          orientation="vertical" 
                          translate={treeTranslate} 
                          dimensions={treeDims} 
                          zoom={treeZoom}
                          pathFunc="step" 
                          enableLegacyTransitions={true}
                          transitionDuration={400}
                        />
                      )}
                    </div>
                  ) : <div>No tree data available. Start referring to build your tree!</div>}
                </motion.div>
              )}

              {active === 'how-it-works' && (
                <HowEarningsWork />
              )}

              {active === 'earnings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Earnings & History</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                      <div className="stat-card">
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Direct Earned</div>
                         <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{earningsData?.direct || 0}</div>
                      </div>
                      <div className="stat-card">
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Overrides (L1-L6)</div>
                         <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{(earningsData?.overrideL1 || 0) + (earningsData?.overrideL2 || 0)}</div>
                      </div>
                      <div className="stat-card">
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bonus & Rewards</div>
                         <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{earningsData?.bonus || 0}</div>
                      </div>
                    </div>
                    <EarningsHistory data={earningsHistory} page={earningsPage} totalPages={earningsTotalPages} onPageChange={setEarningsPage} />
                  </div>
                </motion.div>
              )}

              {active === 'settings' && (
                <SettingsPanel />
              )}

              {active === 'profile' && (
                <ProfilePanel />
              )}
            </>
          )}
        </div>
      </main>

      {withdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: '400px' }}>
            <h3>Withdraw</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setWithdrawLoading(true);
              try {
                await api.post('/commissions/withdraw', withdrawForm);
                setWithdrawModal(false);
                toast.success('Submitted');
                await loadData(false);
              } catch (err) {
                toast.error('Failed');
              } finally {
                setWithdrawLoading(false);
              }
            }}>
              <input type="number" className="form-input" value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} />
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Submit</button>
              <button type="button" onClick={() => setWithdrawModal(false)} className="btn-outline" style={{ marginTop: '1rem', marginLeft: '1rem' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <LoginCalendar isOpen={showCalendar} onClose={() => setShowCalendar(false)} onCheckInSuccess={() => loadData(false)} />
      <BottomNav active={active} setActive={setActive} />
    </div>
  );
}
