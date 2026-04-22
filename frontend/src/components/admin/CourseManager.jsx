import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';
import UnifiedIcon from '../UnifiedIcon';

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'computer', fee: 3500, points: 5, cap_percent: 5, boost_enabled: true,
    level_distribution: { L1: 40, L2: 20, L3: 15, L4: 10, L5: 10, L6: 5 }
  });

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data);
    } catch (err) {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditing(course.id);
    setFormData({
      ...course,
      level_distribution: typeof course.level_distribution === 'string' 
        ? JSON.parse(course.level_distribution) 
        : (course.level_distribution || { L1: 40, L2: 20, L3: 15, L4: 10, L5: 10, L6: 5 })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sum = Object.values(formData.level_distribution).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    if (sum > 100.1) {
      return toast.error('Total distribution cannot exceed 100%');
    }
    if (formData.cap_percent < 3 || formData.cap_percent > 6) {
      return toast.error('Cap must be between 3% and 6%');
    }

    try {
      if (editing) {
        await api.put(`/courses/${editing}`, formData);
        toast.success('Course updated.');
      } else {
        await api.post('/courses', formData);
        toast.success('Course created.');
      }
      setEditing(null);
      setFormData({
        name: '', category: 'computer', fee: 3500, points: 5, cap_percent: 5, boost_enabled: true,
        level_distribution: { L1: 40, L2: 20, L3: 15, L4: 10, L5: 10, L6: 5 }
      });
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    }
  };

  const calculateEstimates = (data) => {
    const fee = parseFloat(data.fee || 0);
    const points = parseFloat(data.points || 0);
    const capPercent = parseFloat(data.cap_percent || 5);
    
    const capRupees = Math.floor((fee * capPercent) / 100);
    const directBase = Math.floor(points * 50);
    const maxBoost = 25; // As per rules
    const directTotal = directBase + maxBoost;
    
    // Safety check for risk
    let risk = 'green';
    if (capPercent > 5) risk = 'red';
    else if (capPercent >= 4) risk = 'yellow';

    const remainingPool = Math.max(0, capRupees - directTotal);
    const levels = {};
    Object.entries(data.level_distribution).forEach(([lvl, pct]) => {
        levels[lvl] = Math.floor(remainingPool * (parseFloat(pct) / 100));
    });

    return { capRupees, directBase, directTotal, remainingPool, levels, risk };
  };

  const estimates = calculateEstimates(formData);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
      {/* Course List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: '800', fontFamily: 'Outfit' }}>Production Courses</h2>
            <button onClick={() => { setEditing(null); setFormData({ name: '', category: 'computer', fee: 3500, points: 5, cap_percent: 5, boost_enabled: true, level_distribution: { L1: 40, L2: 20, L3: 15, L4: 10, L5: 10, L6: 5 } }); }} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UnifiedIcon name="Add" size={16} /> New Course
            </button>
        </div>

        {courses.map(course => (
          <div key={course.id} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '15px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>{course.name}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>₹{parseFloat(course.fee).toLocaleString()}</span>
                <span>{course.points} Pts</span>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Cap: {course.cap_percent}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(course)} className="btn-secondary" style={{ padding: '0.4rem', display: 'flex' }}><UnifiedIcon name="Edit" size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Intelligence Sidebar */}
      <div style={{ position: 'sticky', top: '20px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
           <h3 style={{ fontWeight: '700', marginBottom: '1.5rem' }}>{editing ? 'Edit Configuration' : 'Course Setup'}</h3>

           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <input placeholder="Course Name" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>COURSE PRICE (₹)</label>
                    <input type="number" className="form-input" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>POINTS (1=₹50)</label>
                    <input type="number" className="form-input" value={formData.points} onChange={e => setFormData({...formData, points: e.target.value})} required />
                </div>
             </div>

             <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>CAP PERCENT (3% - 6%)</label>
                <input type="number" step="0.1" className="form-input" value={formData.cap_percent} onChange={e => setFormData({...formData, cap_percent: parseFloat(e.target.value)})} required />
             </div>

             {/* Risk Indicator Panel */}
             <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px', border: `1px solid ${estimates.risk === 'red' ? '#ef444455' : estimates.risk === 'yellow' ? '#f59e0b55' : '#10b98155'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <UnifiedIcon name="ShieldSecurity" size={14} color={estimates.risk === 'red' ? '#ef4444' : estimates.risk === 'yellow' ? '#f59e0b' : '#10b981'} />
                        Risk: <span style={{ color: estimates.risk === 'red' ? '#ef4444' : estimates.risk === 'yellow' ? '#f59e0b' : '#10b981' }}>{estimates.risk === 'red' ? 'HIGH' : estimates.risk === 'yellow' ? 'MEDIUM' : 'SAFE'}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Total Cap: ₹{estimates.capRupees}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Max Direct + Boost:</span>
                        <span style={{ fontWeight: '700' }}>₹{estimates.directTotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Pool for Overrides:</span>
                        <span style={{ fontWeight: '700', color: estimates.remainingPool <= 0 ? 'var(--danger)' : 'var(--success)' }}>₹{estimates.remainingPool}</span>
                    </div>
                </div>
                {estimates.remainingPool <= 0 && (
                    <div style={{ marginTop: '0.6rem', padding: '0.4rem', background: '#fee2e2', color: '#ef4444', fontSize: '0.6rem', borderRadius: '4px', fontWeight: '700', textAlign: 'center' }}>
                        ⚠️ Override distribution too tight!
                    </div>
                )}
             </div>

             {/* Auto Override Preview */}
             <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>ESTIMATED OVERRIDE PER ADMISSION</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[1,2,3,4,5,6].map(lvl => (
                        <div key={lvl} style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: '700' }}>L{lvl} (%)</div>
                            <input type="number" style={{ width: '100%', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', outline: 'none' }} value={formData.level_distribution[`L${lvl}`]} onChange={e => {
                                const newDist = {...formData.level_distribution, [`L${lvl}`]: e.target.value};
                                setFormData({...formData, level_distribution: newDist});
                            }} />
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '800', marginTop: '0.2rem' }}>₹{estimates.levels[`L${lvl}`]}</div>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>"Estimated (Actual may vary based on floor rounding)"</p>
             </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>{editing ? 'Update Course' : 'Launch Course'}</button>
                {editing && <button type="button" onClick={() => setEditing(null)} className="btn-secondary" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center' }}><UnifiedIcon name="CloseCircle" size={16} /></button>}
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
