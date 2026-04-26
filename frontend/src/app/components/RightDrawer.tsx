import { X, TrendingUp, BarChart2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';
import type { OpponentPlayer } from '../data/mockData';
import { StatRow } from './StatRow';
import { useNavigate } from 'react-router';
import { apiClient } from '../../services/api';

interface RightDrawerProps {
  player: OpponentPlayer | null;
  open: boolean;
  onClose: () => void;
  onAssign: () => void;
  isAssigned: boolean;
}

function StrengthTag({ label, colors }: { label: string; colors: ReturnType<typeof useApp>['colors'] }) {
  return (
    <span className="font-[Alexandria]"
      style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 500,
        color: colors.textMuted,
        backgroundColor: colors.border,
        border: `1px solid ${colors.border}`,
        borderRadius: '3px',
        padding: '3px 8px',
        marginRight: '4px',
        marginBottom: '4px',
        letterSpacing: '0.01em',
      }}
    >
      {label}
    </span>
  );
}

// Simple SVG heatmap placeholder
function HeatmapPlaceholder({ colors }: { colors: ReturnType<typeof useApp>['colors'] }) {
  return (
    <div
      style={{
        width: '100%',
        height: '90px',
        backgroundColor: '#1A3D2B',
        borderRadius: '4px',
        border: `1px solid ${colors.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 90">
        {/* Pitch outline */}
        <rect x="5" y="3" width="190" height="84" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="5" y1="45" x2="195" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <circle cx="100" cy="45" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        {/* Heat spots */}
        <radialGradient id="h1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="h2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D97706" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="h3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
        </radialGradient>
        <ellipse cx="110" cy="30" rx="35" ry="22" fill="url(#h1)" />
        <ellipse cx="75" cy="48" rx="28" ry="18" fill="url(#h2)" />
        <ellipse cx="130" cy="60" rx="22" ry="15" fill="url(#h3)" />
        {/* Label */}
        <text x="100" y="84" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7"
          fontFamily="'IBM Plex Sans', sans-serif" letterSpacing="0.08em">
          HEATMAP · SEASON 2025/26
        </text>
      </svg>
    </div>
  );
}

export function RightDrawer({ player, open, onClose, onAssign, isAssigned }: RightDrawerProps) {
  const { colors, language, role } = useApp();
  const t = useT(language);
  const navigate = useNavigate();
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (!player) return;
    
    setLoadingAI(true);
    apiClient.getPlayerAnalysis(player.name)
      .then(data => {
        setAiAnalysis(data.analysis || 'Analysis unavailable');
      })
      .catch(err => {
        console.error('Failed to fetch AI analysis:', err);
        setAiAnalysis('Analysis unavailable at this time');
      })
      .finally(() => setLoadingAI(false));
  }, [player?.id]);

  return (
    <div
      style={{
        width: open ? '360px' : '0',
        minWidth: open ? '360px' : '0',
        height: '100%',
        backgroundColor: colors.elevated,
        borderLeft: open ? `1px solid ${colors.border}` : 'none',
        overflow: 'hidden',
        transition: 'width 200ms ease, min-width 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {player && open && (
        <div style={{ width: '360px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="font-[Alexandria]"
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: colors.textMuted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  #{player.number} · {player.positionShort}
                </span>
                {isAssigned && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: colors.gold,
                      backgroundColor: `${colors.gold}18`,
                      border: `1px solid ${colors.gold}40`,
                      borderRadius: '3px',
                      padding: '1px 5px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {t.assigned.toUpperCase()}
                  </span>
                )}
              </div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.text,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {player.name}
              </h2>
              <p className="font-[Alexandria] font-normal" style={{ fontSize: '12px', color: colors.textMuted, margin: '3px 0 0 0' }}>
                {player.position} · Age {player.age} · {player.foot} foot
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.textMuted,
                padding: '4px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {/* Heatmap */}
            

            {/* Season Stats */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t.playerStats}
              </p>
              <StatRow label={t.goals} value={player.stats.goals} compact />
              <StatRow label={t.assists} value={player.stats.assists} compact />
              <StatRow label={t.xg} value={player.stats.xg.toFixed(1)} compact trend="up" highlight />
              <StatRow label={t.passAcc} value={`${player.stats.passAcc}%`} compact />
              <StatRow label={t.duelsWon} value={`${player.stats.duelsWon}%`} compact />
              <StatRow label={t.aerialDuels} value={`${player.stats.aerialDuels}%`} compact />
              <StatRow label={t.distanceCovered} value={player.stats.distanceCovered.toFixed(1)} unit="km/g" compact />
              {player.stats.dribblesPerGame !== undefined && (
                <StatRow label={t.dribblesPerGame} value={player.stats.dribblesPerGame.toFixed(1)} compact trend="up" />
              )}
              {player.stats.crossingAcc !== undefined && (
                <StatRow label={t.crossingAcc} value={`${player.stats.crossingAcc}%`} compact />
              )}
              {player.stats.shotsOnTarget !== undefined && (
                <StatRow label={t.shotsOnTarget} value={`${player.stats.shotsOnTarget}%`} compact />
              )}
            </div>

            {/* Key Strengths */}
            <div style={{ marginBottom: '20px' }}>
              <p className="font-[Alexandria]" style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t.strengths}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {player.strengths.map(s => (
                  <StrengthTag key={s} label={s} colors={colors} />
                ))}
              </div>

              {/* AI Scout note */}
              {(aiAnalysis || loadingAI) && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    backgroundColor: `${colors.border}40`,
                    border: `1px solid ${colors.border}`,
                    borderLeft: `3px solid ${colors.gold}`,
                    borderRadius: '4px',
                  }}
                >
                  <p style={{ fontSize: '10px', fontWeight: 700, color: colors.gold, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    AI Analysis
                  </p>
                  {loadingAI ? (
                    <p style={{ fontSize: '12px', color: colors.text, margin: 0, lineHeight: 1.55, opacity: 0.7 }}>
                      Loading analysis...
                    </p>
                  ) : (
                    <p style={{ fontSize: '12px', color: colors.text, margin: 0, lineHeight: 1.55, opacity: 0.9 }}>
                      {aiAnalysis}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Compare button — always visible */}
            <button
              onClick={() => navigate(`/player-comparison/${player.id}`)}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: colors.text,
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.04em',
                borderTop: `1px solid ${colors.border}`,
                borderRight: `1px solid ${colors.border}`,
                borderBottom: `1px solid ${colors.border}`,
                borderLeft: `1px solid ${colors.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${colors.gold}15`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${colors.gold}60`;
                (e.currentTarget as HTMLButtonElement).style.color = colors.gold;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
                (e.currentTarget as HTMLButtonElement).style.color = colors.text;
              }}
            >
              <BarChart2 size={14} />
              Compare Stats
            </button>

            {/* Coach-only: Assign button */}
            {role === 'coach' && (
              <button
                onClick={onAssign}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: colors.gold,
                  color: '#0B0F1A',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderLeft: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'opacity 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <TrendingUp size={14} />
                {isAssigned ? `Re-${t.assignPlayer}` : t.assignPlayer}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}