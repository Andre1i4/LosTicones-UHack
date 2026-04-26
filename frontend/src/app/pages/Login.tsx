import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, User, Lock, Key, ChevronRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Role } from '../context/AppContext';
import uclujLogo from '../../imports/UCluj_Sigla1-1.png';
import { apiClient } from '../../services/api';

export function Login() {
  const { loginUser, isLoggedIn } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>('player');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [teamKey, setTeamKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Navigate only AFTER isLoggedIn state has been committed by React
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    if (!teamKey.trim()) {
      setError('Please enter the team access key.');
      return;
    }
    setLoading(true);
    try {
      // Call backend API to authenticate
      const response = await apiClient.login({
        name: name.trim(),
        password,
        teamKey,
        role: selectedRole,
      });

      if (response.success) {
        // Store token if needed
        localStorage.setItem('auth_token', response.token);
        loginUser(name.trim(), selectedRole);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(`Login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Background: faint pitch lines */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}
        width="100%"
        height="100%"
        viewBox="0 0 1000 660"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x="70" y="50" width="860" height="560" fill="none" stroke="white" strokeWidth="2" />
        <line x1="500" y1="50" x2="500" y2="610" stroke="white" strokeWidth="1.5" />
        <circle cx="500" cy="330" r="85" fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx="500" cy="330" r="5" fill="white" />
        <rect x="70" y="215" width="150" height="240" fill="none" stroke="white" strokeWidth="1.5" />
        <rect x="780" y="215" width="150" height="240" fill="none" stroke="white" strokeWidth="1.5" />
        <rect x="70" y="275" width="55" height="120" fill="none" stroke="white" strokeWidth="1.5" />
        <rect x="875" y="275" width="55" height="120" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Top white accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #FFFFFF 50%, transparent 100%)',
        }}
      />

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#111111',
          border: '1px solid #2C2C2C',
          borderRadius: '14px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'clamp(20px, 5vw, 36px) clamp(16px, 5vw, 36px) clamp(16px, 4vw, 28px)',
            borderBottom: '1px solid #1E1E1E',
            textAlign: 'center',
          }}
        >
          {/* Crest placeholder — black & white */}
          <div
            style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 16px',
              position: 'relative',
            }}
          >
            <img
              src={uclujLogo}
              alt="U Cluj"
              style={{ width: '60px', height: '60px', objectFit: 'contain', display: 'block' }}
            />
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 6px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >U-Vision</h1>
          <p style={{ fontSize: '12px', color: '#555555', margin: 0, letterSpacing: '0.05em' }}>
            Football Analysis Platform · Season 2025/26
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(16px, 5vw, 28px) clamp(16px, 5vw, 36px) clamp(20px, 5vw, 32px)' }}>

          {/* Role selector */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Role</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['player', 'coach'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setSelectedRole(r); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '11px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedRole === r ? '#FFFFFF' : '#0A0A0A',
                    borderTop: `1px solid ${selectedRole === r ? '#FFFFFF' : '#2C2C2C'}`,
                    borderRight: `1px solid ${selectedRole === r ? '#FFFFFF' : '#2C2C2C'}`,
                    borderBottom: `1px solid ${selectedRole === r ? '#FFFFFF' : '#2C2C2C'}`,
                    borderLeft: `1px solid ${selectedRole === r ? '#FFFFFF' : '#2C2C2C'}`,
                    transition: 'all 150ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                  }}
                >
                  {r === 'coach'
                    ? <ShieldCheck size={15} strokeWidth={2} color={selectedRole === r ? '#111111' : '#555555'} />
                    : <User size={15} strokeWidth={2} color={selectedRole === r ? '#111111' : '#555555'} />
                  }
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: selectedRole === r ? '#111111' : '#555555',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {r === 'coach' ? 'Coach' : 'Player'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name</label>
            <InputField
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your name..."
              icon={<User size={14} strokeWidth={1.5} color="#555555" />}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Password</label>
            <InputField
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password..."
              icon={<Lock size={14} strokeWidth={1.5} color="#555555" />}
              suffix={
                <button
                  onClick={() => setShowPassword(s => !s)}
                  style={eyeButtonStyle}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff size={14} strokeWidth={1.5} color="#555555" />
                    : <Eye size={14} strokeWidth={1.5} color="#555555" />
                  }
                </button>
              }
            />
          </div>

          {/* Team Access Key */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Team Access Key</label>
            <InputField
              type={showKey ? 'text' : 'password'}
              value={teamKey}
              onChange={e => { setTeamKey(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. UCLUJ2026..."
              icon={<Key size={14} strokeWidth={1.5} color="#555555" />}
              monoWhenHidden={!showKey}
              suffix={
                <button
                  onClick={() => setShowKey(s => !s)}
                  style={eyeButtonStyle}
                  tabIndex={-1}
                >
                  {showKey
                    ? <EyeOff size={14} strokeWidth={1.5} color="#555555" />
                    : <Eye size={14} strokeWidth={1.5} color="#555555" />
                  }
                </button>
              }
            />
            <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#444444' }}>
              Provided by the coaching staff for this season.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#EF444410',
                border: '1px solid #EF444430',
                borderRadius: '6px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: loading ? '#333333' : '#FFFFFF',
              color: '#111111',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'default' : 'pointer',
              transition: 'opacity 150ms ease, background-color 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {loading ? (
              <>
                <div style={spinnerStyle} />
                Signing In...
              </>
            ) : (
              <>
                Enter Platform
                <ChevronRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px clamp(16px, 5vw, 36px)',
            borderTop: '1px solid #1A1A1A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '10px', color: '#333333', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Universitatea Cluj · Internal Use Only
          </span>
          <span style={{ fontSize: '10px', color: '#2C2C2C', fontFamily: 'monospace' }}>v1.0</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 400px) {
          input { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Small shared sub-components ───────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  color: '#555555',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
};

const spinnerStyle: React.CSSProperties = {
  width: '14px',
  height: '14px',
  border: '2px solid #55555540',
  borderTopColor: '#555555',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  monoWhenHidden?: boolean;
}

function InputField({ type, value, onChange, onKeyDown, placeholder, icon, suffix, monoWhenHidden }: InputFieldProps) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: suffix ? '13px 44px 13px 38px' : '13px 14px 13px 38px',
          backgroundColor: '#0A0A0A',
          border: '1px solid #2C2C2C',
          borderRadius: '8px',
          fontSize: '16px',
          color: '#F0F0F0',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: (monoWhenHidden && type === 'password') ? 'monospace' : 'inherit',
          letterSpacing: (monoWhenHidden && type === 'password') ? '0.2em' : 'normal',
          transition: 'border-color 150ms ease',
          WebkitAppearance: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = '#FFFFFF50')}
        onBlur={e => (e.target.style.borderColor = '#2C2C2C')}
      />
      {suffix}
    </div>
  );
}