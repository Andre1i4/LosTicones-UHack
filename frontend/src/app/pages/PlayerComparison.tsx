import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Search, Star, ChevronRight } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { NEXT_MATCH, UCLUJ_PLAYERS } from '../data/mockData';
import type { UClujPlayer, OpponentPlayer, PlayerStats } from '../data/mockData';

// ─── Position compatibility ──────────────────────────────────────────────────
const POS_GROUP: Record<string, string> = {
  GK: 'goalkeeper',
  CB: 'defender', RB: 'defender', LB: 'defender',
  CM: 'midfielder', RM: 'midfielder', LM: 'midfielder',
  RW: 'forward', LW: 'forward', ST: 'forward',
};

const POS_SIMILAR: Record<string, string[]> = {
  GK: ['GK'],
  CB: ['CB'], RB: ['RB', 'RM'], LB: ['LB', 'LM'],
  CM: ['CM', 'RM', 'LM'], RM: ['RM', 'RB', 'CM', 'RW'], LM: ['LM', 'LB', 'CM', 'LW'],
  RW: ['RW', 'RM', 'ST'], LW: ['LW', 'LM', 'ST'], ST: ['ST', 'RW', 'LW'],
};

function posCompatibility(a: string, b: string): number {
  if (a === b) return 100;
  if (POS_SIMILAR[a]?.includes(b)) return 75;
  if (POS_GROUP[a] === POS_GROUP[b]) return 50;
  return 10;
}

// ─── Stat normalization ───────────────────────────────────────────────────────
const MAX_VALS: Record<keyof PlayerStats, number> = {
  goals: 16,
  assists: 12,
  xg: 14,
  passAcc: 100,
  duelsWon: 100,
  aerialDuels: 100,
  distanceCovered: 13,
  dribblesPerGame: 4,
  crossingAcc: 50,
  shotsOnTarget: 70,
};

function normalize(value: number | undefined, key: keyof PlayerStats): number {
  if (value === undefined) return 0;
  return Math.round(Math.min(100, (value / MAX_VALS[key]) * 100));
}

// ─── Radar data builder ───────────────────────────────────────────────────────
interface RadarPoint {
  subject: string;
  ucluj: number;
  opponent: number;
  fullMark: number;
}

function buildRadarData(uStats: PlayerStats, oStats: PlayerStats): RadarPoint[] {
  return [
    { subject: 'Shooting', ucluj: normalize(uStats.goals, 'goals'), opponent: normalize(oStats.goals, 'goals'), fullMark: 100 },
    { subject: 'xG', ucluj: normalize(uStats.xg, 'xg'), opponent: normalize(oStats.xg, 'xg'), fullMark: 100 },
    { subject: 'Passing', ucluj: normalize(uStats.passAcc, 'passAcc'), opponent: normalize(oStats.passAcc, 'passAcc'), fullMark: 100 },
    { subject: 'Duels', ucluj: normalize(uStats.duelsWon, 'duelsWon'), opponent: normalize(oStats.duelsWon, 'duelsWon'), fullMark: 100 },
    { subject: 'Aerial', ucluj: normalize(uStats.aerialDuels, 'aerialDuels'), opponent: normalize(oStats.aerialDuels, 'aerialDuels'), fullMark: 100 },
    { subject: 'Mobility', ucluj: normalize(uStats.distanceCovered, 'distanceCovered'), opponent: normalize(oStats.distanceCovered, 'distanceCovered'), fullMark: 100 },
    { subject: 'Dribbling', ucluj: normalize(uStats.dribblesPerGame, 'dribblesPerGame'), opponent: normalize(oStats.dribblesPerGame, 'dribblesPerGame'), fullMark: 100 },
  ];
}

// ─── Comparison conclusion generator ─────────────────────────────────────────

