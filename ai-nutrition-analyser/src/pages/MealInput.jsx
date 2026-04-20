import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyseMeal } from '../groq';

function MealInput() {
  const navigate = useNavigate();
  const [mealText, setMealText] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nutrition, setNutrition] = useState(null);

  const handleAnalyse = async () => {
    if (!mealText) {
      setError('Please describe your meal first!');
      return;
    }
    try {
      setLoading(true);
      setError('');

      const result = await analyseMeal(mealText);
      setNutrition(result);

      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'meals'), {
          userId: user.uid,
          meal: mealText,
          nutrition: result,
          createdAt: serverTimestamp(),
        });
      }
      setLoading(false);
    } catch (err) {
      setError('Something went wrong: ' + err.message);
      setLoading(false);
    }
  };

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
          Log a Meal 🍽️
        </h1>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('text')}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: activeTab === 'text' ? 'linear-gradient(90deg, #c084fc, #f472b6)' : 'transparent', color: activeTab === 'text' ? 'white' : '#6b7280' }}>
          ✏️ Type Food
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: activeTab === 'photo' ? 'linear-gradient(90deg, #c084fc, #f472b6)' : 'transparent', color: activeTab === 'photo' ? 'white' : '#6b7280' }}>
          📸 Photo
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: 'rgba(244,114,182,0.1)', border: '0.5px solid rgba(244,114,182,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#f472b6', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div>
          <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '10px' }}>
              What did you eat? Describe your meal:
            </label>
            <textarea
              placeholder="e.g. 2 boiled eggs, 1 cup of rice, 1 banana..."
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              style={{ width: '100%', minHeight: '120px', background: '#1a1a2e', border: '1px solid #2a2a3d', borderRadius: '10px', padding: '12px', color: 'white', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Quick Add Buttons */}
          <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 12px' }}>Quick add common foods:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['🍳 Eggs', '🍚 Rice', '🍗 Chicken', '🥛 Milk', '🍌 Banana', '🥑 Avocado', '🍞 Bread', '🥦 Broccoli'].map((food, i) => (
                <button
                  key={i}
                  onClick={() => setMealText(prev => prev ? prev + ', ' + food.split(' ')[1] : food.split(' ')[1])}
                  style={{ padding: '8px 14px', borderRadius: '20px', background: 'rgba(192,132,252,0.1)', border: '0.5px solid rgba(192,132,252,0.3)', color: '#c084fc', fontSize: '13px', cursor: 'pointer' }}>
                  {food}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Tab */}
      {activeTab === 'photo' && (
        <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <label style={{ display: 'block', cursor: 'pointer' }}>
            <div style={{ border: '2px dashed #2a2a3d', borderRadius: '14px', padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 6px' }}>Photo upload coming soon!</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Use text input for now 😊</p>
            </div>
          </label>
        </div>
      )}

      {/* Nutrition Results */}
      {nutrition && (
        <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px' }}>🤖 AI Nutrition Analysis:</p>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 16px', fontStyle: 'italic' }}>{nutrition.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Calories', val: nutrition.calories + ' kcal', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
              { label: 'Protein', val: nutrition.protein + 'g', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
              { label: 'Carbs', val: nutrition.carbs + 'g', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
              { label: 'Fats', val: nutrition.fats + 'g', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
            ].map((item, i) => (
              <div key={i} style={{ background: item.bg, border: `0.5px solid ${item.border}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ color: item.color, fontSize: '18px', fontWeight: '700' }}>{item.val}</div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '15px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '16px' }}>
            Save & Go to Dashboard ✅
          </button>
        </div>
      )}

      {/* Analyse Button */}
      {!nutrition && (
        <button
          onClick={handleAnalyse}
          disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: '14px', background: loading ? '#2a2a3d' : 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '16px', fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '🤖 Analysing...' : '🤖 Analyse Nutrition'}
        </button>
      )}

    </div>
  );
}

export default MealInput;