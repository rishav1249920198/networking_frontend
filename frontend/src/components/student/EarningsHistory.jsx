import React from 'react';
import { formatIC } from '../../utils/conversionUtils';
import UnifiedIcon from '../UnifiedIcon';

const TypeIcon = ({ type }) => {
  if (type.includes('direct')) return <UnifiedIcon name="UserAdd" size={16} color="#3b82f6" />;
  if (type.includes('override')) return <UnifiedIcon name="Graph" size={16} color="#8b5cf6" />;
  if (type.includes('bonus') || type.includes('checkin') || type.includes('profile')) return <UnifiedIcon name="Gift" size={16} color="#f59e0b" />;
  return <UnifiedIcon name="InfoCircle" size={16} color="#64748b" />;
};

const getTypeName = (type, level) => {
    if (type === 'direct') return 'Direct Referral';
    if (type.startsWith('override_l')) return `L${level} Override`;
    if (type === 'daily_checkin') return 'Daily Login Reward';
    if (type === 'registration_bonus') return 'Welcome Bonus';
    if (type === 'profile_completion_bonus') return 'Profile Completion';
    if (type === 'referral_activation_bonus') return 'Referral Activation';
    return type.replace(/_/g, ' ');
};

export default function EarningsHistory({ data = [], page, totalPages, onPageChange }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
        <h3 className="font-outfit font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Transaction Ledger</h3>
        <div style={{ padding: '0.4rem 0.8rem', background: 'var(--bg)', borderRadius: '10px', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Real-time Audit
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th className="px-6 py-4 text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">Type / Source</th>
              <th className="px-6 py-4 text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4 text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <UnifiedIcon name="StatusUp" size={32} style={{ opacity: 0.2 }} />
                    <p className="text-sm font-medium">No activity yet. Share your code to earn!</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <TypeIcon type={tx.type} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm" style={{ color: 'var(--text-primary)' }}>{getTypeName(tx.type, tx.level)}</div>
                        <div className="text-[0.65rem] text-slate-500 flex items-center gap-1 font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
                           {tx.source_admission_id ? `Source Adm ID: ${tx.source_admission_id}` : tx.note || 'Engagement Bonus'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-sm text-emerald-600">+{formatIC(tx.points)} IC</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-500" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', background: 'var(--bg)' }}>
            <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="btn-secondary" style={{ padding: '0.4rem', background: 'white' }}><UnifiedIcon name="ArrowLeft2" size={16} /></button>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PAGE {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="btn-secondary" style={{ padding: '0.4rem', background: 'white' }}><UnifiedIcon name="ArrowRight3" size={16} /></button>
        </div>
      )}
    </div>
  );
}
