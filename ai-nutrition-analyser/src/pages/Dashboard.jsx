import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

function Dashboard() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate('/'); return; }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
          collection(db, 'meals'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const mealList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMeals(mealList);

        let cal = 0, pro = 0, carb = 0, fat = 0;
        mealList.forEach(meal => {
          if (meal.nutrition) {
            cal += meal.nutrition.calories || 0;
            pro += meal.nutrition.protein || 0;
            carb += meal.nutrition.carbs || 0;
            fat += meal.nutrition.fats || 0;
          }
        });
        setTotalCalories(cal);
        setTotalProtein(pro);
        setTotalCarbs(carb);
        setTotalFats(fat);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMeals();
  }, [navigate]);

  const mealIcons = ['🍛', '🥗', '🍳', '🥤', '🍜', '🥙', '🍱', '🥘'];

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
        <div onClick={() => { auth.signOut(); navigate('/'); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(90deg, #c084fc, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
          N
        </div>
      </div>

      {/* Calorie Card */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px' }}>Total Calories Today</p>
        <h2 style={{ fontSize: '48px', fontWeight: '700', background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px' }}>
          {loading ? '...' : totalCalories}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>of 2,000 kcal goal</p>
        <div style={{ background: '#1a1a2e', borderRadius: '8px', height: '10px', margin: '16px 0 0' }}>
          <div style={{ background: 'linear-gradient(90deg, #c084fc, #f472b6)', width: `${Math.min((totalCalories / 2000) * 100, 100)}%`, height: '10px', borderRadius: '8px' }}></div>
        </div>
      </div>

      {/* Nutrition Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Protein', val: totalProtein + 'g', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
          { label: 'Carbs', val: totalCarbs + 'g', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
          { label: 'Fats', val: totalFats + 'g', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
        ].map((stat, i) => (
          <div key={i} style={{ background: stat.bg, border: `0.5px solid ${stat.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{loading ? '...' : stat.val}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Meals */}
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>Your Meal Logs</h3>
        {loading ? (
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>Loading meals...</p>
        ) : meals.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>No meals logged yet! Add your first meal 😊</p>
        ) : (
          meals.map((meal, i) => (
            <div key={meal.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < meals.length - 1 ? '0.5px solid #2a2a3d' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '28px' }}>{mealIcons[i % mealIcons.length]}</div>
                <div>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{meal.meal}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>{meal.nutrition ? meal.nutrition.quantity : ''}</div>
                </div>
              </div>
              <div style={{ color: '#c084fc', fontSize: '14px', fontWeight: '600' }}>
                {meal.nutrition ? meal.nutrition.calories + ' kcal' : ''}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buttons */}
      <button
        onClick={() => navigate('/meal-input')}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
        + Log a Meal 🍽️
      </button>

      <button
        onClick={() => navigate('/reports')}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#13131f', border: '0.5px solid #2a2a3d', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>
        📊 View Reports
      </button>

    </div>
  );
}

export default Dashboard;
