import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const medicalConditions = [
  '🩺 Diabetes Type 1', '🩺 Diabetes Type 2', '❤️ Heart Disease',
  '🫁 Asthma', '🦴 Osteoporosis', '🧠 Thyroid Disorder',
  '🩸 Anaemia', '🫀 High Blood Pressure', '⚖️ Obesity',
  '🥛 Lactose Intolerance', '🌾 Gluten Intolerance', '🥜 Nut Allergy',
];

function Profile() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    conditions: [],
    otherCondition: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate('/'); return; }
        const docSnap = await getDoc(doc(db, 'userProfiles', user.uid));
        if (docSnap.exists()) setProfile(docSnap.data());
        setLoading(false);
      } catch (err) { setLoading(false); }
    };
    fetchProfile();
  }, [navigate]);

  const toggleCondition = (condition) => {
    setProfile(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const handleSave = async () => {
    if (!profile.name || !profile.age || !profile.gender) {
      alert('Please fill name, age and gender!');
      return;
    }
    try {
      setSaving(true);
      const user = auth.currentUser;
      await setDoc(doc(db, 'userProfiles', user.uid), {
        ...profile,
        email: user.email,
        updatedAt: new Date(),
      });
      setSaved(true);
      setTimeout(() => { navigate('/goal-setting'); }, 1500);
    } catch (err) {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff9f0, #ffecd2)', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', animation: 'bounce 0.8s ease-in-out infinite' }}>🥕</div>
        <p style={{ color: '#e65100', fontWeight: '700', fontSize: '18px' }}>Loading your profile...</p>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }`}</style>
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
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0 }}>👤 My Profile</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: '2px 0 0' }}>Tell us about yourself for better insights!</p>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff8f00, #e65100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '40px', boxShadow: '0 6px 20px rgba(230,81,0,0.3)' }}>
            {profile.gender === 'Male' ? '👨' : profile.gender === 'Female' ? '👩' : '🧑'}
          </div>
          <p style={{ color: '#e65100', fontSize: '14px', fontWeight: '700', margin: 0 }}>
            {profile.name || 'Your Name'}
          </p>
          <p style={{ color: '#aaa', fontSize: '12px', margin: '2px 0 0' }}>{auth.currentUser?.email}</p>
        </div>

        {/* Basic Info */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 6px 20px rgba(230,81,0,0.1)', border: '1.5px solid #ffe0b2' }}>
          <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 16px' }}>📋 Basic Information</h3>

          {/* Name */}
          <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '6px' }}>👤 Full Name *</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', marginBottom: '14px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
          />

          {/* Age & Gender Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '6px' }}>🎂 Age *</label>
              <input
                type="number"
                placeholder="Years"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '6px' }}>⚤ Gender *</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#333', cursor: 'pointer' }}>
                <option value="">Select</option>
                <option value="Male">Male 👨</option>
                <option value="Female">Female 👩</option>
                <option value="Other">Other 🧑</option>
              </select>
            </div>
          </div>

          {/* Height & Weight Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '6px' }}>📏 Height (cm)</label>
              <input
                type="number"
                placeholder="e.g. 165"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '6px' }}>⚖️ Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
              />
            </div>
          </div>

          {/* BMI Display */}
          {profile.height && profile.weight && (
            <div style={{ background: '#fff3e0', border: '1.5px solid #ffcc80', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#e65100', fontSize: '14px', fontWeight: '700' }}>📊 Your BMI:</span>
              <span style={{ color: '#e65100', fontSize: '20px', fontWeight: '800' }}>
                {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
              </span>
              <span style={{ color: '#888', fontSize: '12px' }}>
                {(() => {
                  const bmi = profile.weight / ((profile.height / 100) ** 2);
                  if (bmi < 18.5) return '⚠️ Underweight';
                  if (bmi < 25) return '✅ Normal';
                  if (bmi < 30) return '⚠️ Overweight';
                  return '🔴 Obese';
                })()}
              </span>
            </div>
          )}

          {/* Activity Level */}
          <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '8px' }}>🏃 Activity Level</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { val: 'sedentary', label: '🪑 Sedentary', desc: 'Little or no exercise' },
              { val: 'light', label: '🚶 Lightly Active', desc: '1-3 days/week exercise' },
              { val: 'moderate', label: '🏃 Moderately Active', desc: '3-5 days/week exercise' },
              { val: 'very', label: '⚡ Very Active', desc: '6-7 days/week exercise' },
            ].map((level) => (
              <div
                key={level.val}
                onClick={() => setProfile({ ...profile, activityLevel: level.val })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', border: profile.activityLevel === level.val ? '2px solid #e65100' : '1.5px solid #ffe0b2', background: profile.activityLevel === level.val ? '#fff3e0' : '#fff9f0', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: profile.activityLevel === level.val ? '#e65100' : '#333' }}>{level.label}</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{level.desc}</div>
                </div>
                {profile.activityLevel === level.val && <span style={{ fontSize: '20px' }}>✅</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Medical Conditions */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 6px 20px rgba(230,81,0,0.1)', border: '1.5px solid #ffe0b2' }}>
          <h3 style={{ color: '#e65100', fontSize: '16px', fontWeight: '800', margin: '0 0 6px' }}>🏥 Medical Conditions</h3>
          <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 14px' }}>Select any conditions you have — AI will personalise your insights!</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {medicalConditions.map((condition) => (
              <div
                key={condition}
                onClick={() => toggleCondition(condition)}
                style={{ padding: '10px 12px', borderRadius: '12px', border: profile.conditions.includes(condition) ? '2px solid #e65100' : '1.5px solid #ffe0b2', background: profile.conditions.includes(condition) ? '#fff3e0' : '#fff9f0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: profile.conditions.includes(condition) ? '#e65100' : '#555', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {profile.conditions.includes(condition) && <span>✅</span>}
                {condition}
              </div>
            ))}
          </div>

          {/* Other condition */}
          <label style={{ fontSize: '13px', color: '#666', fontWeight: '700', display: 'block', marginBottom: '6px' }}>📝 Other conditions (optional)</label>
          <input
            type="text"
            placeholder="Type any other medical condition..."
            value={profile.otherCondition}
            onChange={(e) => setProfile({ ...profile, otherCondition: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
          />
        </div>

        {/* Save Button */}
        {saved ? (
          <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e9', borderRadius: '16px', border: '1.5px solid #a5d6a7' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
            <p style={{ color: '#2e7d32', fontWeight: '800', fontSize: '18px', margin: '0 0 4px' }}>Profile Saved!</p>
            <p style={{ color: '#4caf50', fontSize: '14px', margin: 0 }}>Redirecting to Goal Setting...</p>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: saving ? '#ffcc80' : 'linear-gradient(90deg, #ff8f00, #e65100)', color: 'white', fontSize: '16px', fontWeight: '800', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(230,81,0,0.35)', marginBottom: '12px' }}>
            {saving ? '💾 Saving...' : '✅ Save Profile & Continue'}
          </button>
        )}
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }`}</style>
    </div>
  );
}

export default Profile;