import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

function Reports() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [totalFiber, setTotalFiber] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate('/'); return; }

        const q = query(
          collection(db, 'meals'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const mealList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMeals(mealList);

        let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0;
        mealList.forEach(meal => {
          if (meal.nutrition) {
            cal += meal.nutrition.calories || 0;
            pro += meal.nutrition.protein || 0;
            carb += meal.nutrition.carbs || 0;
            fat += meal.nutrition.fats || 0;
            fib += meal.nutrition.fiber || 0;
          }
        });
        setTotalCalories(cal);
        setTotalProtein(pro);
        setTotalCarbs(carb);
        setTotalFats(fat);
        setTotalFiber(fib);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMeals();
  }, [navigate]);

  const insights = [
    totalProtein > 50 ? { icon: '💪', text: 'Great protein intake today!', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' } : { icon: '⚠️', text: 'Try to eat more protein today!', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
    totalCalories >= 1800 ? { icon: '🎯', text: 'You hit your calorie goal!', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' } : { icon: '🍽️', text: 'You need more calories today!', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
    totalFiber < 25 ? { icon: '🥦', text: 'Eat more fiber — try vegetables!', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' } : { icon: '✅', text: 'Great fiber intake today!', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
    totalFats > 70 ? { icon: '⚠️', text: 'High fat intake — balance it out!', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' } : { icon: '💚', text: 'Good fat balance today!', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif', padding: '24px' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: '#13131f', border: '0.5px solid #2a2a3d', color: 'white', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '16px' }}>
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '700', background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          Weekly Reports 📊
        </h1>
      </div>

      {/* Total Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Calories', val: loading ? '...' : totalCalories + ' kcal', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
          { label: 'Total Protein', val: loading ? '...' : totalProtein + 'g', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
          { label: 'Total Carbs', val: loading ? '...' : totalCarbs + 'g', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
          { label: 'Total Fats', val: loading ? '...' : totalFats + 'g', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
        ].map((stat, i) => (
          <div key={i} style={{ background: stat.bg, border: `0.5px solid ${stat.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{stat.val}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Nutrition Progress */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px' }}>Daily Nutrition Goals</p>
        {[
          { name: 'Calories', val: totalCalories, max: 2000, unit: 'kcal', color: '#c084fc' },
          { name: 'Protein', val: totalProtein, max: 120, unit: 'g', color: '#38bdf8' },
          { name: 'Carbs', val: totalCarbs, max: 250, unit: 'g', color: '#fbbf24' },
          { name: 'Fats', val: totalFats, max: 80, unit: 'g', color: '#f472b6' },
          { name: 'Fiber', val: totalFiber, max: 30, unit: 'g', color: '#34d399' },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'white', fontSize: '13px' }}>{item.name}</span>
              <span style={{ color: item.color, fontSize: '13px', fontWeight: '600' }}>
                {loading ? '...' : `${item.val}${item.unit} / ${item.max}${item.unit}`}
              </span>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: '6px', height: '8px' }}>
              <div style={{ background: item.color, width: `${Math.min((item.val / item.max) * 100, 100)}%`, height: '8px', borderRadius: '6px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Meal List */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px' }}>All Logged Meals</p>
        {loading ? (
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>Loading...</p>
        ) : meals.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>No meals logged yet!</p>
        ) : (
          meals.map((meal, i) => (
            <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < meals.length - 1 ? '0.5px solid #2a2a3d' : 'none' }}>
              <div>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{meal.meal}</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{meal.nutrition ? meal.nutrition.summary : ''}</div>
              </div>
              <div style={{ color: '#c084fc', fontSize: '13px', fontWeight: '600' }}>
                {meal.nutrition ? meal.nutrition.calories + ' kcal' : ''}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Insights */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 14px' }}>🤖 AI Insights</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {insights.map((insight, i) => (
            <div key={i} style={{ background: insight.bg, border: `0.5px solid ${insight.border}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{insight.icon}</span>
              <span style={{ color: insight.color, fontSize: '13px', fontWeight: '500' }}>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Another Meal */}
      <button
        onClick={() => navigate('/meal-input')}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
        + Log Another Meal 🍽️
      </button>

    </div>
  );
}

export default Reports;