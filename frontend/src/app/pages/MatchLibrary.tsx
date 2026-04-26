import { Library } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';

export function MatchLibrary() {
  const { colors, language } = useApp();
  const t = useT(language);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 56px)',
        gap: '12px',
      }}
    >
      <Library size={36} strokeWidth={1} color={colors.textMuted} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: colors.text, margin: '0 0 6px' }}>
          {t.matchLibrary}
        </h2>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
          {t.comingSoonDesc}
        </p>
      </div>
    </div>
  );
}
