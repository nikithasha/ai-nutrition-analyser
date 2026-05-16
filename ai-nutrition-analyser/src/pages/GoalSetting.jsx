import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const goals = [
  { key: 'lose', label: 'Lose Weight', icon: '🏃', desc: 'Calorie deficit diet', cal: 1500, protein: 100, carbs: 150, fats: 50 },
  { key: 'maintain', label: 'Maintain Weight', icon: '⚖️', desc: 'Balanced nutrition', cal: 2000, protein: 120, carbs: 250, fats: 65 },
  { key: 'gain', label: 'Gain Weight', icon: '🍽️', desc: 'Calorie surplus diet', cal: 2500, protein: 150, carbs: 310, fats: 80 },
  { key: 'muscle', label: 'Build Muscle', icon: '💪', desc: 'High protein diet', cal: 2200, protein: 180, carbs: 220, fats: 60 },
];

function GoalSetting() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate('/'); return; }
        const docRef = doc(db, 'userGoals', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSelected(docSnap.data().goalKey);
        }
        setLoading(false);
      } catch (err) { setLoading(false); }
    };
    fetchGoal();
  }, [navigate]);

  const handleSave = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const user = auth.currentUser;
      const goal = goals.find(g => g.key === selected);
      await setDoc(doc(db, 'userGoals', user.uid), {
        goalKey: selected,
        goalLabel: goal.label,
        dailyCalories: goal.cal,
        dailyProtein: goal.protein,
        dailyCarbs: goal.carbs,
        dailyFats: goal.fats,
        updatedAt: new Date(),
      });
      navigate('/dashboard');
    } catch (err) {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff9f0, #ffecd2)', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>🥗</div>
        <p style={{ color: '#e65100', fontWeight: '700', fontSize: '18px' }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 100%)', fontFamily: 'sans-serif', padding: '0' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #ff8f00, #e65100)', padding: '20px 24px', boxShadow: '0 4px 20px rgba(230,81,0,0.3)' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>🎯 Set Your Goal</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '4px 0 0' }}>Choose your nutrition goal to get personalised targets!</p>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {goals.map((goal) => (
            <div
              key={goal.key}
              onClick={() => setSelected(goal.key)}
              style={{ background: selected === goal.key ? 'linear-gradient(135deg, #fff3e0, #ffe0b2)' : 'white', border: selected === goal.key ? '2.5px solid #e65100' : '1.5px solid #ffe0b2', borderRadius: '20px', padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: selected === goal.key ? '0 8px 25px rgba(230,81,0,0.2)' : '0 4px 12px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
              <div style={{ fontSize: '44px' }}>{goal.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: selected === goal.key ? '#e65100' : '#333' }}>{goal.label}</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{goal.desc}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: '🔥 ' + goal.cal + ' kcal', bg: '#fff3e0', color: '#e65100' },
                    { label: '💪 ' + goal.protein + 'g protein', bg: '#e8f5e9', color: '#2e7d32' },
                    { label: '⚡ ' + goal.carbs + 'g carbs', bg: '#fff8e1', color: '#f57f17' },
                    { label: '🫙 ' + goal.fats + 'g fats', bg: '#fce4ec', color: '#880e4f' },
                  ].map((badge, i) => (
                    <span key={i} style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
              {selected === goal.key && (
                <div style={{ fontSize: '28px' }}>✅</div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          style={{ width: '100%', padding: '16px', borderRadius: '16px', background: !selected || saving ? '#ffcc80' : 'linear-gradient(90deg, #ff8f00, #e65100)', color: 'white', fontSize: '16px', fontWeight: '800', border: 'none', cursor: !selected || saving ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(230,81,0,0.35)' }}>
          {saving ? '💾 Saving...' : '🎯 Save My Goal'}
        </button>
      </div>
    </div>
  );
}

export default GoalSetting;