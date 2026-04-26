import { Sun, Moon, LogOut } from 'lucide-react';
import { useApp, type Language } from '../context/AppContext';
import { useT } from '../translations';
import { useNavigate } from 'react-router';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { colors, darkMode, toggleDarkMode, language, setLanguage, role, userName, logout } = useApp();
  const t = useT(language);
  const navigate = useNavigate();

  const gold = colors.gold;

  const initials = userName
    ? userName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : (role === 'coach' ? 'CO' : 'PL');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        height: '56px',
        backgroundColor: colors.sidebar,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: colors.text,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {(['RO', 'EN'] as Language[]).map((lang, i) => (
            <span key={lang} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && (
                <span style={{ color: colors.border, fontSize: '12px' }}>/</span>
              )}
              <button
                onClick={() => setLanguage(lang)}
                style={{
                  fontSize: '12px',
                  fontWeight: language === lang ? 600 : 400,
                  color: language === lang ? gold : colors.textMuted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 0',
                  transition: 'color 150ms ease',
                }}
              >
                {lang}
              </button>
            </span>
          ))}
        </div>

        {/* Dark/light toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            color: colors.textMuted,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = gold;
            (e.currentTarget as HTMLButtonElement).style.color = gold;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
            (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted;
          }}
        >
          {darkMode
            ? <Sun size={15} strokeWidth={1.5} />
            : <Moon size={15} strokeWidth={1.5} />}
        </button>

        {/* User avatar with name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {userName && (
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              {userName}
            </span>
          )}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: colors.navy,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: colors.gold,
                letterSpacing: '0.02em',
              }}
            >
              {initials}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              color: colors.textMuted,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#DC2626';
              (e.currentTarget as HTMLButtonElement).style.color = '#DC2626';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
              (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted;
            }}
          >
            <LogOut size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}