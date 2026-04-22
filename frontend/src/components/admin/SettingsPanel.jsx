import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';
import UnifiedIcon from '../UnifiedIcon';

export default function SettingsPanel({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings', settings);
      toast.success('System settings updated successfully.');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UnifiedIcon name="Setting2" size={22} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontWeight: '800', fontFamily: 'Outfit' }}>Platform Configuration</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage reward rates, withdrawal limits, and override caps.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Rates */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>IC to INR Conversion Rate</label>
              <input 
                type="number" step="0.01" className="form-input" 
                value={settings.ic_conversion_rate || 1.0} 
                onChange={(e) => handleChange('ic_conversion_rate', e.target.value)}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>1 IC = ₹{settings.ic_conversion_rate || 1.0}</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Minimum Withdrawal (₹)</label>
              <input 
                type="number" className="form-input" 
                value={settings.min_withdrawal_amount || 300} 
                onChange={(e) => handleChange('min_withdrawal_amount', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Overrides */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Max Override Cap (₹)</label>
              <input 
                type="number" step="0.5" className="form-input" 
                value={settings.max_override_per_admission || 2.0} 
                onChange={(e) => handleChange('max_override_per_admission', e.target.value)}
              />
            </div>

            <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                 <div style={{ marginTop: '2px', display: 'flex' }}><UnifiedIcon name="InfoCircle" size={18} color="var(--primary)" /></div>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                   <strong>Override Hierarchy:</strong><br/>
                   Level 1 (Sponsor's Sponsor): {parseFloat(settings.override_percent_l1 || 0.01) * 100}%<br/>
                   Level 2 (L1's Parent): {parseFloat(settings.override_percent_l2 || 0.005) * 100}%
                 </p>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} disabled={loading}>
              <UnifiedIcon name="Save2" size={18} /> {loading ? 'Saving Changes...' : 'Save System Settings'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
