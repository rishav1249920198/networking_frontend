import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Gift, Sparkles } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import ICIcon from './ICIcon';

export default function LoginCalendar({ isOpen, onClose, onCheckInSuccess }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Fetch last 7 days of history
      const res = await api.get('/users/check-in/history', {
        params: { days: 7 }
      });
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch check-in history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleCheckIn = async () => {
    try {
      setClaiming(true);
      const res = await api.post('/users/check-in');
      toast.success(res.data.message);
      onCheckInSuccess?.();
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setClaiming(false);
    }
  };

  // Build 7-day cycle (today + 6 previous days)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isTodayClaimed = history.includes(todayStr);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.push({
      dayName: dayNames[date.getDay()],
      dayNum: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      dateStr,
      isClaimed: history.includes(dateStr),
      isToday: i === 0,
      isPast: i > 0,
    });
  }

  // Count streak
  const claimedCount = days.filter(d => d.isClaimed).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-5 sm:p-6 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                }}
              >
                <Gift size={isMobile ? 18 : 20} />
              </div>
              <div>
                <h3 
                  className="font-outfit leading-tight"
                  style={{ 
                    fontSize: isMobile ? '1.05rem' : '1.15rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)' 
                  }}
                >
                  Daily Rewards
                </h3>
                <p style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--text-secondary)', 
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  marginTop: '1px'
                }}>
                  Earn ₹10 daily · 1 IC = ₹1
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="flex items-center justify-center transition-colors"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Streak Progress */}
          <div className="px-5 sm:px-6 pt-5" style={{ paddingBottom: '4px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em'
              }}>
                Weekly Progress
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
              }}>
                  {claimedCount}/7 days
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              borderRadius: '4px',
              background: 'var(--border)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(claimedCount / 7) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                style={{
                  height: '100%',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              />
            </div>
          </div>

          {/* 7-Day Grid */}
          <div className="px-5 sm:px-6 py-5">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: isMobile ? '6px' : '10px',
            }}>
              {days.map((d, i) => {
                const isClaimed = d.isClaimed;
                const isToday = d.isToday;
                const isMissed = d.isPast && !d.isClaimed;

                return (
                  <motion.div
                    key={d.dateStr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: isMobile ? '4px' : '6px',
                      padding: isMobile ? '8px 2px' : '12px 4px',
                      borderRadius: '14px',
                      border: isToday 
                        ? '2px solid var(--primary)' 
                        : '1px solid var(--border)',
                      background: isClaimed
                        ? 'var(--primary)'
                        : isToday
                          ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                          : 'transparent',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      cursor: isToday && !isClaimed ? 'pointer' : 'default',
                      opacity: isMissed ? 0.45 : 1,
                    }}
                  >
                    {/* Day name */}
                    <span style={{
                      fontSize: isMobile ? '0.6rem' : '0.68rem',
                      fontWeight: 600,
                      color: isClaimed ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                      {d.dayName}
                    </span>

                    {/* Day number / icon */}
                    <div style={{
                      width: isMobile ? '30px' : '36px',
                      height: isMobile ? '30px' : '36px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isClaimed 
                        ? 'rgba(255,255,255,0.2)' 
                        : isToday
                          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                          : 'var(--border)',
                      transition: 'all 0.2s ease',
                    }}>
                      {isClaimed ? (
                        <CheckCircle 
                          size={isMobile ? 14 : 16} 
                          strokeWidth={2.5} 
                          color="white" 
                        />
                      ) : (
                        <span style={{
                          fontSize: isMobile ? '0.78rem' : '0.85rem',
                          fontWeight: 700,
                          color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                          {d.dayNum}
                        </span>
                      )}
                    </div>

                    {/* Reward label */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}>
                      <span style={{
                        fontSize: isMobile ? '0.58rem' : '0.65rem',
                        fontWeight: 600,
                        color: isClaimed ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)',
                        opacity: isMissed ? 0.7 : 1,
                      }}>
                        ₹10
                      </span>
                    </div>

                    {/* Today indicator dot */}
                    {isToday && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isClaimed ? 'rgba(255,255,255,0.8)' : 'var(--primary)',
                      }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Claim Section */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <div style={{
              padding: '16px 20px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              background: 'color-mix(in srgb, var(--primary) 4%, var(--bg-card))',
              display: 'flex',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '14px',
            }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'color-mix(in srgb, var(--gold) 15%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold)',
                  flexShrink: 0,
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    ₹10 <ICIcon size={16} /> Today's Reward
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    marginTop: '1px',
                  }}>
                    {isTodayClaimed ? 'Reward claimed for today' : 'Log in daily to earn rewards'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckIn}
                disabled={isTodayClaimed || claiming}
                style={{
                  height: '42px',
                  padding: '0 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  fontFamily: "'Outfit', sans-serif",
                  cursor: isTodayClaimed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                  ...(isTodayClaimed ? {
                    background: 'color-mix(in srgb, var(--success) 12%, transparent)',
                    color: 'var(--success)',
                  } : {
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: 'white',
                    boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)',
                  }),
                  ...(claiming ? { opacity: 0.6, pointerEvents: 'none' } : {}),
                }}
                onMouseEnter={e => {
                  if (!isTodayClaimed) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--primary) 40%, transparent)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!isTodayClaimed) {
                    e.currentTarget.style.boxShadow = '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)';
                  }
                }}
              >
                {claiming ? 'Processing...' : isTodayClaimed ? (
                  <>Claimed <CheckCircle size={15} strokeWidth={2.5} /></>
                ) : 'Claim Reward'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            textAlign: 'center',
            borderTop: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--primary) 3%, transparent)',
          }}>
            <p style={{
              fontSize: '0.68rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              letterSpacing: '0.03em',
            }}>
              Login daily · 1 IC = ₹1 · Earn ₹70/week
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
