import React from 'react';
import { motion } from 'framer-motion';
import { toIC, formatIC } from '../../utils/conversionUtils';
import UnifiedIcon from '../UnifiedIcon';

const FraudBadge = ({ type }) => (
  <span style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '0.4rem', 
    padding: '0.2rem 0.5rem', 
    background: '#fee2e2', 
    color: '#991b1b', 
    borderRadius: '12px', 
    fontSize: '0.65rem', 
    fontWeight: '700',
    border: '1px solid #f87171'
  }}>
    <UnifiedIcon name="Danger" size={10} /> {type}
  </span>
);

export default function AdmissionsTable({ admissions, fraudAlerts = {}, onApprove, onReject }) {
  const getStatusStyle = (status) => {
    if (status === 'approved') return { background: '#dcfce7', color: '#166534' };
    if (status === 'rejected') return { background: '#fee2e2', color: '#991b1b' };
    return { background: '#fef9c3', color: '#854d0e' };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student Info</th>
            <th>Course</th>
            <th>Fee</th>
            <th>Context</th>
            <th>Fraud Check</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admissions.map((adm) => {
            const alerts = fraudAlerts[adm.id] || [];
            return (
              <tr key={adm.id}>
                <td>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{adm.student_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adm.student_email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adm.student_mobile}</div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{adm.course_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{adm.admission_mode}</div>
                </td>
                <td>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{parseFloat(adm.snapshot_fee).toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)' }}>{formatIC(toIC(adm.snapshot_fee))} IC</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem' }}>Ref: <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{adm.referrer_name || 'Direct'}</span></div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Code: {adm.payment_reference || 'N/A'}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {alerts.length > 0 ? (
                      alerts.map((alert, idx) => <FraudBadge key={idx} type={alert} />)
                    ) : (
                      <span style={{ color: '#059669', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <UnifiedIcon name="TickCircle" size={12} /> Clear
                      </span>
                    )}
                  </div>
                </td>

              <td>
                <span className="badge" style={{ ...getStatusStyle(adm.status), fontSize: '0.75rem' }}>
                  {adm.status}
                </span>
              </td>
              <td>
                {adm.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onApprove(adm.id)} 
                      className="btn-success" 
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    > Approve </button>
                    <button 
                      onClick={() => onReject(adm.id)} 
                      className="btn-danger" 
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    > Reject </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Processed</span>
                )}
              </td>
            </tr>
          );})}
        </tbody>
      </table>

    </motion.div>
  );
}
