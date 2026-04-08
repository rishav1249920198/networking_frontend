import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellDot, Check, Clock, UserPlus, IndianRupee, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = ({ scope = 'student' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications?scope=${scope}`);
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.patch(`/notifications/read?scope=${scope}`);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      handleMarkAsRead();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'referral': return <UserPlus size={16} color="#00B4D8" />;
      case 'commission_credit': return <IndianRupee size={16} color="#10b981" />;
      case 'admission_request': return <Clock size={16} color="#f59e0b" />;
      case 'admission_update': return <Check size={16} color="#10b981" />;
      case 'withdrawal_request': return <Wallet size={16} color="#f59e0b" />;
      case 'withdrawal_update': return <Wallet size={16} color="#10b981" />;
      default: return <Bell size={16} color="#0A2463" />;
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
        onClick={toggleDropdown}
        style={{ 
          background: 'white', 
          border: '1px solid rgba(10,36,99,0.1)', 
          borderRadius: '10px', 
          width: '40px', 
          height: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          color: '#0A2463'
        }}
      >
        {unreadCount > 0 ? <BellDot size={20} color="#ef4444" /> : <Bell size={20} />}
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '-5px', 
            right: '-5px', 
            background: '#ef4444', 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: '800', 
            padding: '2px 5px', 
            borderRadius: '20px',
            border: '2px solid white'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              background: 'var(--bg-card)'
            }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700' }}>Notifications</h4>
              {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{unreadCount} new</span>}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '0.875rem 1rem', 
                      borderBottom: '1px solid var(--border)',
                      background: n.is_read ? 'transparent' : 'rgba(0,180,216,0.03)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    className="notification-item"
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(0,180,216,0.03)'}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: '#f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getIcon(n.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{n.title}</span>
                          {!n.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', marginTop: '5px' }}></div>}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem 0', lineHeight: '1.4' }}>{n.message}</p>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{safeFormatDistance(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#00B4D8', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Close</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
