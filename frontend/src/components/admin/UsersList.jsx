import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UnifiedIcon from '../UnifiedIcon';

export default function UsersList({ users, onPromote, onDemote, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.system_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Platform Users</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Manage roles, account status, and network insights</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
              <UnifiedIcon name="SearchNormal" size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', borderRadius: '12px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={async () => {
                try {
                  const api = (await import('../../api/client')).default;
                  const response = await api.get('/admin/export/users', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'igcim_users.csv');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  console.error('Export failed');
                }
            }}
            className="btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <UnifiedIcon name="DocumentDownload" size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>USER ID</th>
              <th>NAME</th>
              <th>STATS (L/R)</th>
              <th>TOTAL EARNED</th>
              <th>ROLE</th>
              <th>JOINED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{u.system_id}</td>
                <td>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{u.full_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>L: {u.left_count || 0}</span>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>R: {u.right_count || 0}</span>
                  </div>
                </td>
                <td style={{ fontWeight: '700' }}>₹{parseFloat(u.total_earned || 0).toLocaleString()}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>{u.role}</span></td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.role === 'student' ? (
                    <button onClick={() => onPromote(u.id, 'admin')} className="btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} title="Promote to Admin">
                      <UnifiedIcon name="ArrowUp" size={14} />
                    </button>
                  ) : (
                    u.role !== 'super_admin' && (
                      <button onClick={() => onDemote(u.id, 'student')} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} title="Demote to Student">
                        <UnifiedIcon name="ArrowDown" size={14} />
                      </button>
                    )
                  )}
                  {u.role !== 'super_admin' && (
                    <button onClick={() => onDelete(u.id, u.full_name)} className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', marginLeft: '0.4rem' }}>
                      <UnifiedIcon name="Trash" size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
