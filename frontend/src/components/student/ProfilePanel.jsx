import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedIcon from '../UnifiedIcon';
import api from '../../api/client';
import toast from 'react-hot-toast';

const ProfilePanel = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            if (res.data.success) {
                setProfile(res.data.data);
                setFormData(res.data.data);
            }
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('/users/profile', formData);
            if (res.data.success) {
                toast.success('Profile updated!');
                setProfile(res.data.data);
                setEditing(false);
                if (res.data.bonus_granted) {
                    toast.success('100% Complete! Reward Claimed 🎁', { icon: '🎉', duration: 5000 });
                }
            }
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="spinner m-auto"></div></div>;

    const completeness = profile?.profile_completeness || 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }} className="profile-grid">
            <div className="profile-main">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                    style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Background Accent */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent)', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white', border: '4px solid var(--bg-card)', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                            {profile?.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{profile?.full_name}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{profile?.system_id} • Registered {new Date(profile?.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setEditing(!editing)} style={{ marginLeft: 'auto', background: 'rgba(59, 130, 246, 0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '12px', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UnifiedIcon name={editing ? "CloseCircle" : "Edit"} size={18} /> {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {!editing ? (
                            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    <div className="info-item">
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{profile?.email}</div>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>Mobile Number</label>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{profile?.mobile}</div>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>WhatsApp</label>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{profile?.whatsapp_number || 'Not provided'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>Education</label>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{profile?.education || 'Not provided'}</div>
                                    </div>
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>Bio / About</label>
                                        <div style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{profile?.bio || 'No bio added yet.'}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">WhatsApp Number</label>
                                        <input className="form-input" value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Education</label>
                                        <input className="form-input" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date of Birth</label>
                                        <input type="date" className="form-input" value={formData.dob?.split('T')[0]} onChange={e => setFormData({...formData, dob: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Address</label>
                                        <textarea className="form-input" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-input" rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
                                    </div>
                                </div>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: '2rem', width: '200px' }}>
                                    {saving ? <div className="spinner-sm"></div> : 'Save Changes'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <div className="profile-side" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Completeness Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem' }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="3" />
                            <motion.path initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: `${completeness}, 100` }} transition={{ duration: 1, ease: "easeOut" }}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                            {completeness}%
                        </div>
                    </div>
                    <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Profile Completeness</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {completeness < 100 ? 'Complete your profile to unlock a special reward bonus!' : 'Great job! Your profile is fully optimized.'}
                    </p>
                </motion.div>

                {/* Quick Stats Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Account Status</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: '800' }}>ACTIVE</span>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Verified</span>
                            <UnifiedIcon name="TickCircle" size={16} color="#10b981" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Wallet Protected</span>
                            <UnifiedIcon name="Lock" size={16} color="#3b82f6" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePanel;
