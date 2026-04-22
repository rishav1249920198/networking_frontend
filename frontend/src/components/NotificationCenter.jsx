import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedIcon from './UnifiedIcon';

import './NotificationCenter.css';

export default function NotificationCenter({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllRead, onClearAll }) {
  const getIcon = (type) => {
    switch (type) {
      case 'commission': return <UnifiedIcon name="Wallet" size={16} />;
      case 'withdrawal': return <UnifiedIcon name="TickCircle" size={16} />;
      case 'system': return <UnifiedIcon name="InfoCircle" size={16} />;
      default: return <UnifiedIcon name="Notification" size={16} />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'commission': return '#10b981';
      case 'withdrawal': return '#3b82f6';
      case 'system': return '#f59e0b';
      default: return 'var(--primary)';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="notif-overlay"
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="notif-drawer"
          >
            <div className="notif-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="notif-bell-icon" style={{ display: 'flex' }}>
                  <UnifiedIcon name="Notification" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Notifications</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {notifications.filter(n => !n.is_read).length} unread messages
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="notif-close-btn" style={{ display: 'flex' }}>
                <UnifiedIcon name="CloseCircle" size={20} />
              </button>
            </div>

            <div className="notif-actions">
              <button onClick={onMarkAllRead} className="notif-action-btn">Mark all read</button>
              <button onClick={onClearAll} className="notif-action-btn clear">Clear all</button>
            </div>

            <div className="notif-body">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                    <UnifiedIcon name="Notification" size={40} />
                  </div>
                  <p>All caught up!</p>
                  <span>Your notifications will appear here</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div 
                    layout
                    key={notif.id} 
                    className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                    onClick={() => !notif.is_read && onMarkAsRead(notif.id)}
                  >
                    <div className="notif-content-wrapper">
                      <div className="notif-icon" style={{ borderColor: getStatusColor(notif.type) }}>
                         {getIcon(notif.type)}
                      </div>
                      <div className="notif-text">
                        <div className="notif-item-title">{notif.title}</div>
                        <div className="notif-item-msg">{notif.message}</div>
                        <div className="notif-item-time">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    {!notif.is_read && <div className="notif-unread-dot" />}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

