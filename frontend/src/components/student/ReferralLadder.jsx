import React from 'react';
import { motion } from 'framer-motion';
import UnifiedIcon from '../UnifiedIcon';

const ReferralLadder = ({ currentCount }) => {
  const steps = [
    { threshold: 2, label: 'Starter', icon: 'UserAdd', color: '#94a3b8' },
    { threshold: 4, label: 'Builder', icon: 'Flash', color: '#3b82f6' },
    { threshold: 6, label: 'Achiever', icon: 'Award', color: '#10b981' },
    { threshold: 10, label: 'Leader', icon: 'MagicStar', color: '#f59e0b' },
    { threshold: 20, label: 'Elite', icon: 'Crown', color: '#ef4444' }
  ];

  const currentStepIndex = steps.findIndex(s => currentCount < s.threshold);
  const nextStep = currentStepIndex === -1 ? null : steps[currentStepIndex];
  const lastCompleted = currentStepIndex === -1 ? steps[steps.length - 1] : steps[currentStepIndex - 1];

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.75rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1 }}>
        <UnifiedIcon name="Ranking" size={80} />
      </div>

      <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <UnifiedIcon name="Award" size={20} color="#f59e0b" /> Career Progress
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((step, index) => {
          const isCompleted = currentCount >= step.threshold;
          const isNext = nextStep && nextStep.threshold === step.threshold;
          
          return (
            <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                opacity: isCompleted ? 1 : isNext ? 1 : 0.4,
                padding: '0.5rem',
                borderRadius: '12px',
                background: isNext ? `${step.color}08` : 'transparent',
                border: isNext ? `1px dashed ${step.color}30` : '1px solid transparent'
            }}>
              <div style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: isCompleted ? `${step.color}20` : 'var(--bg)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCompleted ? step.color : 'var(--text-secondary)'
              }}>
                {isCompleted ? <UnifiedIcon name="TickCircle" size={18} /> : <UnifiedIcon name={step.icon} size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {step.label} {isCompleted && '✓'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  {step.threshold} Referrals Required
                </div>
              </div>
              {isNext && (
                <div style={{ fontSize: '0.6rem', fontWeight: '800', color: step.color, background: `${step.color}15`, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  NEXT GOAL
                </div>
              )}
            </div>
          );
        })}
      </div>

      {nextStep && (
          <div style={{ marginTop: '2rem', background: 'var(--bg)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Next: {nextStep.label}</span>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{currentCount} / {nextStep.threshold}</span>
            </div>
            <div style={{ height: '10px', background: 'var(--bg-card)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (currentCount / nextStep.threshold) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(90deg, #3b82f6, ${nextStep.color})` }}
              />
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
              Only {nextStep.threshold - currentCount} more referrals to reach {nextStep.label} tier!
            </div>
          </div>
      )}
    </div>
  );
};

export default ReferralLadder;