function buildComparisonConclusion(
  u: UClujPlayer,
  o: OpponentPlayer,
  posScore: number
): string {
  const us = u.stats;
  const os = o.stats;

  // Tally stat wins
  const uWins: string[] = [];
  const oWins: string[] = [];

  if (us.goals > os.goals) uWins.push('scoring');
  else if (os.goals > us.goals) oWins.push('scoring');

  if (us.assists > os.assists) uWins.push('creating chances');
  else if (os.assists > us.assists) oWins.push('creating chances');

  if (us.passAcc > os.passAcc) uWins.push('passing accuracy');
  else if (os.passAcc > us.passAcc) oWins.push('passing accuracy');

  if (us.duelsWon > os.duelsWon) uWins.push('ground duels');
  else if (os.duelsWon > us.duelsWon) oWins.push('ground duels');

  if (us.aerialDuels > os.aerialDuels) uWins.push('aerial duels');
  else if (os.aerialDuels > us.aerialDuels) oWins.push('aerial duels');

  if (us.distanceCovered > os.distanceCovered) uWins.push('work rate');
  else if (os.distanceCovered > us.distanceCovered) oWins.push('work rate');

  // Sentence 1 — overall balance
  let s1: string;
  if (uWins.length > oWins.length) {
    const areas = uWins.slice(0, 2).join(' and ');
    s1 = `${u.name} has a clear advantage in ${areas} this season, making him the stronger option statistically.`;
  } else if (oWins.length > uWins.length) {
    const areas = oWins.slice(0, 2).join(' and ');
    s1 = `${o.name} wins on ${areas} — ${u.name} will need to work hard to match him in those areas.`;
  } else {
    s1 = `These two players are closely matched across the board — the difference will likely be decided in the moment.`;
  }

  // Sentence 2 — position context
  let s2: string;
  if (posScore === 100) {
    s2 = `As a direct positional match, ${u.name} will be directly competing with ${o.name} for the same spaces on the pitch.`;
  } else if (posScore >= 75) {
    s2 = `With a ${posScore}% position match, they'll frequently operate in the same zones — ${u.name} should stay aware of his runs.`;
  } else {
    s2 = `They don't share the same position (${posScore}% match), but ${o.name}'s movement can still affect ${u.name}'s area during transitions.`;
  }

  // Sentence 3 — key threat warning
  const topNote = o.playingStyleNotes?.[0];
  const topStrength = o.strengths[0];
  let s3: string;
  if (topNote) {
    s3 = `Key thing to know: ${topNote.endsWith('.') ? topNote : topNote + '.'}`;
  } else {
    s3 = `Be aware of his ${topStrength.toLowerCase()} — don't give him free space to use it.`;
  }

  return `${s1} ${s2} ${s3}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerAvatar({ name, size = 72, color }: { name: string; size?: number; color: string }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${color}`,
        backgroundColor: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.28,
        fontWeight: 800,
        color,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatCompareRow({
  label,
  uValue,
  oValue,
  colors,
  uBetter,
}: {
  label: string;
  uValue: string;
  oValue: string;
  colors: ReturnType<typeof useApp>['colors'];
  uBetter?: boolean | null;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '8px',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          textAlign: 'right',
          fontSize: '13px',
          fontWeight: uBetter === true ? 700 : 400,
          color: uBetter === true ? colors.gold : colors.text,
          fontFamily: 'monospace',
        }}
      >
        {uValue}
        {uBetter === true && <span style={{ marginLeft: '6px', fontSize: '10px', color: colors.gold }}>▲</span>}
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 600,
          color: colors.textMuted,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          minWidth: '100px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          textAlign: 'left',
          fontSize: '13px',
          fontWeight: uBetter === false ? 700 : 400,
          color: uBetter === false ? '#DC4444' : colors.text,
          fontFamily: 'monospace',
        }}
      >
        {uBetter === false && <span style={{ marginRight: '6px', fontSize: '10px', color: '#DC4444' }}>▲</span>}
        {oValue}
      </div>
    </div>
  );
}

function StrengthBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="font-[Alexandria]"
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 500,
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        marginRight: '6px',
        marginBottom: '6px',
      }}
    >
      {label}
    </span>
  );
}

