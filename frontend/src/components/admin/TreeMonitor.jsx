import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';
import UnifiedIcon from '../UnifiedIcon';

export default function TreeMonitor() {
  const [pending, setPending] = useState([]);
  const [failed, setFailed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const [resP, resF] = await Promise.all([
        api.get('/admin/tree/pending'),
        api.get('/admin/tree/failed')
      ]);
      setPending(resP.data.data || []);
      setFailed(resF.data.data || []);
    } catch (err) {
      toast.error('Failed to sync placement monitor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const handleRetry = async (userId) => {
    try {
      await api.post(`/admin/tree/retry/${userId}`);
      toast.success('Placement retried successfully.');
      fetchPlacements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Retry failed.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Binary Tree Monitor</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track automated member placement across the network tree.</p>
        </div>
        <button onClick={fetchPlacements} disabled={loading} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UnifiedIcon name="Refresh" size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '2rem' }}>
        {/* Pending Placements */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <UnifiedIcon name="Activity" size={20} color="var(--primary)" />
            <h3 style={{ fontWeight: '700', fontSize: '1rem' }}>Pending Placements ({pending.length})</h3>
          </div>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>All members successfully placed.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pending.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg)', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attempts: {user.placement_attempts}</div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Failed Placements */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <UnifiedIcon name="Danger" size={20} color="var(--danger)" />
            <h3 style={{ fontWeight: '700', fontSize: '1rem' }}>Failed Placements ({failed.length})</h3>
          </div>
          {failed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No critical failures found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {failed.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Max attempts reached</div>
                  </div>
                  <button onClick={() => handleRetry(user.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Manual Retry</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
