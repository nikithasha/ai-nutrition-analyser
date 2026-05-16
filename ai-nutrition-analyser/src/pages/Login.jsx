import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const veggies = ['🥕', '🥦', '🍅', '🫑', '🥑', '🌽', '🍆', '🥒'];

function Loader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => { setTimeout(() => setVisible(false), 2500); }, []);
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #fff9f0, #fff3e0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {['🥕', '🥦', '🍅'].map((v, i) => (
          <span key={i} style={{ fontSize: '52px', display: 'inline-block', animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }}>{v}</span>
        ))}
      </div>
      <div style={{ fontSize: '20px', fontWeight: '700', color: '#e65100' }}>Preparing your nutrition...</div>
      <div style={{ fontSize: '14px', color: '#ff8f00', marginTop: '8px' }}>Loading AI Nutrition Analyser 🌿</div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }`}</style>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 50%, #fff0e6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <Loader />

      {/* Floating veggie decorations */}
      {veggies.map((v, i) => (
        <div key={i} style={{ position: 'fixed', fontSize: '32px', opacity: 0.15, top: `${10 + (i * 11)}%`, left: i % 2 === 0 ? `${2 + i}%` : 'auto', right: i % 2 !== 0 ? `${2 + i}%` : 'auto', animation: `float ${3 + i * 0.3}s ease-in-out infinite`, pointerEvents: 'none' }}>
          {v}
        </div>
      ))}

      <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(230,81,0,0.15)', border: '1.5px solid #ffe0b2', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🥗</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e65100', margin: '0 0 4px' }}>AI Nutrition Analyser</h1>
          <p style={{ color: '#ff8f00', fontSize: '14px', margin: 0 }}>Track meals. Analyse nutrition. Live better. 🌿</p>
        </div>

        {/* Veggie row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
          {['🥕', '🥦', '🍅', '🫑'].map((v, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #fff9f0, #fff3e0)', borderRadius: '12px', padding: '8px 10px', fontSize: '22px', border: '1.5px solid #ffe0b2', textAlign: 'center', animation: `float ${2 + i * 0.2}s ease-in-out infinite` }}>
              {v}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fff3e0', border: '1.5px solid #ffb74d', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#e65100', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px', fontWeight: '600' }}>📧 Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
        />

        <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px', fontWeight: '600' }}>🔒 Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #ffe0b2', background: '#fff9f0', fontSize: '14px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
        />

        <p style={{ textAlign: 'right', margin: '0 0 20px' }}>
          <span style={{ color: '#ff8f00', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Forgot password?</span>
        </p>

        <button
          onClick={async () => {
            if (!email || !password) { setError('Please fill in all fields!'); return; }
            try {
              setLoading(true); setError('');
              await signInWithEmailAndPassword(auth, email, password);
              navigate('/dashboard');
            } catch (err) {
              setError('Invalid email or password!');
              setLoading(false);
            }
          }}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', background: loading ? '#ffcc80' : 'linear-gradient(90deg, #ff8f00, #e65100)', color: 'white', fontSize: '16px', fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px', boxShadow: '0 4px 15px rgba(230,81,0,0.3)' }}>
          {loading ? '🌿 Signing In...' : 'Sign In 🚀'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#ffe0b2' }}></div>
          <span style={{ color: '#ccc', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#ffe0b2' }}></div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'white', color: '#555', fontSize: '14px', fontWeight: '600', border: '1.5px solid #ffe0b2', cursor: 'pointer', marginBottom: '20px' }}>
          🌐 Continue with Google
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', margin: 0 }}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')} style={{ color: '#e65100', fontWeight: '700', cursor: 'pointer' }}>
            Create one free! 🎉
          </span>
        </p>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

export default Login;