import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

function DailyInsights() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [goal, setGoal] = useState(null);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate('/'); return; }

        const [profileSnap, goalSnap] = await Promise.all([
          getDoc(doc(db, 'userProfiles', user.uid)),
          getDoc(doc(db, 'userGoals', user.uid)),
        ]);

        const profileData = profileSnap.exists() ? profileSnap.data() : null;
        const goalData = goalSnap.exists() ? goalSnap.data() : { dailyCalories: 2000, dailyProtein: 120, dailyCarbs: 250, dailyFats: 65 };

        setProfile(profileData);
        setGoal(goalData);

        const today = new Date().toISOString().split('T')[0];
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(collection(db, 'meals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const allMeals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const todayMeals = allMeals.filter(meal => {
          if (!meal.createdAt) return false;
          const mealDate = meal.createdAt.toDate ? meal.createdAt.toDate() : new Date(meal.createdAt);
          return mealDate >= startOfDay && mealDate <= endOfDay;
        });

        let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0;
        todayMeals.forEach(m => {
          if (m.nutrition) {
            cal += m.nutrition.calories || 0;
            pro += m.nutrition.protein || 0;
            carb += m.nutrition.carbs || 0;
            fat += m.nutrition.fats || 0;
            fib += m.nutrition.fiber || 0;
          }
        });
        setTotals({ cal, pro, carb, fat, fib, mealCount: todayMeals.length });

        const mealsDescription = todayMeals.map(m => m.meal).join(', ') || 'No meals logged today';
        const conditionsText = profileData?.conditions?.length > 0
          ? profileData.conditions.join(', ')
          : 'None';

        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `You are a personal nutrition coach. Based on this user's daily nutrition data, give personalised end-of-day insights.

User Profile:
- Name: ${profileData?.name || 'User'}
- Age: ${profileData?.age || 'Unknown'}
- Gender: ${profileData?.gender || 'Unknown'}
- Height: ${profileData?.height || 'Unknown'} cm
- Weight: ${profileData?.weight || 'Unknown'} kg
- Activity Level: ${profileData?.activityLevel || 'Unknown'}
- Medical Conditions: ${conditionsText}

Today's Goal: ${goalData.goalLabel || 'Maintain Weight'}
Daily Targets: ${goalData.dailyCalories} kcal, ${goalData.dailyProtein}g protein, ${goalData.dailyCarbs}g carbs, ${goalData.dailyFats}g fats

Today's Intake:
- Calories: ${cal} kcal (target: ${goalData.dailyCalories})
- Protein: ${pro}g (target: ${goalData.dailyProtein}g)
- Carbs: ${carb}g (target: ${goalData.dailyCarbs}g)
- Fats: ${fat}g (target: ${goalData.dailyFats}g)
- Fiber: ${fib}g
- Meals eaten: ${mealsDescription}

Give a JSON response with exactly this format:
{
  "greeting": "Personalised greeting with their name",
  "overallScore": number between 1-100,
  "overallMessage": "one encouraging sentence about today",
  "insights": [
    {
      "icon": "single emoji",
      "title": "short title",
      "message": "personalised advice based on their data and medical conditions",
      "type": "good or warning or info"
    }
  ],
  "tomorrowTips": [
    "tip 1 based on what they lacked today",
    "tip 2 based on their medical conditions if any",
    "tip 3 general healthy tip"
  ],
  "motivationalQuote": "short motivational quote for their goal"
}
Return ONLY the JSON, nothing else.`
          }]
        });

        const text = response.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        setInsights(JSON.parse(clean));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    generateInsights();
  }, [navigate]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff9f0, #ffecd2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
          {['🥕', '🧠', '✨'].map((v, i) => (
            <span key={i} style={{ fontSize: '44px', display: 'inline-block', animation: `bounce 0.8s ease-in-out ${i * 0.2}s infinite` }}>{v}</span>
          ))}
        </div>
        <p style={{ color: '#e65100', fontWeight: '800', fontSize: '20px', margin: '0 0 8px' }}>AI is analysing your day...</p>
        <p style={{ color: '#ff8f00', fontSize: '14px', margin: 0 }}>Generating personalised insights 🌿</p>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-18px) rotate(5deg)} }`}</style>
    </div>
  );

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
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0 }}>🧠 Daily AI Insights</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: '2px 0 0' }}>Personalised for you!</p>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        {insights && (
          <>
            {/* Greeting & Score */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: '0 8px 30px rgba(230,81,0,0.12)', border: '1.5px solid #ffe0b2', textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>
                {insights.overallScore >= 80 ? '🌟' : insights.overallScore >= 60 ? '👍' : '💪'}
              </div>
              <h2 style={{ color: '#e65100', fontSize: '20px', fontWeight: '800', margin: '0 0 8px' }}>{insights.greeting}</h2>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px' }}>{insights.overallMessage}</p>

              {/* Score */}
              <div style={{ background: '#fff3e0', borderRadius: '16px', padding: '16px', marginBottom: '12px' }}>
                <p style={{ color: '#ff8f00', fontSize: '12px', fontWeight: '700', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Nutrition Score</p>
                <div style={{ fontSize: '48px', fontWeight: '800', color: insights.overallScore >= 80 ? '#2e7d32' : insights.overallScore >= 60 ? '#f57f17' : '#e65100', margin: '0 0 8px' }}>
                  {insights.overallScore}/100
                </div>
                <div style={{ background: '#ffe0b2', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ background: insights.overallScore >= 80 ? 'linear-gradient(90deg, #4caf50, #2e7d32)' : insights.overallScore >= 60 ? 'linear-gradient(90deg, #ff8f00, #f57f17)' : 'linear-gradient(90deg, #ef5350, #e65100)', width: `${insights.overallScore}%`, height: '12px', borderRadius: '8px', transition: 'width 1.5s ease' }}></div>
                </div>
              </div>

              {/* Today's summary */}
              {totals && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: '🔥 Cal', val: totals.cal, color: '#e65100', bg: '#fff3e0' },
                    { label: '💪 Pro', val: totals.pro + 'g', color: '#2e7d32', bg: '#e8f5e9' },
                    { label: '⚡ Carb', val: totals.carb + 'g', color: '#f57f17', bg: '#fff8e1' },
                    { label: '🍽️ Meals', val: totals.mealCount, color: '#1565c0', bg: '#e3f2fd' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 8px 30px rgba(230,81,0,0.12)', border: '1.5px solid #ffe0b2' }}>
              <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 14px' }}>🤖 Personalised Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {insights.insights.map((insight, i) => (
                  <div key={i} style={{
                    background: insight.type === 'good' ? '#e8f5e9' : insight.type === 'warning' ? '#fff8e1' : '#e3f2fd',
                    border: `1.5px solid ${insight.type === 'good' ? '#a5d6a7' : insight.type === 'warning' ? '#ffe082' : '#90caf9'}`,
                    borderRadius: '14px', padding: '14px 16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '22px' }}>{insight.icon}</span>
                      <span style={{
                        fontWeight: '800', fontSize: '14px',
                        color: insight.type === 'good' ? '#2e7d32' : insight.type === 'warning' ? '#f57f17' : '#1565c0'
                      }}>{insight.title}</span>
                    </div>
                    <p style={{ color: '#555', fontSize: '13px', margin: 0, lineHeight: '1.5', paddingLeft: '32px' }}>{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tomorrow Tips */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 8px 30px rgba(230,81,0,0.12)', border: '1.5px solid #ffe0b2' }}>
              <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 14px' }}>🌅 Tips for Tomorrow</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {insights.tomorrowTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: '#fff9f0', borderRadius: '12px', border: '1.5px solid #ffe0b2' }}>
                    <span style={{ fontSize: '20px', minWidth: '24px' }}>
                      {i === 0 ? '🥗' : i === 1 ? '💊' : '⭐'}
                    </span>
                    <p style={{ color: '#555', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Quote */}
            <div style={{ background: 'linear-gradient(135deg, #ff8f00, #e65100)', borderRadius: '20px', padding: '24px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 8px 25px rgba(230,81,0,0.3)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
              <p style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
                "{insights.motivationalQuote}"
              </p>
            </div>

            {/* Buttons */}
            <button
              onClick={() => navigate('/meal-input')}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(90deg, #4caf50, #2e7d32)', color: 'white', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 6px 20px rgba(46,125,50,0.35)' }}>
              + Log Another Meal 🍽️
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'white', color: '#e65100', fontSize: '16px', fontWeight: '800', border: '2px solid #ffb74d', cursor: 'pointer' }}>
              🏠 Back to Dashboard
            </button>
          </>
        )}

        {!insights && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', border: '1.5px solid #ffe0b2' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🥗</div>
            <p style={{ color: '#e65100', fontWeight: '800', fontSize: '18px', margin: '0 0 8px' }}>No meals logged today!</p>
            <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 20px' }}>Log some meals first to get AI insights</p>
            <button
              onClick={() => navigate('/meal-input')}
              style={{ padding: '14px 28px', borderRadius: '16px', background: 'linear-gradient(90deg, #ff8f00, #e65100)', color: 'white', fontSize: '15px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
              + Log First Meal 🍽️
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-18px) rotate(5deg)} }`}</style>
    </div>
  );
}

export default DailyInsights;