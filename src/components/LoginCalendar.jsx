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
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      day: i,
      dateStr,
      isClaimed: history.includes(dateStr),
      isToday: dateStr === todayStr,
      isFuture: date > new Date()
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-md overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Daily Rewards</h3>
                <p className="text-sm text-text-secondary">Claim your daily login bonus</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-lg transition-colors">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Calendar Body */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-bg rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h4 className="font-bold text-lg">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button onClick={nextMonth} className="p-2 hover:bg-bg rounded-full transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-xs font-bold text-text-secondary uppercase">{d}</div>
              ))}
              
              {days.map((d, i) => (
                <div key={i} className="aspect-square flex items-center justify-center relative">
                  {!d ? (
                    <div className="w-full h-full" />
                  ) : (
                    <div 
                      className={`
                        w-full h-full rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all
                        ${d.isClaimed ? 'bg-success/10 border-success/30 text-success' : 
                          d.isToday ? 'bg-primary/5 border-primary pulse-glow' : 
                          'border-border hover:border-text-secondary/20'}
                        ${d.isFuture ? 'opacity-40 grayscale pointer-events-none' : ''}
                      `}
                    >
                      <span className="text-xs font-bold">{d.day}</span>
                      {d.isClaimed ? (
                        <CheckCircle size={14} className="text-success" />
                      ) : (
                        <div className="opacity-60"><ICIcon size={12} /></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Claim Section */}
            <div className="bg-bg rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">10 <ICIcon size={14} /> Available</div>
                  <div className="text-xs text-text-secondary">Today's login reward</div>
                </div>
              </div>
              
              <button
                onClick={handleCheckIn}
                disabled={isTodayClaimed || claiming}
                className={`
                  h-10 px-6 rounded-xl font-bold transition-all shadow-md active:scale-95
                  ${isTodayClaimed 
                    ? 'bg-success/20 text-success cursor-default' 
                    : 'bg-primary text-white hover:bg-primary-light pulse-glow'}
                  ${claiming ? 'opacity-70 pointer-events-none' : ''}
                `}
              >
                {claiming ? '...' : isTodayClaimed ? 'Claimed' : 'Claim now'}
              </button>
            </div>
          </div>

          <div className="p-4 text-center border-t border-border">
            <p className="text-xs text-text-secondary">Login every day to keep your streak alive!</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
