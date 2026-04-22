import React from 'react';
import UnifiedIcon from './UnifiedIcon';

const BottomNav = ({ active, setActive }) => {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: 'Category' },
        { id: 'tree', label: 'Tree', icon: 'Diagram' },
        { id: 'earnings', label: 'Earn', icon: 'WalletMoney' },
        { id: 'profile', label: 'Profile', icon: 'UserSquare' },
        { id: 'settings', label: 'More', icon: 'Setting2' }
    ];

    return (
        <div className="bottom-nav lg:hidden" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
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
                        fontSize: '0.65rem', 
                        fontWeight: active === item.id ? '800' : '500',
                        opacity: active === item.id ? 1 : 0.7
                    }}>
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default BottomNav;
