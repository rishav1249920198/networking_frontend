import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import ICIcon from './ICIcon';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ ic_conversion_rate: '1.0' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, settingsRes] = await Promise.all([
          api.get('/referrals/leaderboard'),
          api.get('/settings')
        ]);
        
        if (leaderboardRes.data.success) {
          setData(leaderboardRes.data.data);
        }
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return { bg: 'linear-gradient(135deg, #FFD700, #FDB931)', color: 'white', icon: <Trophy size={20} /> };
      case 2: return { bg: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', color: 'white', icon: <Medal size={20} /> };
      case 3: return { bg: 'linear-gradient(135deg, #CD7F32, #B87333)', color: 'white', icon: <Medal size={20} /> };
      default: return { bg: '#f1f5f9', color: '#64748b', icon: <span style={{ fontWeight: '800' }}>{rank}</span> };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spin" style={{ marginBottom: '1rem' }}><Star size={24} /></div>
        <p>Loading Champions...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <Trophy size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Referral Champions</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top earners this month</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem' }}>The race has just begun! Be the first to refer.</p>
        ) : data.map((item, index) => {
          const style = getRankStyle(item.rank);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: item.rank <= 3 ? 'var(--primary)10' : 'transparent',
                border: item.rank <= 3 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: style.bg, 
                color: style.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: item.rank <= 3 ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
              }}>
                {style.icon}
              </div>

              <div style={{ marginLeft: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={10} /> {item.total_referrals} Referrals
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ICIcon size={14} /> {parseFloat(item.total_earned / (settings.ic_conversion_rate || 1)).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>
                  Reward Points
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
          <Star size={12} style={{ color: '#FFD700', marginRight: '4px' }} />
          Invite your friends today and climb the ranks!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