function SuggestedCard({
  player,
  isSelected,
  onClick,
  score,
  colors,
}: {
  player: UClujPlayer;
  isSelected: boolean;
  onClick: () => void;
  score: number;
  colors: ReturnType<typeof useApp>['colors'];
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        backgroundColor: isSelected ? `${colors.gold}18` : colors.elevated,
        borderTop: isSelected ? `1px solid ${colors.gold}60` : `1px solid ${colors.border}`,
        borderRight: isSelected ? `1px solid ${colors.gold}60` : `1px solid ${colors.border}`,
        borderBottom: isSelected ? `1px solid ${colors.gold}60` : `1px solid ${colors.border}`,
        borderLeft: isSelected ? `3px solid ${colors.gold}` : `3px solid transparent`,
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 150ms ease',
        marginBottom: '6px',
      }}
    >
      <PlayerAvatar name={player.name} size={36} color={isSelected ? colors.gold : colors.textMuted} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isSelected ? colors.gold : colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: colors.textMuted }}>
          #{player.number} · {player.positionShort}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
        {score >= 100 && <Star size={12} color={colors.gold} fill={colors.gold} />}
        <span style={{ fontSize: '10px', color: score >= 75 ? colors.gold : colors.textMuted, fontWeight: 600 }}>
          {score}%
        </span>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PlayerComparison() {
  const { opponentPlayerId } = useParams<{ opponentPlayerId: string }>();
  const navigate = useNavigate();
  const { colors, darkMode } = useApp();

  const opponentPlayer = useMemo<OpponentPlayer | null>(
    () => NEXT_MATCH.players.find(p => p.id === opponentPlayerId) ?? null,
    [opponentPlayerId]
  );

  const sortedUCluj = useMemo(() => {
    if (!opponentPlayer) return UCLUJ_PLAYERS;
    return [...UCLUJ_PLAYERS].sort((a, b) => {
      const sa = posCompatibility(a.positionShort, opponentPlayer.positionShort);
      const sb = posCompatibility(b.positionShort, opponentPlayer.positionShort);
      return sb - sa;
    });
  }, [opponentPlayer]);

  const [selectedUCluj, setSelectedUCluj] = useState<UClujPlayer | null>(() => sortedUCluj[0] ?? null);
  const [search, setSearch] = useState('');

  const filteredUCluj = useMemo(() => {
    const q = search.toLowerCase();
    return sortedUCluj.filter(
      p => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q) || String(p.number).includes(q)
    );
  }, [sortedUCluj, search]);

  if (!opponentPlayer) {
    return (
      <div style={{ padding: '40px', color: colors.text }}>
        <p>Player not found.</p>
        <button onClick={() => navigate(-1)} style={{ color: colors.gold, background: 'none', border: 'none', cursor: 'pointer' }}>← Go back</button>
      </div>
    );
  }

  const radarData = selectedUCluj
    ? buildRadarData(selectedUCluj.stats, opponentPlayer.stats)
    : [];

  const uScore = selectedUCluj
    ? posCompatibility(selectedUCluj.positionShort, opponentPlayer.positionShort)
    : 0;

  const numericCompare = (u: number | undefined, o: number | undefined): boolean | null => {
    if (u === undefined || o === undefined) return null;
    if (u > o) return true;
    if (u < o) return false;
    return null;
  };

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
        backgroundColor: colors.bg,
      }}
    >
      {/* ── Left sidebar: U-Cluj player selector ── */}
      <div
        style={{
          width: '280px',
          minWidth: '280px',
          height: '100%',
          backgroundColor: colors.card,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Back header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
          <button className="font-bold font-[Archivo_Black]"
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.textMuted,
              fontSize: '13px',
              padding: 0,
              marginBottom: '10px',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = colors.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Analysis
          </button>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Select U Cluj Player
          </p>
          <p className="font-[Alexandria] font-bold" style={{ margin: '3px 0 0', fontSize: '12px', color: colors.text }}>
            Best matches for <strong style={{ color: colors.gold }}>{opponentPlayer.name}</strong>
          </p>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players..."
              style={{
                width: '100%',
                padding: '8px 10px 8px 34px',
                backgroundColor: colors.elevated,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                color: colors.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <Search
              size={14}
              strokeWidth={1.5}
              color={colors.textMuted}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Player list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 10px' }}>
          {filteredUCluj.length === 0 ? (
            <p style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', padding: '20px 0' }}>
              No players found.
            </p>
          ) : (
            filteredUCluj.map(p => (
              <SuggestedCard
                key={p.id}
                player={p}
                isSelected={selectedUCluj?.id === p.id}
                onClick={() => setSelectedUCluj(p)}
                score={posCompatibility(p.positionShort, opponentPlayer.positionShort)}
                colors={colors}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main comparison area ── */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Page title */}
        <div
          style={{
            padding: '16px 28px',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.card,
            flexShrink: 0,
          }}
        >
          <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: 600, color: colors.gold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Player vs Player
          </p>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: colors.text, letterSpacing: '0.02em' }}>
            Stats Comparison
          </h1>
        </div>

        <div style={{ padding: '24px 28px', flex: 1 }}>

          {/* ── VS Hero cards ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '20px',
              alignItems: 'center',
              marginBottom: '28px',
            }}
          >
            {/* U Cluj player card */}
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.gold}50`,
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
                }}
              />
              {selectedUCluj ? (
                <>
                  <PlayerAvatar name={selectedUCluj.name} size={80} color={colors.gold} />
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {selectedUCluj.name}
                    </p>
                    <p className="font-[Alexandria]" style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>
                      {selectedUCluj.position} · U Cluj #{selectedUCluj.number}
                    </p>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="font-[Alexandria]" style={{ fontSize: '11px', color: colors.textMuted }}>Age {selectedUCluj.age}</span>
                      <span style={{ color: colors.border }}>·</span>
                      <span className="font-[Alexandria]" style={{ fontSize: '11px', color: colors.textMuted }}>{selectedUCluj.foot} foot</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      backgroundColor: `${colors.gold}18`,
                      border: `1px solid ${colors.gold}40`,
                      borderRadius: '20px',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 600, color: colors.gold, letterSpacing: '0.06em' }}>
                      {uScore}% POSITION MATCH
                    </span>
                  </div>
                </>
              ) : (
                <p style={{ color: colors.textMuted, fontSize: '13px' }}>Select a player</p>
              )}
            </div>

            {/* VS divider */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: colors.text,
                  letterSpacing: '0.06em',
                  opacity: 0.7,
                  display: 'block',
                  textShadow: `0 0 30px ${colors.gold}40`,
                }}
              >
                VS
              </span>
            </div>

            {/* Opponent player card */}
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid #DC444440`,
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #DC4444, transparent)',
                }}
              />
              <PlayerAvatar name={opponentPlayer.name} size={80} color="#DC4444" />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {opponentPlayer.name}
                </p>
                <p className="font-[Alexandria]" style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>
                  {opponentPlayer.position} · {NEXT_MATCH.name} #{opponentPlayer.number}
                </p>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="font-[Alexandria]" style={{ fontSize: '11px', color: colors.textMuted }}>Age {opponentPlayer.age}</span>
                  <span style={{ color: colors.border }}>·</span>
                  <span className="font-[Alexandria]" style={{ fontSize: '11px', color: colors.textMuted }}>{opponentPlayer.foot} foot</span>
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  backgroundColor: '#DC444418',
                  border: '1px solid #DC444440',
                  borderRadius: '20px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#DC4444', letterSpacing: '0.06em' }}>
                  THREAT PROFILE
                </span>
              </div>
            </div>
          </div>

          {/* ── Two-column: radar + stats ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Radar chart */}
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '20px',
              }}
            >
              <p className="font-[Baloo_Thambi]" style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Performance Radar
              </p>
              {selectedUCluj ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke={colors.border} />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: colors.textMuted, fontSize: 11 }}
                    />
                    <Radar
                      name={selectedUCluj.name}
                      dataKey="ucluj"
                      stroke={colors.gold}
                      fill={colors.gold}
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                    <Radar
                      name={opponentPlayer.name}
                      dataKey="opponent"
                      stroke="#DC4444"
                      fill="#DC4444"
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="font-[Alexandria]" style={{ fontSize: '11px', color: colors.textMuted }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.elevated,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: colors.textMuted, fontWeight: 600 }}
                      itemStyle={{ color: colors.text }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: colors.textMuted, fontSize: '13px' }}>Select a player to see the radar</p>
                </div>
              )}
            </div>

            {/* Key strengths comparison */}
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '20px',
              }}
            >
              <p style={{ margin: '0 0 16px', fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Key Strengths
              </p>
              {selectedUCluj && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <p className="font-[Alexandria]" style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: colors.gold }}>
                      {selectedUCluj.name}
                    </p>
                    <div>
                      {selectedUCluj.strengths.map((s, i) => (
                        <StrengthBadge key={`u-${i}-${s}`} label={s} color={colors.gold} />
                      ))}
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '1px', backgroundColor: colors.border, margin: '12px 0' }} />
                </>
              )}
              <div>
                <p className="font-[Alexandria]" style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#DC4444' }}>
                  {opponentPlayer.name}
                </p>
                <div>
                  {opponentPlayer.strengths.map((s, i) => (
                    <StrengthBadge key={`o-${i}-${s}`} label={s} color="#DC4444" />
                  ))}
                </div>

                {/* Scout note */}
                {opponentPlayer.playingStyleNotes && opponentPlayer.playingStyleNotes.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      backgroundColor: `#DC444410`,
                      border: `1px solid #DC444430`,
                      borderLeft: `3px solid #DC4444`,
                      borderRadius: '4px',
                    }}
                  >
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#DC4444', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      Scout Note
                    </p>
                    {opponentPlayer.playingStyleNotes.map((note, i) => (
                      <p key={i} style={{ fontSize: '12px', color: colors.text, margin: i === 0 ? 0 : '4px 0 0', lineHeight: 1.55, opacity: 0.9 }}>
                        · {note}
                      </p>
                    ))}
                  </div>
                )}

                {/* Comparison conclusion — shown under opponent's strengths */}
                {selectedUCluj && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      backgroundColor: `${colors.border}30`,
                      border: `1px solid ${colors.border}`,
                      borderLeft: `3px solid ${colors.gold}`,
                      borderRadius: '4px',
                    }}
                  >
                    <p style={{ fontSize: '10px', fontWeight: 700, color: colors.gold, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      Matchup Conclusion
                    </p>
                    <p style={{ fontSize: '12px', color: colors.text, margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                      {buildComparisonConclusion(selectedUCluj, opponentPlayer, uScore)}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick overview cards */}
              {selectedUCluj && (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Goals', uVal: selectedUCluj.stats.goals, oVal: opponentPlayer.stats.goals },
                    { label: 'Assists', uVal: selectedUCluj.stats.assists, oVal: opponentPlayer.stats.assists },
                    { label: 'xG', uVal: selectedUCluj.stats.xg, oVal: opponentPlayer.stats.xg },
                    { label: 'Pass Acc.', uVal: selectedUCluj.stats.passAcc, oVal: opponentPlayer.stats.passAcc, suffix: '%' },
                  ].map(({ label, uVal, oVal, suffix = '' }) => {
                    const uWins = uVal > oVal;
                    return (
                      null
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Full stats table ── */}
          {selectedUCluj && (
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '8px',
                  marginBottom: '16px',
                  alignItems: 'center',
                }}
              >
                <p className="font-[Alexandria]" style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: colors.gold, textAlign: 'right' }}>
                  {selectedUCluj.name}
                </p>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: '100px', textAlign: 'center' }}>
                  Season Stats
                </p>
                <p className="font-[Alexandria]" style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#DC4444' }}>
                  {opponentPlayer.name}
                </p>
              </div>

              <StatCompareRow label="Goals" uValue={String(selectedUCluj.stats.goals)} oValue={String(opponentPlayer.stats.goals)} colors={colors} uBetter={numericCompare(selectedUCluj.stats.goals, opponentPlayer.stats.goals)} />
              <StatCompareRow label="Assists" uValue={String(selectedUCluj.stats.assists)} oValue={String(opponentPlayer.stats.assists)} colors={colors} uBetter={numericCompare(selectedUCluj.stats.assists, opponentPlayer.stats.assists)} />
              <StatCompareRow label="xG" uValue={selectedUCluj.stats.xg.toFixed(1)} oValue={opponentPlayer.stats.xg.toFixed(1)} colors={colors} uBetter={numericCompare(selectedUCluj.stats.xg, opponentPlayer.stats.xg)} />
              <StatCompareRow label="Pass Accuracy" uValue={`${selectedUCluj.stats.passAcc}%`} oValue={`${opponentPlayer.stats.passAcc}%`} colors={colors} uBetter={numericCompare(selectedUCluj.stats.passAcc, opponentPlayer.stats.passAcc)} />
              <StatCompareRow label="Duels Won" uValue={`${selectedUCluj.stats.duelsWon}%`} oValue={`${opponentPlayer.stats.duelsWon}%`} colors={colors} uBetter={numericCompare(selectedUCluj.stats.duelsWon, opponentPlayer.stats.duelsWon)} />
              <StatCompareRow label="Aerial Duels" uValue={`${selectedUCluj.stats.aerialDuels}%`} oValue={`${opponentPlayer.stats.aerialDuels}%`} colors={colors} uBetter={numericCompare(selectedUCluj.stats.aerialDuels, opponentPlayer.stats.aerialDuels)} />
              <StatCompareRow label="Distance / Game" uValue={`${selectedUCluj.stats.distanceCovered.toFixed(1)} km`} oValue={`${opponentPlayer.stats.distanceCovered.toFixed(1)} km`} colors={colors} uBetter={numericCompare(selectedUCluj.stats.distanceCovered, opponentPlayer.stats.distanceCovered)} />
              {(selectedUCluj.stats.dribblesPerGame !== undefined || opponentPlayer.stats.dribblesPerGame !== undefined) && (
                <StatCompareRow
                  label="Dribbles / Game"
                  uValue={selectedUCluj.stats.dribblesPerGame !== undefined ? selectedUCluj.stats.dribblesPerGame.toFixed(1) : '—'}
                  oValue={opponentPlayer.stats.dribblesPerGame !== undefined ? opponentPlayer.stats.dribblesPerGame.toFixed(1) : '—'}
                  colors={colors}
                  uBetter={numericCompare(selectedUCluj.stats.dribblesPerGame, opponentPlayer.stats.dribblesPerGame)}
                />
              )}
              {(selectedUCluj.stats.crossingAcc !== undefined || opponentPlayer.stats.crossingAcc !== undefined) && (
                <StatCompareRow
                  label="Crossing Accuracy"
                  uValue={selectedUCluj.stats.crossingAcc !== undefined ? `${selectedUCluj.stats.crossingAcc}%` : '—'}
                  oValue={opponentPlayer.stats.crossingAcc !== undefined ? `${opponentPlayer.stats.crossingAcc}%` : '—'}
                  colors={colors}
                  uBetter={numericCompare(selectedUCluj.stats.crossingAcc, opponentPlayer.stats.crossingAcc)}
                />
              )}
              {(selectedUCluj.stats.shotsOnTarget !== undefined || opponentPlayer.stats.shotsOnTarget !== undefined) && (
                <StatCompareRow
                  label="Shots on Target"
                  uValue={selectedUCluj.stats.shotsOnTarget !== undefined ? `${selectedUCluj.stats.shotsOnTarget}%` : '—'}
                  oValue={opponentPlayer.stats.shotsOnTarget !== undefined ? `${opponentPlayer.stats.shotsOnTarget}%` : '—'}
                  colors={colors}
                  uBetter={numericCompare(selectedUCluj.stats.shotsOnTarget, opponentPlayer.stats.shotsOnTarget)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}