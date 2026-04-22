import React from 'react';
import { formatIC } from '../../utils/conversionUtils';
import UnifiedIcon from '../UnifiedIcon';

const StatCard = ({ label, value, subtext, icon, color, trend }) => (
  <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px', background: `${color}05`, borderRadius: '50%' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UnifiedIcon name={icon} size={18} color={color} />
        </div>
        {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem', fontWeight: '800', color: trend >= 0 ? '#10b981' : '#ef4444' }}>
                <UnifiedIcon name={trend >= 0 ? 'ArrowUp' : 'ArrowDown'} size={14} color={trend >= 0 ? '#10b981' : '#ef4444'} />
                {Math.abs(trend).toFixed(1)}%
            </div>
        )}
    </div>
    <div>
      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'Outfit', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</div>
      {subtext && <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '600', marginTop: '0.1rem' }}>{subtext}</div>}
    </div>
  </div>
);

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <StatCard 
        label="Wallet Balance" 
        value={`${formatIC(stats.totalPoints)} IC`} 
        icon="Card" color="#3b82f6" 
      />
      <StatCard 
        label="Boost Status" 
        value={`Level ${stats.boost_level || 0}`} 
        subtext={`${stats.directCount || 0} / 6 Referrals`}
        icon="Flash" color="#f59e0b" 
      />
      <StatCard 
        label="Lifetime Earnings" 
        value={`${formatIC(stats.totalEarningsPoints)} IC`} 
        icon="Award" color="#10b981" 
      />
      <StatCard 
        label="Weekly Income" 
        value={`${formatIC(stats.weeklyPoints)} IC`} 
        icon="Graph" color="#6366f1"
        trend={stats.weeklyChangePercent}
      />
      <StatCard 
        label="Withdrawable" 
        value={`${formatIC(stats.withdrawablePoints)} IC`} 
        icon="WalletMoney" color="#00B4D8" 
      />
    </div>
  );
}
