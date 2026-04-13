import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#0d0d1a', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#13131f', border: '0.5px solid #2a2a3d', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: '700', background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 6px' }}>
          🥗 AI Nutrition Analyser
        </h1>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 28px' }}>Create your free account today</p>

        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Full Name</label>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3d', background: '#1a1a2e', color: 'white', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3d', background: '#1a1a2e', color: 'white', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Password</label>
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #2a2a3d', background: '#1a1a2e', color: 'white', fontSize: '14px', marginBottom: '24px', outline: 'none', boxSizing: 'border-box' }}
        />

        <button style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'linear-gradient(90deg, #c084fc, #f472b6)', color: 'white', fontSize: '15px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          Create Account 🎉
        </button>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/')} style={{ background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
}

export default Signup;
