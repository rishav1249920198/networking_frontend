import React from 'react';
import UnifiedIcon from './UnifiedIcon';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ active, setActive }) => {
    const { logout } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Home',     icon: 'Category'   },
        { id: 'tree',      label: 'Tree',     icon: 'Diagram'    },
        { id: 'earnings',  label: 'Earn',     icon: 'WalletMoney'},
        { id: 'profile',   label: 'Profile',  icon: 'UserSquare' },
        { id: 'settings',  label: 'Settings', icon: 'Setting2'   },
    ];

    return (
        /* CSS class .bottom-nav is hidden on desktop via index.css media query */
        <div className="bottom-nav" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            gridTemplateColumns: `repeat(${navItems.length + 1}, 1fr)`,
            height: '70px',
            zIndex: 100,
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}>
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        color: active === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        transition: 'transform 0.2s',
                        transform: active === item.id ? 'scale(1.1) translateY(-2px)' : 'scale(1)'
                    }}>
                        <UnifiedIcon name={item.icon} size={22} color={active === item.id ? 'var(--accent)' : 'var(--text-secondary)'} />
                    </div>
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: active === item.id ? '800' : '500',
                        opacity: active === item.id ? 1 : 0.7
                    }}>
                        {item.label}
                    </span>
                </button>
            ))}

            {/* Logout Button */}
            <button
                onClick={logout}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    color: '#ef4444',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                }}
            >
                <UnifiedIcon name="Logout" size={22} color="#ef4444" />
                <span style={{ fontSize: '0.6rem', fontWeight: '500', opacity: 0.8 }}>Logout</span>
            </button>
        </div>
    );
};

export default BottomNav;
