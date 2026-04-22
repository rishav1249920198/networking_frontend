import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { formatDistanceToNow } from 'date-fns';
import ICIcon from './ICIcon';
import UnifiedIcon from './UnifiedIcon';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const dropdownRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (document.visibilityState !== 'visible') return;
    if (showLoading) setLoading(true);
    setError(false);
    try {
      const res = await api.get('/notifications?limit=50');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(true);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Smart Polling
  useEffect(() => {
    fetchNotifications(true);
    
    const startPolling = () => {
      pollingRef.current = setInterval(() => fetchNotifications(), 30000);
    };
    
    const stopPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkOneAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'admission_approved': return <UnifiedIcon name="TickCircle" size={16} color="#10b981" />;
      case 'points_earned': return <ICIcon size={16} />;
      case 'override_l1': 
      case 'override_l2': return <UnifiedIcon name="Graph" size={16} color="#f59e0b" />;
      case 'withdrawal_requested': return <UnifiedIcon name="Timer" size={16} color="#ef4444" />;
      case 'withdrawal_approved': return <UnifiedIcon name="Wallet" size={16} color="#10b981" />;
      case 'withdrawal_paid': return <UnifiedIcon name="WalletCheck" size={16} color="#3b82f6" />;
      case 'placement_success': return <UnifiedIcon name="Link" size={16} color="#00B4D8" />;
      case 'placement_failed': return <UnifiedIcon name="Link" size={16} color="#ef4444" />;
      case 'referral': return <UnifiedIcon name="UserAdd" size={16} color="#00B4D8" />;
      case 'withdrawal': return <UnifiedIcon name="TickCircle" size={16} color="#10b981" />;
      default: return <UnifiedIcon name="Notification" size={16} color="var(--text-secondary)" />;
    }
  };

  const safeFormatDistance = (dateStr) => {
    try {
      if (!dateStr) return 'some time ago';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'some time ago';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  return (
    <div className="notification-bell-container" style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card"
        style={{ 
          width: '38px', height: '38px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
          background: 'var(--bg-card)', border: '1px solid var(--border)'
        }}
      >
        {unreadCount > 0 ? <UnifiedIcon name="NotificationStatus" size={20} color="#ef4444" /> : <UnifiedIcon name="Notification" size={20} color="var(--text-primary)" />}
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: '-4px', right: '-4px', 
            background: '#ef4444', color: 'white', 
            fontSize: '9px', fontWeight: '800', 
            padding: '2px 5px', borderRadius: '20px',
            border: '2px solid var(--bg-card)',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '0.75rem',
              width: 'min(90vw, 360px)', maxHeight: '480px',
              background: 'var(--bg-card)', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
              zIndex: 1000, display: 'flex', flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'Outfit' }}>Notifications</h4>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1, minHeight: '120px' }}>
              {error ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Failed to load notifications</p>
                  <button onClick={() => fetchNotifications(true)} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.4rem', display: 'inline-flex', alignItems: 'center' }}>
                    <UnifiedIcon name="Refresh" size={14} /> Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                 <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <UnifiedIcon name="Notification" size={24} style={{ opacity: 0.3 }} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>No notifications yet</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }}>We'll notify you about earnings and network updates.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleMarkOneAsRead(n.id, n.read)}
                    style={{ 
                      padding: '1rem', 
                      borderBottom: '1px solid var(--border)',
                      background: n.read ? 'transparent' : 'rgba(0,180,216,0.03)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--accent)' }} />}
                    <div style={{ display: 'flex', gap: '0.875rem' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', 
                        background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: '1px solid var(--border)'
                      }}>
                        {getIcon(n.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          fontSize: '0.825rem', color: 'var(--text-primary)', 
                          margin: '0 0 0.25rem 0', lineHeight: '1.4',
                          fontWeight: n.read ? '400' : '600'
                        }}>{n.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <UnifiedIcon name="Timer" size={10} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{safeFormatDistance(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
