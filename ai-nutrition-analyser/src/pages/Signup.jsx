import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 50%, #f1fff6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>

      {/* Floating veggies */}
      {['🥦', '🥕', '🌽', '🥑', '🍅'].map((v, i) => (
        <div key={i} style={{ position: 'fixed', fontSize: '30px', opacity: 0.12, top: `${15 + i * 14}%`, left: i % 2 === 0 ? `${3 + i}%` : 'auto', right: i % 2 !== 0 ? `${3 + i}%` : 'auto', animation: `float ${3 + i * 0.4}s ease-in-out infinite`, pointerEvents: 'none' }}>
          {v}
        </div>
      ))}

      <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(46,125,50,0.15)', border: '1.5px solid #c8e6c9', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🌱</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#2e7d32', margin: '0 0 4px' }}>Create Account</h1>
          <p style={{ color: '#4caf50', fontSize: '14px', margin: 0 }}>Start your healthy journey today! 🥗</p>
        </div>

        {error && (
          <div style={{ background: '#f1f8e9', border: '1.5px solid #aed581', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#558b2f', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        {[
          { label: '👤 Full Name', type: 'text', val: name, set: setName, placeholder: 'Your name' },
          { label: '📧 Email Address', type: 'email', val: email, set: setEmail, placeholder: 'you@example.com' },
          { label: '🔒 Password', type: 'password', val: password, set: setPassword, placeholder: 'At least 6 characters' },
        ].map((field, i) => (
          <div key={i}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px', fontWeight: '600' }}>{field.label}</label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={field.val}
              onChange={(e) => field.set(e.target.value)}
              style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #c8e6c9', background: '#f1f8e9', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
            />
          </div>
        ))}

        <button
          onClick={async () => {
            if (!name || !email || !password) { setError('Please fill in all fields!'); return; }
            if (password.length < 6) { setError('Password must be at least 6 characters!'); return; }
            try {
              setLoading(true); setError('');
              await createUserWithEmailAndPassword(auth, email, password);
              navigate('/profile');
            } catch (err) {
              setError(err.message);
              setLoading(false);
            }
          }}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', background: loading ? '#a5d6a7' : 'linear-gradient(90deg, #4caf50, #2e7d32)', color: 'white', fontSize: '16px', fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px', boxShadow: '0 4px 15px rgba(46,125,50,0.3)' }}>
          {loading ? '🌿 Creating...' : 'Create Account 🎉'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', margin: 0 }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/')} style={{ color: '#2e7d32', fontWeight: '700', cursor: 'pointer' }}>
            Sign In 🚀
          </span>
        </p>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

export default Signup;
