import React, { useState } from 'react';
import Button from '../atoms/Button';

export function AuthModal({ onLoginSuccess, onWorkOffline }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Simulate contacting Sync server
    try {
      // We check if the Sync REST backend is running by pinging /health
      const response = await fetch('http://localhost:8080/health').catch(() => null);
      
      if (!response || !response.ok) {
        throw new Error('Sync server is unreachable. Please verify Sync backend is running or continue offline.');
      }

      const data = await response.json();
      console.log('Sync backend healthcheck response:', data);

      if (activeTab === 'register' && password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      // Successful simulated auth
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          username: username || 'User',
          token: 'mock-jwt-token-12345'
        });
      }, 1000);

    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication failed.');
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(5, 7, 12, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const modalContentStyle = {
    width: '420px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--panel-border)',
    marginBottom: '0.5rem',
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '0.75rem',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
    borderBottom: active ? '2px solid var(--primary-color)' : 'none',
    transition: 'all 0.2s',
  });

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  };

  const inputStyle = {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--panel-border)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.9rem',
  };

  return (
    <div style={modalOverlayStyle}>
      <div className="glass-panel" style={modalContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
            MebliX Desktop
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Welcome to the furniture geometry workshop</p>
        </div>

        <div style={tabContainerStyle}>
          <div style={tabStyle(activeTab === 'login')} onClick={() => { setActiveTab('login'); setErrorMessage(''); }}>Sign In</div>
          <div style={tabStyle(activeTab === 'register')} onClick={() => { setActiveTab('register'); setErrorMessage(''); }}>Register</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={inputGroupStyle}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Username / Email</label>
            <input 
              type="text" 
              required 
              style={inputStyle} 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. designer123"
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              required 
              style={inputStyle} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          {activeTab === 'register' && (
            <div style={inputGroupStyle}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input 
                type="password" 
                required 
                style={inputStyle} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
          )}

          {errorMessage && (
            <div style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errorMessage}
            </div>
          )}

          <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
            {isLoading ? 'Connecting...' : activeTab === 'login' ? 'Sign In & Sync' : 'Register & Sync'}
          </Button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Or continue without synchronization</span>
          <Button variant="outline" onClick={onWorkOffline} style={{ width: '100%' }}>
            Work Offline (Local Mode)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
