import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const meals = [
    { icon: '🍳', name: 'Eggs & Toast', time: '8:00 AM', cal: 380, color: '#38bdf8' },
    { icon: '🍛', name: 'Chicken Rice', time: '1:00 PM', cal: 520, color: '#c084fc' },
    { icon: '🥤', name: 'Protein Shake', time: '4:00 PM', cal: 210, color: '#f472b6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif', padding: '24px' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            🥗 AI Nutrition Analyser
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>Good morning! 👋</p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(90deg, #c084fc, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
          N
        </div>
      </div>

      {/* Calorie Card */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px' }}>Total Calories Today</p>
        <h2 style={{ fontSize: '48px', fontWeight: '700', background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px' }}>
          1,110
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>of 2,000 kcal goal</p>

        {/* Progress Bar */}
        <div style={{ background: '#1a1a2e', borderRadius: '8px', height: '10px', margin: '16px 0 0' }}>
          <div style={{ background: 'linear-gradient(90deg, #c084fc, #f472b6)', width: '55%', height: '10px', borderRadius: '8px' }}></div>
        </div>
      </div>

      {/* Nutrition Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Protein', val: '87g', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
          { label: 'Carbs', val: '142g', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
          { label: 'Fats', val: '44g', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
        ].map((stat, i) => (
          <div key={i} style={{ background: stat.bg, border: `0.5px solid ${stat.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{stat.val}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Meals */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>Today's Meals</h3>
        {meals.map((meal, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < meals.length - 1 ? '0.5px solid #2a2a3d' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>{meal.icon}</div>
              <div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{meal.name}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{meal.time}</div>
              </div>
            </div>
            <div style={{ color: meal.color, fontSize: '14px', fontWeight: '600' }}>{meal.cal} kcal</div>
          </div>
        ))}
      </div>

      {/* Add Meal Button */}
      <button
        onClick={() => navigate('/meal-input')}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
        + Log a Meal 🍽️
      </button>

    </div>
  );
}

export default Dashboard;
