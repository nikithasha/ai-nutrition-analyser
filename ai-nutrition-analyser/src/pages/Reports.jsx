import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

function Reports() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ cal: 0, pro: 0, carb: 0, fat: 0, fib: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate('/'); return; }
        const q = query(collection(db, 'meals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const mealList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMeals(mealList);
        let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0;
        mealList.forEach(m => {
          if (m.nutrition) {
            cal += m.nutrition.calories || 0;
            pro += m.nutrition.protein || 0;
            carb += m.nutrition.carbs || 0;
            fat += m.nutrition.fats || 0;
            fib += m.nutrition.fiber || 0;
          }
        });
        setTotals({ cal, pro, carb, fat, fib });
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchMeals();
  }, [navigate]);

  const insights = [
    totals.pro > 50
      ? { icon: '💪', text: 'Great protein intake today!', bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' }
      : { icon: '⚠️', text: 'Try to eat more protein!', bg: '#fff8e1', border: '#ffe082', color: '#f57f17' },
    totals.cal >= 1800
      ? { icon: '🎯', text: 'You hit your calorie goal!', bg: '#fff3e0', border: '#ffcc80', color: '#e65100' }
      : { icon: '🍽️', text: 'You need more calories today!', bg: '#fce4ec', border: '#f48fb1', color: '#880e4f' },
    totals.fib < 25
      ? { icon: '🥦', text: 'Eat more fiber — try veggies!', bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' }
      : { icon: '✅', text: 'Great fiber intake today!', bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' },
    totals.fat > 70
      ? { icon: '⚠️', text: 'High fat — balance it out!', bg: '#fff8e1', border: '#ffe082', color: '#f57f17' }
      : { icon: '💚', text: 'Good fat balance today!', bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 100%)', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #ff8f00, #e65100)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(230,81,0,0.3)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
          ←
        </button>
        <div>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0 }}>Reports 📊</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: '2px 0 0' }}>Your nutrition overview</p>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: '🔥 Total Calories', val: loading ? '...' : totals.cal + ' kcal', bg: '#fff3e0', border: '#ffcc80', color: '#e65100' },
            { label: '💪 Total Protein', val: loading ? '...' : totals.pro + 'g', bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' },
            { label: '⚡ Total Carbs', val: loading ? '...' : totals.carb + 'g', bg: '#fff8e1', border: '#ffe082', color: '#f57f17' },
            { label: '🫙 Total Fats', val: loading ? '...' : totals.fat + 'g', bg: '#fce4ec', border: '#f48fb1', color: '#880e4f' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', fontWeight: '600' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 8px 30px rgba(230,81,0,0.12)', border: '1.5px solid #ffe0b2' }}>
          <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 16px' }}>🎯 Daily Nutrition Goals</h3>
          {[
            { name: '🔥 Calories', val: totals.cal, max: 2000, unit: 'kcal', color: '#e65100', bg: '#fff3e0' },
            { name: '💪 Protein', val: totals.pro, max: 120, unit: 'g', color: '#2e7d32', bg: '#e8f5e9' },
            { name: '⚡ Carbs', val: totals.carb, max: 250, unit: 'g', color: '#f57f17', bg: '#fff8e1' },
            { name: '🫙 Fats', val: totals.fat, max: 80, unit: 'g', color: '#880e4f', bg: '#fce4ec' },
            { name: '🥦 Fiber', val: totals.fib, max: 30, unit: 'g', color: '#1565c0', bg: '#e3f2fd' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#444', fontSize: '13px', fontWeight: '700' }}>{item.name}</span>
                <span style={{ color: item.color, fontSize: '13px', fontWeight: '700' }}>
                  {loading ? '...' : `${item.val}${item.unit} / ${item.max}${item.unit}`}
                </span>
              </div>
              <div style={{ background: item.bg, borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: item.color, width: `${Math.min((item.val / item.max) * 100, 100)}%`, height: '10px', borderRadius: '8px', transition: 'width 1s ease' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Meal List */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 8px 30px rgba(230,81,0,0.12)', border: '1.5px solid #ffe0b2' }}>
          <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 16px' }}>🍽️ All Logged Meals</h3>
          {loading ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>Loading... 🌿</p>
          ) : meals.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>No meals logged yet!</p>
          ) : (
            meals.map((meal, i) => (
              <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < meals.length - 1 ? '1px dashed #ffe0b2' : 'none' }}>
                <div>
                  <div style={{ color: '#333', fontSize: '14px', fontWeight: '600' }}>{meal.meal}</div>
                  <div style={{ color: '#aaa', fontSize: '12px', marginTop: '2px' }}>{meal.nutrition ? meal.nutrition.summary : ''}</div>
                </div>
                <div style={{ background: 'linear-gradient(90deg, #ff8f00, #e65100)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  {meal.nutrition ? meal.nutrition.calories + ' kcal' : ''}
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Insights */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: '0 8px 30px rgba(230,81,0,0.12)', border: '1.5px solid #ffe0b2' }}>
          <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 14px' }}>🤖 AI Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ background: ins.bg, border: `1.5px solid ${ins.border}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{ins.icon}</span>
                <span style={{ color: ins.color, fontSize: '14px', fontWeight: '600' }}>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/meal-input')}
          style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(90deg, #ff8f00, #e65100)', color: 'white', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(230,81,0,0.35)' }}>
          + Log Another Meal 🍽️
        </button>
      </div>
    </div>
  );
}

export default Reports;