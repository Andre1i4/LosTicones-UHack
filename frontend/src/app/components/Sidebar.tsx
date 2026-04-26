import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Crosshair,
  Users,
  Library,
  Settings,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';
import { ClubCrest } from './ClubCrest';

interface NavItem {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  labelKey: 'dashboard' | 'opponentAnalysis' | 'myAssignments' | 'squadAssignments' | 'matchLibrary';
  path: string;
  role?: 'coach' | 'player';
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'dashboard', path: '/' },
  { icon: Crosshair, labelKey: 'opponentAnalysis', path: '/opponent-analysis' },
  { icon: UserCheck, labelKey: 'myAssignments', path: '/my-assignments', role: 'player' },
  { icon: Users, labelKey: 'squadAssignments', path: '/squad-assignments', role: 'coach' },
  { icon: Library, labelKey: 'matchLibrary', path: '/match-library' },
];

export function Sidebar() {
  const { colors, role, darkMode } = useApp();
  const { language } = useApp();
  const t = useT(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const expanded = hovered;

  const filteredItems = NAV_ITEMS.filter(item => !item.role || item.role === role);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: expanded ? '220px' : '60px',
        minWidth: expanded ? '220px' : '60px',
        height: '100vh',
        backgroundColor: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 150ms ease, min-width 150ms ease',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: `1px solid ${colors.border}`,
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <ClubCrest size={32} />
        {expanded && (
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: colors.text,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
            }}
          >
            {t.appName}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {filteredItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          const label = t[item.labelKey];

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                cursor: 'pointer',
                backgroundColor: isActive
                  ? `${colors.gold}12`
                  : 'transparent',
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                borderLeft: isActive ? `3px solid ${colors.gold}` : '3px solid transparent',
                borderRadius: 0,
                transition: 'background-color 150ms ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    `${colors.gold}08`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                color={isActive ? colors.gold : colors.textMuted}
              />
              {expanded && (
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? colors.text : colors.textMuted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings (bottom) */}
      <div style={{ borderTop: `1px solid ${colors.border}`, padding: '8px 0' }}>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            borderLeft: location.pathname === '/settings'
              ? `3px solid ${colors.gold}`
              : '3px solid transparent',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${colors.gold}08`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <Settings
            size={18}
            strokeWidth={1.5}
            color={location.pathname === '/settings' ? colors.gold : colors.textMuted}
          />
          {expanded && (
            <span style={{ fontSize: '13px', color: colors.textMuted, whiteSpace: 'nowrap' }}>
              {t.settings}
            </span>
          )}
        </button>

        {expanded && (
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: 0.5,
            }}
          >
            <ChevronRight size={12} color={colors.textMuted} />
            <span style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.05em' }}>
              COLLAPSE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}