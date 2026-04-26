import type { OpponentPlayer, UClujPlayer } from '../data/mockData';
import type { Assignment } from '../context/AppContext';

interface PitchViewProps {
  opponentPlayers: OpponentPlayer[];
  uclujPlayers: UClujPlayer[];
  assignments: Assignment[];
  selectedPlayerId: string | null;
  onPlayerClick: (player: OpponentPlayer) => void;
  onAssignClick: (player: OpponentPlayer) => void;
  isCoach: boolean;
  simplified?: boolean;
  focusedUclujPlayerId?: string | null; // for player view
}

// SVG pitch dimensions
const PITCH_X = 10;
const PITCH_Y = 5;
const PITCH_W = 500;
const PITCH_H = 750;
const CX = PITCH_X + PITCH_W / 2; // 260
const HALF_Y = PITCH_Y + PITCH_H / 2; // 380
const STROKE = '#FFFFFF';
const STROKE_W = 1.5;

function PitchMarkings() {
  return (
    <g>
      {/* Main pitch */}
      <rect x={PITCH_X} y={PITCH_Y} width={PITCH_W} height={PITCH_H}
        fill="#1A3D2B" stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Alternating pitch stripes (mowing pattern) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={PITCH_X + 1}
          y={PITCH_Y + 1 + i * (PITCH_H / 7)}
          width={PITCH_W - 2}
          height={PITCH_H / 7 - 1}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent'}
        />
      ))}

      {/* Halfway line */}
      <line x1={PITCH_X} y1={HALF_Y} x2={PITCH_X + PITCH_W} y2={HALF_Y}
        stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Center circle */}
      <circle cx={CX} cy={HALF_Y} r={66}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      <circle cx={CX} cy={HALF_Y} r={3} fill={STROKE} />

      {/* Top penalty area */}
      <rect x={110} y={PITCH_Y} width={300} height={115}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Top goal area */}
      <rect x={175} y={PITCH_Y} width={170} height={50}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Top penalty spot */}
      <circle cx={CX} cy={93} r={2.5} fill={STROKE} />
      {/* Top penalty arc */}
      <path d="M 205 120 A 66 66 0 0 1 315 120"
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Top goal (outside pitch) */}
      <rect x={215} y={PITCH_Y - 12} width={90} height={12}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} opacity={0.7} />

      {/* Bottom penalty area */}
      <rect x={110} y={PITCH_Y + PITCH_H - 115} width={300} height={115}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Bottom goal area */}
      <rect x={175} y={PITCH_Y + PITCH_H - 50} width={170} height={50}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Bottom penalty spot */}
      <circle cx={CX} cy={PITCH_Y + PITCH_H - 88} r={2.5} fill={STROKE} />
      {/* Bottom penalty arc */}
      <path d={`M 205 ${PITCH_Y + PITCH_H - 115} A 66 66 0 0 0 315 ${PITCH_Y + PITCH_H - 115}`}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      {/* Bottom goal */}
      <rect x={215} y={PITCH_Y + PITCH_H} width={90} height={12}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} opacity={0.7} />

      {/* Corner arcs */}
      <path d={`M ${PITCH_X + 22} ${PITCH_Y} A 22 22 0 0 1 ${PITCH_X} ${PITCH_Y + 22}`}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      <path d={`M ${PITCH_X + PITCH_W - 22} ${PITCH_Y} A 22 22 0 0 0 ${PITCH_X + PITCH_W} ${PITCH_Y + 22}`}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      <path d={`M ${PITCH_X} ${PITCH_Y + PITCH_H - 22} A 22 22 0 0 1 ${PITCH_X + 22} ${PITCH_Y + PITCH_H}`}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />
      <path d={`M ${PITCH_X + PITCH_W} ${PITCH_Y + PITCH_H - 22} A 22 22 0 0 0 ${PITCH_X + PITCH_W - 22} ${PITCH_Y + PITCH_H}`}
        fill="none" stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Subtle half-shading for top half (opponent) */}
      <rect x={PITCH_X + 1} y={PITCH_Y + 1} width={PITCH_W - 2} height={PITCH_H / 2 - 1}
        fill="rgba(0,0,0,0.08)" />
    </g>
  );
}

interface PlayerNodeProps {
  player: OpponentPlayer;
  isSelected: boolean;
  isAssigned: boolean;
  isCoach: boolean;
  dimmed?: boolean;
  onClick: () => void;
  onAssignClick: () => void;
}

