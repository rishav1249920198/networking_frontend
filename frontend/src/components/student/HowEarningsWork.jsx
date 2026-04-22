import React from 'react';
import { motion } from 'framer-motion';
import UnifiedIcon from '../UnifiedIcon';

const HowEarningsWork = () => {
    const sections = [
        {
            title: "Point Conversion (IC)",
            icon: "MoneyRecive",
            color: "#3b82f6",
            content: "Internal Credit (IC) is our standard point unit. For every ₹50 in commission, you earn 1 IC. Credits are instantly added to your wallet upon referral approval.",
            highlights: ["1 IC = ₹50", "Instantly withdrawable", "Secure internal ledger"]
        },
        {
            title: "Direct Earnings & Boost",
            icon: "LampCharge",
            color: "#f59e0b",
            content: "You earn a base commission for every direct referral. This is boosted based on your current volume to encourage growth.",
            table: [
                { range: "Ref 1 - 2", reward: "Base Points" },
                { range: "Ref 3 - 4", reward: "Base + ₹10 Bonus" },
                { range: "Ref 5 - 6", reward: "Base + ₹25 Bonus" },
                { range: "Ref 7+", reward: "Base Points (Max Boost Reached)" }
            ]
        },
        {
            title: "Override Ecosystem",
            icon: "Graph",
            color: "#10b981",
            content: "Earnings aren't just limited to your direct work. You earn 'Overrides' from your referral network up to level 6.",
            distribution: [
                { level: "L1", share: "50%" },
                { level: "L2", share: "20%" },
                { level: "L3-L4", share: "10%" },
                { level: "L5-L6", share: "5%" }
            ],
            note: "Percentages are of the remaining commission pool after direct payout."
        },
        {
            title: "Financial Cap System",
            icon: "ShieldSecurity",
            color: "#ef4444",
            content: "To maintain long-term sustainability, each course has a maximum payout limit (Cap). Total commissions distributed cannot exceed this cap per admission.",
            highlights: ["Variable Caps (e.g. 5%)", "Snapshot based", "Zero-deficit system"]
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {sections.map((section, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '1.75rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '16px', background: `${section.color}20`, color: section.color }}>
                            <UnifiedIcon name={section.icon} size={24} />
                        </div>
                        <h3 style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{section.title}</h3>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        {section.content}
                    </p>

                    {section.highlights && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                            {section.highlights.map((h, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '700' }}>
                                    {h}
                                </span>
                            ))}
                        </div>
                    )}

                    {section.table && (
                        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginTop: 'auto' }}>
                            {section.table.map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: i % 2 === 0 ? 'transparent' : 'var(--bg)', fontSize: '0.8rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{row.range}</span>
                                    <span style={{ fontWeight: '700', color: '#3b82f6' }}>{row.reward}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {section.distribution && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            {section.distribution.map((row, i) => (
                                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{row.level}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#10b981' }}>{row.share}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default HowEarningsWork;
