import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,120,255,0.15), transparent 70%)', top: '-100px', left: '-100px' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,255,0.1), transparent 70%)', bottom: '-80px', right: '-80px' }} />

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '50px 46px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #1a6fff, #00c6ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(26,111,255,0.4)',
        }}>
          <span style={{ fontSize: '36px' }}>🛒</span>
        </div>

        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 6px' }}>FreshMart POS</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '28px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Authorized Personnel Only</p>

        {/* Username */}
        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.2px', marginBottom: '8px' }}>USERNAME</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>👤</span>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '13px 16px 13px 42px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', letterSpacing: '1.2px', marginBottom: '8px' }}>PASSWORD</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '13px 42px 13px 42px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
            <span style={{ position: 'absolute', right: '14px', cursor: 'pointer', fontSize: '16px' }} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1a6fff, #00c6ff)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(26,111,255,0.4)' }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '20px' }}>
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
