import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/client';
import toast from 'react-hot-toast';
import UnifiedIcon from '../UnifiedIcon';

export default function ReportsView() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        setReports(res.data);
      } catch (err) {
        toast.error('Failed to load system reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Analyzing system data...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
        
        {/* Top Earners */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <UnifiedIcon name="Award" size={20} color="#f59e0b" />
            <h3 style={{ fontWeight: '700' }}>Network Top Earners</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {reports?.top_earners?.map((user, idx) => (
              <div key={user.system_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: '12px', border: idx === 0 ? '1px solid #f59e0b' : '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: idx < 3 ? '#f59e0b' : 'var(--text-secondary)' }}>#{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user.system_id}</div>
                  </div>
                </div>
                <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>₹{parseFloat(user.total_earned).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Payout Volume */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <UnifiedIcon name="Graph" size={20} color="var(--primary)" />
            <h3 style={{ fontWeight: '700' }}>Daily Distributed Volume (IC)</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={reports?.daily_points || []}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Bar dataKey="points" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </motion.div>
  );
}