function OpponentNode({ player, isSelected, isAssigned, isCoach, dimmed, onClick, onAssignClick }: PlayerNodeProps) {
  const r = isSelected ? 23 : 20;
  const accentColor = '#FFFFFF';   // U Cluj white
  const oppColor = '#1A1A1A';      // dark fill for opponent nodes

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      opacity={dimmed ? 0.3 : 1}
    >
      {/* Selection glow */}
      {isSelected && (
        <circle cx={player.x} cy={player.y} r={r + 5}
          fill="none" stroke={accentColor} strokeWidth={2} opacity={0.35} />
      )}

      {/* Main circle */}
      <circle
        cx={player.x}
        cy={player.y}
        r={r}
        fill={oppColor}
        stroke={isSelected ? accentColor : isAssigned ? accentColor : 'rgba(255,255,255,0.25)'}
        strokeWidth={isSelected ? 2.5 : isAssigned ? 2 : 1}
      />

      {/* Assignment checkmark badge */}
      {isAssigned && !isSelected && (
        <g>
          <circle cx={player.x + 14} cy={player.y - 14} r={8}
            fill={accentColor} stroke="#1A3D2B" strokeWidth={1.5} />
          <text
            x={player.x + 14} y={player.y - 10}
            textAnchor="middle"
            fill="#111111"
            fontSize="9"
            fontWeight="700"
          >✓</text>
        </g>
      )}

      {/* Coach "+" assign button */}
      {isCoach && !isAssigned && (
        <g
          style={{ cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); onAssignClick(); }}
        >
          <circle cx={player.x + 14} cy={player.y - 14} r={8}
            fill="rgba(255,255,255,0.1)" stroke={accentColor} strokeWidth={1} />
          <text
            x={player.x + 14} y={player.y - 10}
            textAnchor="middle"
            fill={accentColor}
            fontSize="11"
            fontWeight="600"
          >+</text>
        </g>
      )}

      {/* Jersey number */}
      <text
        x={player.x}
        y={player.y + 5}
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="600"
        fontFamily="'IBM Plex Mono', monospace"
      >
        {player.number}
      </text>

      {/* Player name */}
      <text
        x={player.x}
        y={player.y + r + 13}
        textAnchor="middle"
        fill="rgba(255,255,255,0.75)"
        fontSize="9"
        fontFamily="'IBM Plex Sans', system-ui, sans-serif"
        fontWeight="500"
        letterSpacing="0.03em"
      >
        {player.name.split(' ').pop()}
      </text>
    </g>
  );
}

interface UClujNodeProps {
  player: UClujPlayer;
  isFocused?: boolean;
  isLinked?: boolean;
}

function UClujNode({ player, isFocused, isLinked }: UClujNodeProps) {
  const r = 19;
  const accentColor = '#FFFFFF';  // U Cluj white

  return (
    <g opacity={isFocused === false ? 0.25 : 1}>
      <circle
        cx={player.x}
        cy={player.y}
        r={r}
        fill={isFocused ? '#FFFFFF' : '#2A2A2A'}
        stroke={isLinked ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
        strokeWidth={isLinked ? 2.5 : 1.5}
      />
      <text
        x={player.x}
        y={player.y + 4}
        textAnchor="middle"
        fill={isFocused ? '#111111' : 'white'}
        fontSize="11"
        fontWeight="600"
        fontFamily="'IBM Plex Mono', monospace"
      >
        {player.number}
      </text>
      <text
        x={player.x}
        y={player.y + r + 13}
        textAnchor="middle"
        fill="rgba(255,255,255,0.65)"
        fontSize="9"
        fontFamily="'IBM Plex Sans', system-ui, sans-serif"
        fontWeight="500"
      >
        {player.name.split(' ').pop()}
      </text>
    </g>
  );
}

export function PitchView({
  opponentPlayers,
  uclujPlayers,
  assignments,
  selectedPlayerId,
  onPlayerClick,
  onAssignClick,
  isCoach,
  simplified = false,
  focusedUclujPlayerId = null,
}: PitchViewProps) {
  const accentColor = '#FFFFFF';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        viewBox="-5 -17 530 784"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={accentColor} />
          </marker>
        </defs>

        <PitchMarkings />

        {/* Team labels */}
        <text x={CX} y={PITCH_Y + 30} textAnchor="middle"
          fill="rgba(255,255,255,0.25)" fontSize="9" letterSpacing="0.1em"
          fontFamily="'IBM Plex Sans', sans-serif" fontWeight="600">
          RAPID BUCUREȘTI
        </text>
        <text x={CX} y={PITCH_Y + PITCH_H - 18} textAnchor="middle"
          fill="rgba(255,255,255,0.25)" fontSize="9" letterSpacing="0.1em"
          fontFamily="'IBM Plex Sans', sans-serif" fontWeight="600">
          U CLUJ
        </text>

        {/* Connector lines (assignments) */}
        {assignments.map(a => {
          const opp = opponentPlayers.find(p => p.id === a.opponentPlayerId);
          const ucl = uclujPlayers.find(p => p.id === a.uclujPlayerId);
          if (!opp || !ucl) return null;

          return (
            <line
              key={a.opponentPlayerId}
              x1={ucl.x}
              y1={ucl.y}
              x2={opp.x}
              y2={opp.y}
              stroke={accentColor}
              strokeWidth={1.5}
              strokeDasharray="6,5"
              markerEnd="url(#arrow)"
              opacity={0.6}
            />
          );
        })}

        {/* UCLuj players */}
        {uclujPlayers.map(player => {
          const isLinked = assignments.some(a => a.uclujPlayerId === player.id);
          let isFocused: boolean | undefined = undefined;
          if (focusedUclujPlayerId !== null) {
            isFocused = player.id === focusedUclujPlayerId;
          }
          return (
            <UClujNode
              key={player.id}
              player={player}
              isFocused={isFocused}
              isLinked={isLinked}
            />
          );
        })}

        {/* Opponent players */}
        {opponentPlayers.map(player => {
          const isAssigned = assignments.some(a => a.opponentPlayerId === player.id);
          const isSelected = player.id === selectedPlayerId;

          let dimmed = false;
          if (simplified && focusedUclujPlayerId) {
            const linkedAssignment = assignments.find(a => a.uclujPlayerId === focusedUclujPlayerId);
            if (linkedAssignment && player.id !== linkedAssignment.opponentPlayerId) {
              dimmed = true;
            }
          }

          return (
            <OpponentNode
              key={player.id}
              player={player}
              isSelected={isSelected}
              isAssigned={isAssigned}
              isCoach={isCoach && !simplified}
              dimmed={dimmed}
              onClick={() => onPlayerClick(player)}
              onAssignClick={() => onAssignClick(player)}
            />
          );
        })}
      </svg>
    </div>
  );
}