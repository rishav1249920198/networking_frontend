import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, X, ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import ICIcon from './ICIcon';

export default function LoginCalendar({ isOpen, onClose, onCheckInSuccess }) {
  const [history, setHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/check-in/history', {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
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
  }, [isOpen, currentDate]);

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

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayClaimed = history.includes(todayStr);

  const days = [];
  // Add empty slots for first day padding
    days.push({
      day: i,
      dateStr,
      isClaimed: history.includes(dateStr),
      isToday: dateStr === todayStr,
      isPast: date < new Date(todayStr),
      isFuture: date > new Date(todayStr)
    });
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md overflow-hidden rounded-[24px] shadow-2xl border border-white/10"
          style={{ background: 'var(--bg-card)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-gold/20">
                <Gift size={24} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold font-outfit text-primary tracking-tight" style={{ color: 'var(--text-primary)' }}>Daily Rewards</h3>
                <p className="text-sm text-text-secondary font-medium">Claim your daily 10 IC coins</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-danger/10 hover:text-danger rounded-xl transition-all text-text-secondary">
              <X size={22} />
            </button>
          </div>

          {/* Calendar Body */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 rounded-xl transition-all text-primary">
                <ChevronLeft size={24} />
              </button>
              <h4 className="font-extrabold text-xl font-outfit text-primary" style={{ color: 'var(--text-primary)' }}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 rounded-xl transition-all text-primary">
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2.5 mb-8">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[11px] font-black text-text-secondary/60 text-center uppercase tracking-widest">{d}</div>
              ))}
              
              {days.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
                
                let stateClass = "border-transparent bg-bg/50";
                let iconColor = "text-text-secondary/30";
                
                if (d.isClaimed) {
                  stateClass = "bg-success text-white border-success shadow-lg shadow-success/20";
                } else if (d.isToday) {
                  stateClass = "border-primary bg-primary/5 pulse-glow ring-2 ring-primary/20 scale-105 z-10";
                  iconColor = "text-primary animate-pulse";
                } else if (d.isPast) {
                  stateClass = "bg-danger/5 border-danger/10 grayscale opacity-60";
                  iconColor = "text-danger/40";
                } else if (d.isFuture) {
                  stateClass = "bg-border/10 border-border/5 opacity-30 cursor-not-allowed";
                  iconColor = "text-text-secondary/20";
                }

                return (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    <div 
                      className={`
                        w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all duration-300
                        ${stateClass}
                      `}
                    >
                      <span className={`text-xs font-black ${d.isClaimed ? 'text-white' : 'text-text-primary'}`}>{d.day}</span>
                      {d.isClaimed ? (
                        <CheckCircle size={14} strokeWidth={3} />
                      ) : (
                        <div className={iconColor}><ICIcon size={12} /></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Claim Section - HIGHLIGHTED */}
            <div className="relative group p-1 rounded-[26px] bg-gradient-to-r from-primary to-accent overflow-hidden shadow-xl shadow-primary/20">
              <div className="bg-bg-card rounded-[24px] p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold relative">
                    <Sparkles size={28} className="animate-pulse" />
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-gold"></span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-black font-outfit text-primary flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      10 <ICIcon size={18} /> Available
                    </div>
                    <div className="text-xs font-bold text-text-secondary">Claim today's login reward</div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckIn}
                  disabled={isTodayClaimed || claiming}
                  className={`
                    h-14 px-8 rounded-2xl font-black font-outfit text-base transition-all shadow-xl active:scale-95
                    ${isTodayClaimed 
                      ? 'bg-success/20 text-success cursor-default border-2 border-success/30' 
                      : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:scale-105 active:scale-95 hover:shadow-primary/40 ring-4 ring-primary/20'}
                    ${claiming ? 'opacity-70 pointer-events-none' : ''}
                  `}
                >
                  {claiming ? 'Processing...' : isTodayClaimed ? 'Claimed ✓' : 'CLAIM NOW'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 text-center border-t border-white/5 bg-primary/5">
            <p className="text-[11px] font-black text-text-secondary/60 uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Login daily to grow your balance
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
