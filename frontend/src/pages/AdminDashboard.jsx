import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import UnifiedIcon from '../components/UnifiedIcon';

import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import Leaderboard from '../components/Leaderboard';

// Modular Components
import Overview from '../components/admin/Overview';
import UsersList from '../components/admin/UsersList';
import AdmissionsTable from '../components/admin/AdmissionsTable';
import TreeMonitor from '../components/admin/TreeMonitor';
import WithdrawalManager from '../components/admin/WithdrawalManager';
import SettingsPanel from '../components/admin/SettingsPanel';
import ReportsView from '../components/admin/ReportsView';
import CourseManager from '../components/admin/CourseManager';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [stats, setStats] = useState({});
  const [intelligence, setIntelligence] = useState({ metrics: {}, insights: {} });
  const [admissions, setAdmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [resStats, resMetrics, resForecast, resAdm, resUsers, resWith, resSett] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/metrics/expense'),
        api.get('/admin/insights/forecast'),
        api.get('/admissions?limit=100'),
        api.get('/users/students'),
        api.get('/commissions/withdrawals?limit=50'),
        api.get('/settings')
      ]);

      setStats(resStats.data.data);
      setIntelligence({
        metrics: resMetrics.data.data || {},
        insights: resForecast.data.data || {}
      });
      setAdmissions(resAdm.data.data || []);
      setUsers(resUsers.data.data || []);
      setWithdrawals(resWith.data.data || []);
      setSettings(resSett.data.data || {});
    } catch (err) {
      toast.error('Failed to sync admin data.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 30000); // 30s background poll
    return () => clearInterval(interval);
  }, [loadData]);

  const handleApproveAdmission = async (id) => {
    try {
      await api.patch(`/admissions/${id}/approve`);
      toast.success('Admission approved!');
      loadData(false);
    } catch (err) {
      toast.error('Approval failed.');
    }
  };

  const handleRejectAdmission = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/admissions/${id}/reject`, { rejection_reason: reason });
      toast.success('Admission rejected.');
      loadData(false);
    } catch (err) {
      toast.error('Rejection failed.');
    }
  };

  const handleUpdateWithdrawal = async (id, status) => {
    let admin_notes = '';
    let payout_reference_id = null;

    if (status === 'paid') {
      payout_reference_id = prompt('MANDATORY: Enter Bank/UPI Transaction Reference ID:');
      if (!payout_reference_id) {
        toast.error('Payout Reference ID is required to mark as Paid.');
        return;
      }
      admin_notes = prompt('Additional Admin Notes (Optional):') || '';
    } else if (status === 'rejected') {
      admin_notes = prompt('Enter Rejection Reason:') || '';
      if (!admin_notes) return;
    }

    try {
      await api.patch(`/commissions/withdrawals/${id}/status`, { 
        status, 
        admin_notes,
        payout_reference_id 
      });
      toast.success(`Withdrawal marked as ${status}.`);
      loadData(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };


  const handlePromoteDemote = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role_name: role });
      toast.success(`User updated to ${role}.`);
      loadData(false);
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted.');
      loadData(false);
    } catch (err) {
      toast.error('Deletion failed.');
    }
  };

  const links = [
    { id: 'overview', label: 'Overview', icon: 'Category' },
    { id: 'users', label: 'Users', icon: 'People' },
    { id: 'admissions', label: 'Admissions', icon: 'Book' },
    { id: 'courses', label: 'Courses', icon: 'Teacher' },
    { id: 'tree', label: 'Tree Monitor', icon: 'Diagram' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'Wallet' },
    { id: 'settings', label: 'Settings', icon: 'Setting2' },
    { id: 'reports', label: 'Reports', icon: 'Graph' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'Ranking' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', width: '100%' }}>
      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className="sidebar" style={{ transform: sidebarOpen ? 'translateX(0)' : undefined }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UnifiedIcon name="Monitor" size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem' }}>IGCIM Admin</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>IMMUTABLE LEDGER</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {links.map(({ id, label, icon: IconName }) => (
            <button key={id} onClick={() => { setActive(id); setSidebarOpen(false); }} className={`sidebar-link ${active === id ? 'active' : ''}`} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UnifiedIcon name={IconName} size={17} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem' }}>
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UnifiedIcon name="Logout" size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1, minWidth: 0, background: 'var(--bg)' }}>
        {/* Top Header */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
                    <UnifiedIcon name="Menu" size={22} />
                </button>
                <div style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {active === 'tree' ? 'Tree Monitor' : active.charAt(0).toUpperCase() + active.slice(1)}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ThemeToggle />
                <NotificationBell scope="admin" />
                <button onClick={() => loadData()} disabled={loading} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <UnifiedIcon name="Refresh" size={14} className={loading ? 'spin' : ''} /> <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>
        </div>

        <div style={{ padding: '2rem' }}>
            {active === 'overview' && <Overview stats={stats} intelligence={intelligence} />}
            {active === 'users' && <UsersList users={users} onPromote={handlePromoteDemote} onDemote={handlePromoteDemote} onDelete={handleDeleteUser} />}
            {active === 'admissions' && <AdmissionsTable admissions={admissions} fraudAlerts={stats.fraudAlerts || {}} onApprove={handleApproveAdmission} onReject={handleRejectAdmission} />}
            { active === 'courses' && <CourseManager />}
            { active === 'tree' && <TreeMonitor />}
            {active === 'withdrawals' && <WithdrawalManager withdrawals={withdrawals} onUpdateStatus={handleUpdateWithdrawal} />}
            {active === 'settings' && <SettingsPanel initialSettings={settings} />}
            {active === 'reports' && <ReportsView />}
            {active === 'leaderboard' && <Leaderboard />}
        </div>
      </main>
    </div>
  );
}
