import React from 'react';
import { useNavigate } from 'react-router-dom';

function Reports() {
  const navigate = useNavigate();
  

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calories = [1800, 2100, 1650, 1900, 1420, 2200, 1750];

  const insights = [
    { icon: '💪', text: 'Great protein intake today!', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
    { icon: '💧', text: 'Drink more water today', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
    { icon: '⚠️', text: 'Low on iron — try spinach!', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
    { icon: '🎯', text: 'You hit your calorie goal!', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
  ];

  const maxCal = Math.max(...calories);

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

      {/* Weekly Calorie Chart */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px' }}>Weekly Calorie Intake</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
          {days.map((day, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{calories[i]}</div>
              <div style={{
                width: '100%',
                height: `${(calories[i] / maxCal) * 90}px`,
                background: day === 'Fri' ? 'linear-gradient(180deg, #c084fc, #f472b6)' : 'rgba(192,132,252,0.2)',
                borderRadius: '6px 6px 0 0',
                border: day === 'Fri' ? 'none' : '0.5px solid rgba(192,132,252,0.2)'
              }}></div>
              <div style={{ fontSize: '11px', color: day === 'Fri' ? '#c084fc' : '#6b7280', fontWeight: day === 'Fri' ? '700' : '400' }}>{day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Summary */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px' }}>Today's Nutrition Summary</p>
        {[
          { name: 'Protein', val: 87, max: 120, unit: 'g', color: '#c084fc' },
          { name: 'Carbs', val: 142, max: 250, unit: 'g', color: '#38bdf8' },
          { name: 'Fats', val: 44, max: 80, unit: 'g', color: '#fbbf24' },
          { name: 'Fiber', val: 18, max: 30, unit: 'g', color: '#f472b6' },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'white', fontSize: '13px' }}>{item.name}</span>
              <span style={{ color: item.color, fontSize: '13px', fontWeight: '600' }}>{item.val}{item.unit} / {item.max}{item.unit}</span>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: '6px', height: '8px' }}>
              <div style={{ background: item.color, width: `${(item.val / item.max) * 100}%`, height: '8px', borderRadius: '6px' }}></div>
            </div>
          </div>
        ))}
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
      <button
        onClick={() => navigate('/reports')}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#13131f', border: '0.5px solid #2a2a3d', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>
        📊 View Reports
</button>

    </div>
  );
}

export default Reports;