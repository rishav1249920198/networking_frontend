import { useTheme } from '../../context/ThemeContext';

const SettingsPanel = ({ activeTab: initialTab = 'security' }) => {
    const { theme: currentTheme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        upiId: '',
        bankName: '',
        accNumber: '',
        ifscCode: '',
        notifications: { financial: true, system: true, marketing: false },
        theme: currentTheme
    });

    const tabs = [
        { id: 'security', label: 'Security', icon: 'Lock' },
        { id: 'notifications', label: 'Notifications', icon: 'Notification' },
        { id: 'wallet', label: 'Wallet', icon: 'Wallet' },
        { id: 'appearance', label: 'Appearance', icon: 'Bag' },
        { id: 'account', label: 'Account', icon: 'UserSquare' }
    ];

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await api.post('/users/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success('Password updated successfully');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async (settings) => {
        try {
            await api.patch('/users/notifications', { settings });
            setFormData({ ...formData, notifications: { ...formData.notifications, ...settings } });
            toast.success('Preferences saved');
        } catch (err) {
            toast.error('Failed to save preferences');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmText = "DELETE";
        const userInput = prompt(`To confirm deletion, type "${confirmText}". All balance will be lost.`);
        
        if (userInput === confirmText) {
            setLoading(true);
            try {
                await api.delete('/users/account');
                toast.success('Account scheduled for deletion');
                window.location.reload();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Deletion failed. Check your balance.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', minHeight: '500px' }} className="settings-container">
            {/* Settings Sidebar */}
            <div style={{ width: '220px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px',
                                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s', textAlign: 'left'
                            }}>
                            <UnifiedIcon name={tab.icon} size={20} color={activeTab === tab.id ? 'white' : 'var(--text-secondary)'} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings Content */}
            <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'security' && (
                        <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Security Settings</h3>
                            <form onSubmit={handlePasswordChange} style={{ maxWidth: '400px' }}>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="form-input" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label">New Password</label>
                                    <input type="password" placeholder="Min. 8 characters" className="form-input" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Confirm New Password</label>
                                    <input type="password" placeholder="Confirm" className="form-input" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                                    {loading ? <div className="spinner-sm"></div> : 'Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Notification Preferences</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    { id: 'financial', label: 'Financial Alerts', desc: 'Earnings, withdrawals, and bonus credits', defaultIcon: 'WalletMoney' },
                                    { id: 'system', label: 'System Updates', desc: 'New features and security alerts', defaultIcon: 'Setting2' },
                                    { id: 'marketing', label: 'Special Offers', desc: 'Announcements and reward opportunities', defaultIcon: 'PresentionChart' }
                                ].map(cat => (
                                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderRadius: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                                <UnifiedIcon name={cat.defaultIcon} size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{cat.label}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cat.desc}</div>
                                            </div>
                                        </div>
                                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                            <input type="checkbox" checked={formData.notifications[cat.id]} onChange={e => handleNotificationUpdate({ [cat.id]: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span style={{ 
                                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                                                backgroundColor: formData.notifications[cat.id] ? '#10b981' : '#ccc', borderRadius: '34px', transition: '.4s' 
                                            }}>
                                                <span style={{ 
                                                    position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px', 
                                                    backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                                                    transform: formData.notifications[cat.id] ? 'translateX(20px)' : 'translateX(0)'
                                                }}></span>
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'wallet' && (
                        <motion.div key="wallet" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Wallet Configuration</h3>
                                <button 
                                    onClick={() => setFormData(prev => ({ ...prev, showFull: !prev.showFull }))}
                                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                                >
                                    <UnifiedIcon name={formData.showFull ? "EyeSlash" : "Eye"} size={16} /> 
                                    {formData.showFull ? "Mask Details" : "Show Full Details"}
                                </button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>Set your preferred payout methods. Data is masked for your safety.</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <UnifiedIcon name="Flash" size={20} color="#3b82f6" />
                                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>UPI Payout</span>
                                    </div>
                                    <div className="form-group">
                                        <input 
                                            placeholder="Enter UPI ID (e.g. user@oksbi)" 
                                            className="form-input" 
                                            type={formData.showFull ? "text" : "password"}
                                            value={formData.upiId} 
                                            onChange={e => setFormData({...formData, upiId: e.target.value})} 
                                        />
                                        {!formData.showFull && formData.upiId && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>ID is currently masked</div>}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <UnifiedIcon name="Bank" size={20} color="#6366f1" />
                                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Bank Transfer (Optional)</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input placeholder="Account Name" className="form-input" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                                        <input 
                                            placeholder="Account Number" 
                                            className="form-input" 
                                            type={formData.showFull ? "text" : "password"}
                                            value={formData.accNumber} 
                                            onChange={e => setFormData({...formData, accNumber: e.target.value})} 
                                        />
                                        <input placeholder="IFSC Code" className="form-input" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} />
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ justifySelf: 'start', padding: '0.75rem 2.5rem' }}>Save Wallet Details</button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Appearance & Themes</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[
                                    { id: 'light', label: 'Light Mode', icon: 'Sun' },
                                    { id: 'dark', label: 'Dark Mode', icon: 'Moon' },
                                    { id: 'system', label: 'System', icon: 'Monitor' }
                                ].map(theme => (
                                    <button key={theme.id} onClick={() => { setTheme(theme.id); setFormData({...formData, theme: theme.id}); }}
                                        style={{ 
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 1rem', borderRadius: '16px',
                                            background: currentTheme === theme.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg)',
                                            border: `2px solid ${currentTheme === theme.id ? '#3b82f6' : 'var(--border)'}`,
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                        <UnifiedIcon name={theme.id === 'light' ? 'Sun' : theme.id === 'dark' ? 'Moon' : 'Monitor'} size={32} color={currentTheme === theme.id ? '#3b82f6' : 'var(--text-secondary)'} />
                                        <span style={{ fontWeight: '700', color: currentTheme === theme.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>{theme.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'account' && (
                        <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Account Management</h3>
                            <div style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <UnifiedIcon name="Danger" size={24} color="#ef4444" />
                                    <div>
                                        <h4 style={{ fontWeight: '800', color: '#ef4444' }}>Danger Zone</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>These actions are permanent and cannot be undone.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    <button className="btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.75rem 1.5rem' }}>Deactivate Temporarily</button>
                                    <button onClick={handleDeleteAccount} disabled={loading} className="btn-primary" style={{ background: '#ef4444', border: 'none', padding: '0.75rem 1.5rem' }}>
                                        {loading ? 'Processing...' : 'Delete My Account Forever'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SettingsPanel;
