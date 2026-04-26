import { Outlet, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useLocation } from 'react-router';
import { useT } from '../translations';
import { useEffect } from 'react';

function usePageTitle(pathname: string, t: ReturnType<typeof useT>): string {
  if (pathname === '/') return t.dashboard;
  if (pathname.startsWith('/opponent-analysis')) return t.opponentAnalysis;
  if (pathname.startsWith('/my-assignments')) return t.myAssignments;
  if (pathname.startsWith('/squad-assignments')) return t.squadAssignments;
  if (pathname.startsWith('/match-library')) return t.matchLibrary;
  if (pathname.startsWith('/settings')) return t.settings;
  if (pathname.startsWith('/player-comparison')) return 'Player Comparison';
  return t.appName;
}

export function Layout() {
  const { colors, language, isLoggedIn } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT(language);
  const title = usePageTitle(location.pathname, t);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div
      className="ucl-app"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <Sidebar />
      {/* Main content area — offset for fixed sidebar */}
      <div style={{ marginLeft: '60px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <TopBar title={title} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}