import React from 'react';
import { motion } from 'framer-motion';
import ICIcon from '../ICIcon';
import { toIC, formatIC } from '../../utils/conversionUtils';
import UnifiedIcon from '../UnifiedIcon';

export default function WithdrawalManager({ withdrawals, onUpdateStatus }) {
  const getStatusBadge = (status) => {
    if (status === 'paid') return <span className="badge badge-success">Paid</span>;
    if (status === 'rejected') return <span className="badge badge-error">Rejected</span>;
    return <span className="badge badge-pending">Pending</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
      <h3 style={{ fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <UnifiedIcon name="Wallet" size={20} color="var(--primary)" /> Financial Payouts Center
      </h3>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount (IC/₹)</th>
              <th>Payout Method</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No active payout requests.</td></tr>
            ) : withdrawals.map(w => (
              <tr key={w.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{w.student_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{w.student_system_id}</div>
                </td>
                <td>
                  <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ICIcon size={14} /> {formatIC(toIC(w.amount))} IC
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>≈ ₹{parseFloat(w.amount).toLocaleString()}</div>
                </td>


                <td style={{ fontSize: '0.75rem' }}>
                  {w.upi_id ? (
                    <div>UPI: <span style={{ fontFamily: 'monospace' }}>{w.upi_id}</span></div>
                  ) : (
                    <div>A/C: {w.bank_account}<br/>IFSC: {w.bank_ifsc}</div>
                  )}
                </td>
                <td>
                  {getStatusBadge(w.status)}
                  {w.status === 'paid' && w.payout_reference_id && (
                    <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '4px', fontWeight: '700' }}>
                      Ref: {w.payout_reference_id}
                    </div>
                  )}
                  {w.admin_notes && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '150px', fontStyle: 'italic' }}>
                      Note: {w.admin_notes}
                    </div>
                  )}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div>Requested: {new Date(w.created_at).toLocaleDateString()}</div>
                    {w.paid_at && <div style={{ color: '#10b981' }}>Paid: {new Date(w.paid_at).toLocaleDateString()}</div>}
                </td>

                <td>
                  {w.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'paid')} 
                        className="btn-success" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                      > Mark Paid </button>
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'rejected')} 
                        className="btn-danger" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                      > Reject </button>
                    </div>
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
