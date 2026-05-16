import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

function ProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: '',
    activityLevel: '',
    customCalorieGoal: '' // User-e manual-ah avanga goal set panna pudhu field!
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.gender || !formData.activityLevel || !formData.medicalConditions) {
      alert("Please fill out all choices completely! ⚠️");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      
      const heightInMeters = Number(formData.height) / 100;
      const bmiCalc = (Number(formData.weight) / (heightInMeters * heightInMeters)).toFixed(1);

      // Save Profile Data
      await setDoc(doc(db, 'userProfiles', user.uid), {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        bmi: bmiCalc,
        medicalConditions: formData.medicalConditions,
        activityLevel: formData.activityLevel,
        updatedAt: new Date().toISOString()
      });
      
      // Secondary Check Profile Goals Setup (Driven manually by user input numbers!)
      const userCalorieTarget = Number(formData.customCalorieGoal) || 2000; 

      await setDoc(doc(db, 'userGoals', user.uid), {
        dailyCalories: userCalorieTarget,
        dailyProtein: Math.round((userCalorieTarget * 0.25) / 4), // Balanced distribution fallback
        dailyCarbs: Math.round((userCalorieTarget * 0.50) / 4),
        dailyFats: Math.round((userCalorieTarget * 0.25) / 9),
        goalLabel: 'User Defined Dynamic Target Boundary'
      });

      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving profile details:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '450px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2e7d32', margin: '0 0 6px 0', textAlign: 'center' }}>📋 Complete Your Profile</h2>
        <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0' }}>Define your health metrics and set your own daily energy thresholds manually.</p>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="Enter full name" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Age</label>
            <input required type="number" name="age" value={formData.age} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Gender</label>
            <select required name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
              <option value="" disabled hidden>-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Height (cm)</label>
            <input required type="number" name="height" value={formData.height} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Weight (kg)</label>
            <input required type="number" name="weight" value={formData.weight} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Activity Level</label>
          <select required name="activityLevel" value={formData.activityLevel} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
            <option value="" disabled hidden>-- Select Activity Level --</option>
            <option value="Sedentary">Sedentary (Little to no exercise)</option>
            <option value="Active">Active (Moderate daily motion)</option>
            <option value="Very Active">Very Active (Intense sports/workout)</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Medical Conditions</label>
          <select required name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
            <option value="" disabled hidden>-- Select Health Condition --</option>
            <option value="None">None</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Thyroid Issues">Thyroid Issues</option>
          </select>
        </div>

        {/* New Field: Manual Calorie Goal Setup */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1b5e20' }}>🎯 Your Daily Calorie Goal (kcal)</label>
          <input required type="number" name="customCalorieGoal" value={formData.customCalorieGoal} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #2e7d32', boxSizing: 'border-box', fontWeight: 'bold' }} placeholder="e.g. 1800 or 2300" />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
          {loading ? 'Saving Metrics...' : 'Save Profile & Open App 🚀'}
        </button>
      </form>
    </div>
  );
}

export default ProfileForm;