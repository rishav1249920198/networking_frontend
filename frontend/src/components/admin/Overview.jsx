import React from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import ICIcon from '../ICIcon';
import { formatIC, toIC } from '../../utils/conversionUtils';
import UnifiedIcon from '../UnifiedIcon';

const StatCard = ({ label, value, subValue, icon, color, delay, trend }) => (
  <motion.div 
    className="stat-card" 
    style={{ background: 'var(--bg-card)', padding: '1.75rem', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
    whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: `${color}05`, borderRadius: '50%' }} />
    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
      <UnifiedIcon name={icon} size={22} color={color} />
    </div>
    <div style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'Outfit', marginBottom: '0.25rem', lineHeight: 1 }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {subValue && <div style={{ fontSize: '0.75rem', color: color, fontWeight: '700' }}>{subValue}</div>}
        {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: trend > 0 ? '#10b981' : '#ef4444', fontWeight: '800' }}>
                <UnifiedIcon name={trend > 0 ? 'ArrowUp' : 'ArrowDown'} size={12} color={trend > 0 ? '#10b981' : '#ef4444'} /> {Math.abs(trend).toFixed(1)}%
            </div>
        )}
    </div>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: 'auto' }}>{label}</div>
  </motion.div>
);

const FraudBadge = ({ flag }) => {
  const isHigh = flag.includes('Strong') || flag.includes('Loop');
  return (
    <span style={{ 
      fontSize: '0.65rem', 
      padding: '0.2rem 0.5rem', 
      borderRadius: '6px', 
      background: isHigh ? '#ef444415' : '#f59e0b15', 
      color: isHigh ? '#ef4444' : '#f59e0b',
      border: `1px solid ${isHigh ? '#ef444430' : '#f59e0b30'}`,
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem'
    }}>
      <UnifiedIcon name={isHigh ? 'Flash' : 'Danger'} size={12} color={isHigh ? '#ef4444' : '#f59e0b'} />
      {flag}
    </span>
  );
};

export default function Overview({ stats, intelligence }) {
  const admissions = stats.admissions || {};
  const topEarners = stats.topEarners || [];
  const trendData = stats.trendData || [];
  const fraudAlerts = stats.fraudAlerts || {};
  
  const metrics = intelligence?.metrics || {};
  const insights = intelligence?.insights || {};

  const expenseRatio = metrics.expense_ratio || 0;
  const sustainabilityColor = metrics.status_color === 'RED' ? '#ef4444' : metrics.status_color === 'YELLOW' ? '#f59e0b' : '#10b981';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Sustainability Guardrail Alert */}
      {metrics.status_color === 'RED' && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <UnifiedIcon name="Danger" color="#ef4444" size={24} />
          <div>
            <div style={{ fontWeight: '800', color: '#ef4444', fontSize: '0.9rem' }}>Critical Expense Ratio Warning</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total payouts have exceeded 6% of revenue. Consider pausing new withdrawal approvals.</div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard label="Total Admissions" value={admissions.total || 0} icon="Teacher" color="#3b82f6" delay={0} />
        <StatCard label="Approval Rate" value={`${admissions.total > 0 ? ((admissions.approved / admissions.total) * 100).toFixed(1) : 0}%`} icon="TickCircle" color="#10b981" delay={0.1} />
        <StatCard 
          label="Total Revenue" 
          value={`₹${Number(metrics.total_revenue || 0).toLocaleString()}`} 
          subValue={`${formatIC(toIC(metrics.total_revenue))} IC`}
          icon="WalletMoney" color="#10b981" delay={0.2} 
        />
        <StatCard 
          label="Expense Ratio" 
          value={`${expenseRatio.toFixed(1)}%`} 
          subValue={metrics.status_color + ' ZONE'}
          icon="Chart" color={sustainabilityColor} 
          trend={metrics.expense_ratio - metrics.last_24h_ratio}
          delay={0.3} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Predictive Insights */}
        <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UnifiedIcon name="Flash" size={18} color="#6366f1" /> Predictive Insights (7d Forecast)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.4rem' }}>EST. REVENUE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10b981' }}>₹{Number(insights.next_7d_estimated_revenue || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.8, color: '#10b981' }}>{formatIC(toIC(insights.next_7d_estimated_revenue))} IC</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Confidence: {insights.confidence || 'LOW'}</div>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.4rem' }}>EST. PAYOUT</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ef4444' }}>₹{Number(insights.next_7d_estimated_payout || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.8, color: '#ef4444' }}>{formatIC(toIC(insights.next_7d_estimated_payout))} IC</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Active users: {insights.active_users_7d || 0}</div>
                </div>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', borderLeft: '4px solid #6366f1' }}>
                <strong>Forecast Note:</strong> Based on 7-day rolling average. Actual values may vary based on referral velocity.
            </div>
        </div>

        {/* Suspicious Activity Scanner */}
        <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <UnifiedIcon name="ShieldSecurity" size={18} color="#ef4444" /> Suspicious Activity Audit
                </h3>
                <div style={{ fontSize: '0.7rem', background: '#ef444415', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                    {Object.keys(fraudAlerts).length} ANOMALIES
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {Object.keys(fraudAlerts).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        <UnifiedIcon name="TickCircle" size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                        <div style={{ fontSize: '0.8rem' }}>No fraud signals detected. System is clean.</div>
                    </div>
                ) : Object.entries(fraudAlerts).map(([id, flags]) => (
                    <div key={id} style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>Admission ID: {id}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                {flags.map(f => <FraudBadge key={f} flag={f} />)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', fontSize: '1rem' }}>Platform Financial Health</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> <span style={{ color: 'var(--text-secondary)' }}>Revenue (Approved)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> <span style={{ color: 'var(--text-secondary)' }}>Payout (Paid)</span>
              </div>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                <Area type="monotone" dataKey="payout" stroke="#ef4444" fillOpacity={0} strokeWidth={2} strokeDasharray="6 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Top Performers Section */}
      <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1.5rem' }}>Top Revenue Generators</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>Network Participant</th><th>System ID</th><th>Total Earned</th><th>Status</th></tr>
            </thead>
            <tbody>
              {topEarners.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No data available.</td></tr>
              ) : (
                topEarners.map((user, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.full_name}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{user.system_id}</td>
                    <td style={{ color: '#10b981', fontWeight: '800' }}>₹{Number(user.total_earned || 0).toLocaleString()}</td>
                    <td><span className="badge badge-approved">HEALTHY</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
