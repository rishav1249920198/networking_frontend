import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import api from '../api/client';
import toast from 'react-hot-toast';
import ICIcon from './ICIcon';
import UnifiedIcon from './UnifiedIcon';

export default function LoginCalendar({ isOpen, onClose, onCheckInSuccess }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  const cycleRewards = [0.002, 0.002, 0.003, 0.003, 0.004, 0.004, 0.01];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/check-in/history', { params: { days: 7 } });
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch check-in history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) { fetchHistory(); }
  }, [isOpen]);

  const handleCheckIn = async () => {
    try {
      setClaiming(true);
      const res = await api.post('/users/check-in');
      toast.success(res.data.message);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      onCheckInSuccess?.();
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setClaiming(false);
    }
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isTodayClaimed = history.includes(todayStr);

  // Build 7-day visual cycle
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.push({
      dayName: dayNames[date.getDay()],
      dayNum: date.getDate(),
      dateStr,
      isClaimed: history.includes(dateStr),
      isToday: i === 0,
      reward: cycleRewards[6 - i] // Approximated index for display
    });
  }

  const claimedCount = days.filter(d => d.isClaimed).length;
  const currentReward = cycleRewards[(history.length % 7)];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, pointerEvents: 'none' }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />
        </div>
      )}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="w-full max-w-lg overflow-hidden"
          style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                <UnifiedIcon lib="lordicon" name="nocovwne" size={24} color="white" trigger="hover" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>Daily Rewards</h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Earn progressive IC for daily logins</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <UnifiedIcon name="Add" size={24} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>

          {/* 7-Day Grid */}
          <div className="p-5 sm:p-6">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {days.map((d, i) => (
                <div key={d.dateStr} style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: '12px',
                  border: d.isToday ? '2px solid #f59e0b' : '1px solid var(--border)',
                  background: d.isClaimed ? '#f59e0b' : d.isToday ? '#f59e0b10' : 'transparent',
                  opacity: d.isPast && !d.isClaimed ? 0.5 : 1
                }}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, color: d.isClaimed ? 'white' : 'var(--text-secondary)', textTransform: 'uppercase' }}>{d.dayName}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: d.isClaimed ? 'rgba(255,255,255,0.2)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {d.isClaimed ? <UnifiedIcon lib="lordicon" name="lupuorrc" size={20} color="white" trigger="hover" /> : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: d.isToday ? '#f59e0b' : 'var(--text-secondary)' }}>{d.dayNum}</span>}
                  </div>
                  <span style={{ fontSize: '0.5rem', fontWeight: 700, color: d.isClaimed ? 'white' : 'var(--accent)' }}>{d.reward}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Section */}
          <div className="px-5 sm:px-6 pb-6">
              <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f59e0b15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                        <UnifiedIcon lib="lordicon" name="qhvikruu" size={24} color="#f59e0b" trigger="hover" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{currentReward} IC Reward</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isTodayClaimed ? 'Claimed for today' : 'Progressive reward active'}</div>
                    </div>
                </div>
                <button onClick={handleCheckIn} disabled={isTodayClaimed || claiming} className={`btn-primary ${isTodayClaimed ? 'disabled' : ''}`} style={{ background: isTodayClaimed ? 'var(--success)15' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: isTodayClaimed ? 'var(--success)' : 'white', border: 'none', padding: '0.6rem 1rem', fontSize: '0.75rem', fontWeight: 800 }}>
                    {claiming ? '...' : isTodayClaimed ? 'Claimed' : 'Claim Now'}
                </button>
             </div>
          </div>

          <div style={{ padding: '12px', textAlign: 'center', background: '#f59e0b05', borderTop: '1px solid var(--border)' }}>
             <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Login 7 days in a row for the 0.01 IC Mega Bonus! <UnifiedIcon lib="lordicon" name="msetqbtz" size={14} color="#f59e0b" trigger="loop" /></p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
