import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#0d0d1a' }}>

      {/* Left Panel */}
      <div style={{ width: '50%', background: '#0d0d1a', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>

        {/* Brand */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            🥗 AI Nutrition Analyser
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px' }}>Track meals. Analyse nutrition. Live better.</p>
        </div>

        {/* Meal Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '🍛', name: 'Chicken Rice', cal: '520 kcal', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)', color: '#c084fc' },
            { icon: '🥗', name: 'Caesar Salad', cal: '310 kcal', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)', color: '#f472b6' },
            { icon: '🍳', name: 'Eggs & Toast', cal: '380 kcal', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', color: '#38bdf8' },
            { icon: '🥤', name: 'Protein Shake', cal: '210 kcal', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
          ].map((meal, i) => (
            <div key={i} style={{ background: meal.bg, border: `0.5px solid ${meal.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px' }}>{meal.icon}</div>
              <div style={{ color: meal.color, fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>{meal.name}</div>
              <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{meal.cal}</div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { val: '1420', label: 'Calories', color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
            { val: '87g', label: 'Protein', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
            { val: '44g', label: 'Fats', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, background: stat.bg, border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Right Panel - Login Form */}
      <div style={{ width: '50%', background: '#13131f', borderLeft: '0.5px solid #2a2a3d', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'white', margin: '0 0 6px' }}>Welcome back! 👋</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 28px' }}>Sign in to continue your health journey</p>

          {/* Email */}
          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3d', background: '#1a1a2e', color: 'white', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }}
          />

          {/* Password */}
          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3d', background: '#1a1a2e', color: 'white', fontSize: '14px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }}
          />

          {/* Forgot Password */}
          <p style={{ textAlign: 'right', margin: '0 0 20px' }}>
            <span style={{ color: '#c084fc', fontSize: '12px', cursor: 'pointer' }}>Forgot password?</span>
          </p>

          {/* Login Button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '15px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
            Sign In 🚀
            </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '0.5px', background: '#2a2a3d' }}></div>
            <span style={{ color: '#4b5563', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '0.5px', background: '#2a2a3d' }}></div>
          </div>

          {/* Google Button */}
          <button style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1a1a2e', color: '#d1d5db', fontSize: '13px', fontWeight: '500', border: '1px solid #2a2a3d', cursor: 'pointer' }}>
            🌐 Continue with Google
          </button>

          {/* Sign Up */}
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px' }}>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} style={{ background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>
           Create one free!
          </span>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;