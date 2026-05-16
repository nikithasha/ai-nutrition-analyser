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
  const [selectedImage, setSelectedImage] = useState(null);
// eslint-disable-next-line
  const [imageFile, setImageFile] = useState(null);

  const handleAnalyse = async () => {
    if (activeTab === 'text' && !mealText) { setError('Please describe your meal first!'); return; }
    if (activeTab === 'photo') { setError('Photo analysis is currently disabled.'); return; }
    
    try {
      setLoading(true); setError('');
      
      // We only call the text analysis now
      const result = await analyseMeal(mealText);
      setNutrition(result);
      
      const user = auth.currentUser;
      if (!user) { setError('Please login first!'); setLoading(false); return; }
      
      await addDoc(collection(db, 'meals'), {
        userId: user.uid,
        meal: mealText,
        nutrition: result,
        createdAt: serverTimestamp(),
      });
      setLoading(false);
    } catch (err) {
      setError('Something went wrong: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%)', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #4caf50, #2e7d32)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(46,125,50,0.3)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
          ←
        </button>
        <div>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0 }}>Log a Meal 🍽️</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: '2px 0 0' }}>Tell us what you ate!</p>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'white', borderRadius: '16px', padding: '4px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1.5px solid #c8e6c9' }}>
          {[{ key: 'text', label: '✏️ Type Food' }, { key: 'photo', label: '📸 Photo' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setNutrition(null); }}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700', background: activeTab === tab.key ? 'linear-gradient(90deg, #4caf50, #2e7d32)' : 'transparent', color: activeTab === tab.key ? 'white' : '#888', transition: 'all 0.3s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fff9c4', border: '1.5px solid #f9a825', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#e65100', fontSize: '13px', fontWeight: '600' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && !nutrition && (
          <div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 6px 20px rgba(46,125,50,0.1)', border: '1.5px solid #c8e6c9' }}>
              <label style={{ fontSize: '14px', color: '#2e7d32', fontWeight: '700', display: 'block', marginBottom: '10px' }}>
                🥗 What did you eat?
              </label>
              <textarea
                placeholder="e.g. 2 boiled eggs, 1 cup of rice, 1 banana, glass of milk..."
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                style={{ width: '100%', minHeight: '120px', background: '#f1f8e9', border: '1.5px solid #c8e6c9', borderRadius: '12px', padding: '12px', color: '#333', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Quick Add */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: '0 6px 20px rgba(46,125,50,0.1)', border: '1.5px solid #c8e6c9' }}>
              <p style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>⚡ Quick Add:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[['🍳', 'Eggs'], ['🍚', 'Rice'], ['🍗', 'Chicken'], ['🥛', 'Milk'], ['🍌', 'Banana'], ['🥑', 'Avocado'], ['🍞', 'Bread'], ['🥦', 'Broccoli'], ['🥕', 'Carrot'], ['🍎', 'Apple']].map(([icon, food], i) => (
                  <button
                    key={i}
                    onClick={() => setMealText(prev => prev ? prev + ', ' + food : food)}
                    style={{ padding: '8px 14px', borderRadius: '20px', background: '#f1f8e9', border: '1.5px solid #a5d6a7', color: '#2e7d32', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    {icon} {food}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Photo Tab */}
        {activeTab === 'photo' && !nutrition && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: '0 6px 20px rgba(46,125,50,0.1)', border: '1.5px solid #c8e6c9' }}>
            {!selectedImage ? (
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ border: '2px dashed #a5d6a7', borderRadius: '16px', padding: '48px 20px', textAlign: 'center', background: '#f1f8e9' }}>
                  <div style={{ fontSize: '56px', marginBottom: '12px' }}>📸</div>
                  <p style={{ color: '#2e7d32', fontSize: '16px', fontWeight: '700', margin: '0 0 6px' }}>Tap to upload meal photo</p>
                  <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>JPG, PNG supported</p>
                </div>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setSelectedImage(URL.createObjectURL(f)); } }} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img src={selectedImage} alt="meal" style={{ width: '100%', borderRadius: '12px', marginBottom: '12px', maxHeight: '250px', objectFit: 'cover' }} />
                <button onClick={() => { setSelectedImage(null); setImageFile(null); }} style={{ background: '#ffebee', border: '1.5px solid #ef9a9a', color: '#c62828', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  🗑️ Remove Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nutrition Results */}
        {nutrition && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 8px 30px rgba(46,125,50,0.15)', border: '1.5px solid #c8e6c9' }}>
            <h3 style={{ color: '#2e7d32', fontSize: '16px', fontWeight: '800', margin: '0 0 8px' }}>🤖 AI Nutrition Analysis</h3>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px', fontStyle: 'italic' }}>{nutrition.summary}</p>

            {nutrition.usdaVerified && (
              <div style={{ background: '#e8f5e9', border: '1.5px solid #a5d6a7', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <span style={{ color: '#2e7d32', fontSize: '13px', fontWeight: '600' }}>Verified with USDA Database: {nutrition.usdaName}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: '🔥 Calories', val: nutrition.calories + ' kcal', bg: '#fff3e0', border: '#ffcc80', color: '#e65100' },
                { label: '💪 Protein', val: nutrition.protein + 'g', bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32' },
                { label: '⚡ Carbs', val: nutrition.carbs + 'g', bg: '#fff8e1', border: '#ffe082', color: '#f57f17' },
                { label: '🫙 Fats', val: nutrition.fats + 'g', bg: '#fce4ec', border: '#f48fb1', color: '#880e4f' },
              ].map((item, i) => (
                <div key={i} style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ color: item.color, fontSize: '22px', fontWeight: '800' }}>{item.val}</div>
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#f1f8e9', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
              <span style={{ color: '#2e7d32', fontSize: '13px', fontWeight: '600' }}>📏 Quantity: </span>
              <span style={{ color: '#555', fontSize: '13px' }}>{nutrition.quantity}</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(90deg, #4caf50, #2e7d32)', color: 'white', fontSize: '15px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(46,125,50,0.3)' }}>
              ✅ Saved! Go to Dashboard
            </button>
          </div>
        )}

        {!nutrition && (
          <button
            onClick={handleAnalyse}
            disabled={loading}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: loading ? '#a5d6a7' : 'linear-gradient(90deg, #4caf50, #2e7d32)', color: 'white', fontSize: '16px', fontWeight: '800', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(46,125,50,0.35)' }}>
            {loading ? '🤖 Analysing your meal...' : '🤖 Analyse Nutrition'}
          </button>
        )}
      </div>
    </div>
  );
}

export default MealInput;