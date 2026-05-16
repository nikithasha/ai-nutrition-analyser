import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const mealIcons = ['🍛', '🥗', '🍳', '🥤', '🍜', '🥙', '🍱', '🥘'];

const isToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  const mealDate = new Date(dateString);
  return (
    mealDate.getDate() === today.getDate() &&
    mealDate.getMonth() === today.getMonth() &&
    mealDate.getFullYear() === today.getFullYear()
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ cal: 0, pro: 0, carb: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [profile, setProfile] = useState({
    name: 'User', age: '', gender: '', height: '', weight: '', bmi: '', medicalConditions: 'None', activityLevel: ''
  });

  const [goal, setGoal] = useState({
    dailyCalories: 2000, dailyProtein: 120, dailyCarbs: 250, dailyFats: 65
  });

  const [aiInsights, setAiInsights] = useState({
    dailyAnalysis: 'Evaluating metrics...',
    tomorrowTips: 'Loading target parameters...',
    motivationalQuote: 'Syncing system...'
  });

  const fetchMealsForDate = useCallback((user, dateStr, currentProfile, currentGoal) => {
    if (!user) return;

    try {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(collection(db, 'meals'), where('userId', '==', user.uid));
      getDocs(q).then((snapshot) => {
        const allMeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const filtered = allMeals.filter(meal => {
          if (!meal.createdAt) return false;
          const mealDate = meal.createdAt.toDate ? meal.createdAt.toDate() : new Date(meal.createdAt);
          return mealDate >= startOfDay && mealDate <= endOfDay;
        });

        setMeals(filtered);
        
        let cal = 0, pro = 0, carb = 0, fat = 0;
        filtered.forEach(meal => {
          cal += Number(meal.manualCalories || 0);
          pro += Number(meal.manualProtein || 0);
          carb += Number(meal.manualCarbs || 0);
          fat += Number(meal.manualFats || 0);
        });
        
        setTotals({ cal, pro, carb, fat });

        const condition = String(currentProfile?.medicalConditions || 'None').toLowerCase();
        const profileName = currentProfile?.name || 'User';
        const targetCal = currentGoal?.dailyCalories || 2000;
        const targetCarbs = currentGoal?.dailyCarbs || 250;
        const targetFats = currentGoal?.dailyFats || 65;

        let analysis = `Status Check: Nutrient volume logged under condition context (${currentProfile?.medicalConditions || 'None'}).`;
        let tips = `You have ${Math.max(0, targetCal - cal)} kcal left inside your allocation bounds.`;
        
        if (condition.includes('diabetes') && carb > targetCarbs) {
          analysis = `🚨 CRITICAL WARNING (Diabetes): Carbohydrates logged have exceeded thresholds! Monitor glucose.`;
        } else if (condition.includes('hypertension') && fat > targetFats) {
          analysis = `🚨 HEALTH WARNING (Hypertension): High-fat consumption variance tracked.`;
        }

        if (cal > targetCal) {
          tips = `⚠️ CALORIE LIMIT EXCEEDED: Exceeded self-defined boundary by ${cal - targetCal} kcal!`;
        }

        setAiInsights({
          dailyAnalysis: analysis,
          tomorrowTips: tips,
          motivationalQuote: `Consistency over speed, ${profileName}! Tracking metrics manually keeps control in your hands.`
        });

        setLoading(false);
      }).catch((err) => {
        console.error("Firestore loading exception:", err);
        setLoading(false);
      });
    } catch (err) { 
      console.error(err); 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const profileRef = doc(db, 'userProfiles', user.uid);
        const profileDoc = await getDoc(profileRef);
        
        if (!profileDoc.exists()) {
          console.log("No profile record found. Redirecting to form setup.");
          setLoading(false);
          // FIX: Your App.jsx route path is '/profile', so changing redirect path to match it!
          navigate('/profile');
          return;
        }

        const activeProfile = profileDoc.data();
        setProfile(activeProfile);

        const goalRef = doc(db, 'userGoals', user.uid);
        const goalDoc = await getDoc(goalRef);
        let activeGoal = { dailyCalories: 2000, dailyProtein: 120, dailyCarbs: 250, dailyFats: 65 };
        
        if (goalDoc.exists()) {
          activeGoal = goalDoc.data();
          setGoal(activeGoal);
        }

        fetchMealsForDate(user, selectedDate, activeProfile, activeGoal);

      } catch (err) {
        console.error("Initialization check crashed:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, selectedDate, fetchMealsForDate]);

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const checkIsToday = isToday(selectedDate);
  
  const activeCaloriesGoal = goal?.dailyCalories || 2000;
  const isGoalBreached = totals.cal > activeCaloriesGoal;
  const calPercent = Math.min((totals.cal / activeCaloriesGoal) * 100, 100);
  
  const activeProteinGoal = goal?.dailyProtein || 120;
  const activeCarbsGoal = goal?.dailyCarbs || 250;
  const activeFatsGoal = goal?.dailyFats || 65;
  const nutritionScore = meals.length === 0 ? 0 : Math.round((Math.min((totals.pro/activeProteinGoal)*100,100) + Math.min((totals.carb/activeCarbsGoal)*100,100)) / 2);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#2e7d32' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #2e7d32', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
          <h2>⏳ Syncing Health Dashboard Data...</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Please wait while we calibrate secure network parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f4f7f6 0%, #e9efe0 100%)', fontFamily: 'sans-serif', color: '#2c3e50' }}>

      <div style={{ background: isGoalBreached ? 'linear-gradient(90deg, #b71c1c, #d32f2f)' : 'linear-gradient(90deg, #2e7d32, #1b5e20)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.5s ease' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>🥗 AI Nutrition Analyser</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '4px 0 0' }}>Active Account Node: {profile?.name || 'User'}</p>
        </div>
        {/* FIX: Changing header navigation to /profile too! */}
        <button onClick={() => navigate('/profile')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>👤 Edit Targets</button>
      </div>

      <div style={{ padding: '24px', maxWidth: '750px', margin: '0 auto' }}>

        {isGoalBreached && (
          <div style={{ background: '#ffebee', border: '2px solid #c62828', color: '#b71c1c', padding: '16px', borderRadius: '12px', marginBottom: '16px', fontWeight: 'bold', fontSize: '14px' }}>
            ⚠️ WARNING PARAMETER LIMIT ALERT: Total intake has exceeded your self-defined configuration envelope ({activeCaloriesGoal} kcal)!
          </div>
        )}

        <div style={{ background: '#e8f5e9', borderLeft: '5px solid #2e7d32', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontStyle: 'italic' }}>
          ✨ "{aiInsights.motivationalQuote}"
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e0e0e0', fontSize: '12px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>📋 Account Clinical Parameters</h4>
            <p style={{ margin: '4px 0' }}><strong>Basal Bio Status:</strong> Age {profile?.age} | Sex {profile?.gender} | BMI {profile?.bmi}</p>
            <p style={{ margin: '4px 0' }}><strong>Clinical Condition Flags:</strong> <span style={{ color: '#c62828', fontWeight: 'bold' }}>{profile?.medicalConditions || 'None'}</span></p>
          </div>
          
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#757575' }}>INTAKE ADHERENCE CALIBRATION</span>
            <div style={{ fontSize: '38px', fontWeight: '900', color: isGoalBreached ? '#c62828' : '#2e7d32' }}>{nutritionScore}%</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e0e0e0' }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>📅 Active Filter: {checkIsToday ? '🌟 Today' : selectedDate}</p>
          <input type="date" value={selectedDate} max={new Date().toISOString().split('T')[0]} onChange={handleDateChange} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ background: isGoalBreached ? '#fffbfa' : 'white', borderRadius: '20px', padding: '24px', marginBottom: '16px', textAlign: 'center', border: isGoalBreached ? '2px solid #ef5350' : '1px solid #e0e0e0' }}>
          <p style={{ color: '#757575', fontSize: '12px', fontWeight: '700', margin: '0 0 4px', textTransform: 'uppercase' }}>Total Nutrients Intake Volume Logged Today</p>
          <h2 style={{ fontSize: '48px', fontWeight: '900', color: isGoalBreached ? '#c62828' : '#1b5e20', margin: '0 0 4px' }}>
            {totals.cal} <span style={{ fontSize: '18px', fontWeight: 'normal', color: '#757575' }}>/ user setup limit: {activeCaloriesGoal} kcal</span>
          </h2>
          <div style={{ background: '#f5f5f5', borderRadius: '10px', height: '12px', overflow: 'hidden', margin: '12px 0' }}>
            <div style={{ background: isGoalBreached ? '#d32f2f' : '#2e7d32', width: `${calPercent}%`, height: '12px' }}></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Protein Consumed 💪', val: totals.pro, target: activeProteinGoal, color: '#2e7d32', bg: '#e8f5e9' },
            { label: 'Carbs Consumed ⚡', val: totals.carb, target: activeCarbsGoal, color: '#ef6c00', bg: '#fff3e0' },
            { label: 'Fats Consumed 🫙', val: totals.fat, target: activeFatsGoal, color: '#c2185b', bg: '#fce4ec' }
          ].map((macro, idx) => (
            <div key={idx} style={{ background: macro.bg, borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#616161' }}>{macro.label}</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: macro.color, margin: '4px 0' }}>{macro.val}g</div>
              <span style={{ fontSize: '10px', color: '#757575' }}>User Bound: {macro.target}g</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: isGoalBreached ? '#c62828' : '#1b5e20', fontWeight: '700' }}>💡 Clinical Evaluation & Boundary Checks</h3>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', color: '#666' }}>MEDICAL AWARE EVALUATION STATUS</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#2c3e50', fontWeight: '500' }}>{aiInsights.dailyAnalysis}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', color: '#666' }}>LIVE TARGET SYSTEM ADVICE</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#2c3e50', fontWeight: '500' }}>{aiInsights.tomorrowTips}</p>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#2c3e50' }}>🍽️ Custom Food Stream Inventory</h3>
          {meals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', padding: '12px 0' }}>No manual parameters saved for this calendar index.</p>
          ) : (
            meals.map((meal, index) => (
              <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < meals.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{mealIcons[index % mealIcons.length]}</span>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '14px' }}>{meal.meal}</h5>
                    <span style={{ fontSize: '11px', color: '#757575' }}>Protein: {meal.manualProtein || 0}g | Carbs: {meal.manualCarbs || 0}g</span>
                  </div>
                </div>
                <div style={{ background: '#f5f5f5', fontWeight: 'bold', fontSize: '12px', padding: '4px 10px', borderRadius: '8px' }}>{meal.manualCalories || 0} kcal</div>
              </div>
            ))
          )}
        </div>

        {checkIsToday && (
          <button onClick={() => navigate('/meal-input')} style={{ width: '100%', padding: '14px', marginTop: '16px', borderRadius: '12px', background: isGoalBreached ? '#d32f2f' : '#2e7d32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
            + Log Custom Meal Entry Manually 🍽️
          </button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;