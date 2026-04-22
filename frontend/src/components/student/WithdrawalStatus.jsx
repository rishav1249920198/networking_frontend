import React from 'react';
import { formatIC } from '../../utils/conversionUtils';
import UnifiedIcon from '../UnifiedIcon';
import './WithdrawalStatus.css';

const WithdrawalStatus = ({ balance, isLocked, stats, onWithdraw }) => {
  const minAmount = 6.0;
  const icBalance = balance; 
  const canWithdraw = !isLocked && icBalance >= minAmount;

  return (
    <div className="withdrawal-container">
      <div className="withdrawal-header">
        <h3 className="withdrawal-title">Payout Eligibility</h3>
        {isLocked ? (
          <span className="status-badge locked" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UnifiedIcon name="Lock" size={14} /> Restricted
          </span>
        ) : (
          <span className="status-badge unlocked" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UnifiedIcon name="Lock1" size={14} /> Active
          </span>
        )}
      </div>

      <div className="milestone-status">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'var(--bg)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Left Side</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span style={{ fontWeight: '900', fontSize: '1rem', color: stats.leftRefs >= 1 ? 'var(--success)' : 'var(--text-primary)' }}>{stats.leftRefs >= 1 ? '1' : '0'}/1</span>
                    {stats.leftRefs >= 1 ? <UnifiedIcon name="TickCircle" size={14} color="var(--success)" /> : <UnifiedIcon name="CloseCircle" size={14} color="var(--text-secondary)" />}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Right Side</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span style={{ fontWeight: '900', fontSize: '1rem', color: stats.rightRefs >= 1 ? 'var(--success)' : 'var(--text-primary)' }}>{stats.rightRefs >= 1 ? '1' : '0'}/1</span>
                    {stats.rightRefs >= 1 ? <UnifiedIcon name="TickCircle" size={14} color="var(--success)" /> : <UnifiedIcon name="CloseCircle" size={14} color="var(--text-secondary)" />}
                </div>
            </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.25rem', fontWeight: '500' }}>
            {isLocked 
                ? "Complete 1 Left + 1 Right to unlock withdrawal" 
                : "Requirement Met: Binary Withdrawal Unlocked"}
        </div>
      </div>

      <div className="action-area">
        <div className="balance-info">
          <span className="label">Withdrawable (IC)</span>
          <span className="amount" style={{ color: canWithdraw ? 'var(--success)' : 'var(--text-primary)' }}>{formatIC(icBalance)} IC</span>
        </div>

        <button 
          onClick={onWithdraw} 
          disabled={!canWithdraw}
          className={`withdraw-btn ${canWithdraw ? 'active' : 'disabled'}`}
          style={{ height: '42px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <UnifiedIcon name="Wallet" size={16} /> Request Payout
        </button>
      </div>

      {!canWithdraw && (
        <div className="warning-note" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
          <UnifiedIcon name="Danger" size={14} color="#ef4444" />
          <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '600' }}>
            {isLocked 
              ? "Binary status incomplete. Referral required." 
              : `Min effort: ${minAmount} IC required. Need ${formatIC(minAmount - icBalance)} more.`}
          </span>
        </div>
      )}
    </div>
  );
};

export default WithdrawalStatus;

