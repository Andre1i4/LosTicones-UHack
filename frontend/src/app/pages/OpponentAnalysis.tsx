import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';
import { NEXT_MATCH, UCLUJ_PLAYERS } from '../data/mockData';
import type { OpponentPlayer } from '../data/mockData';
import type { Attachment } from '../context/AppContext';
import { FormRow } from '../components/WDLPill';
import { OpponentCrest } from '../components/ClubCrest';
import { ProgressStat, StatRow } from '../components/StatRow';
import { PitchView } from '../components/PitchView';
import { RightDrawer } from '../components/RightDrawer';
import { AssignmentModal } from '../components/AssignmentModal';
import { SendToPlayersPopover } from '../components/SendToPlayersPopover';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function OpponentAnalysis() {
  const { colors, language, role, assignments, addAssignment } = useApp();
  const t = useT(language);

  const [selectedPlayer, setSelectedPlayer] = useState<OpponentPlayer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<OpponentPlayer | null>(null);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const isCoach = role === 'coach';

  const handlePlayerClick = (player: OpponentPlayer) => {
    setSelectedPlayer(player);
    setDrawerOpen(true);
  };

  const handleAssignClick = (player: OpponentPlayer) => {
    setAssignTarget(player);
    setModalOpen(true);
  };

  const handleConfirmAssignment = (uclujPlayerId: string, note: string, attachments: Attachment[]) => {
    if (!assignTarget) return;
    addAssignment({ opponentPlayerId: assignTarget.id, uclujPlayerId, note, attachments });
    setModalOpen(false);
  };

  const selectedAssignment = assignments.find(
    a => a.opponentPlayerId === selectedPlayer?.id
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Left info panel */}
      <div
        style={{
          width: '280px',
          minWidth: '280px',
          height: '100%',
          backgroundColor: colors.card,
          borderRight: `1px solid ${colors.border}`,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Club header */}
        <div
          style={{
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {/* Collapse toggle bar */}
          <button
            onClick={() => setHeaderCollapsed(c => !c)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: headerCollapsed ? 'none' : `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <OpponentCrest name={NEXT_MATCH.name} size={24} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text }}>
                {NEXT_MATCH.name}
              </span>
            </div>
            {headerCollapsed
              ? <ChevronDown size={14} color={colors.textMuted} />
              : <ChevronUp size={14} color={colors.textMuted} />
            }
          </button>

          {/* Collapsible content */}
          {!headerCollapsed && (
            <div
              style={{
                padding: '12px 20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <OpponentCrest name={NEXT_MATCH.name} size={56} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: '10px 0 2px' }}>
                {NEXT_MATCH.name}
              </h2>
              <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 12px' }}>
                {NEXT_MATCH.country} · {NEXT_MATCH.competition}
              </p>

              {/* Formation */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '3px',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t.formation}
                </span>
                <span className="stat-mono" style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>
                  {NEXT_MATCH.formation}
                </span>
              </div>

              {/* Form */}
              <FormRow form={NEXT_MATCH.form} size="md" />
            </div>
          )}
        </div>

        {/* Key stats */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            {t.quickStats}
          </p>

          <ProgressStat label={t.avgPossession} value={NEXT_MATCH.avgPossession} color={colors.gold} />
          <ProgressStat label={t.pressingIntensity} value={NEXT_MATCH.pressingIntensity} color="#DC2626" />

          <div style={{ marginTop: '8px' }}>
            <StatRow label={t.goalsScored} value={NEXT_MATCH.avgGoalsScored.toFixed(1)} unit="/g" compact trend="up" />
            <StatRow label={t.goalsConceded} value={NEXT_MATCH.avgGoalsConceded.toFixed(1)} unit="/g" compact />
            <StatRow label={t.avgShotsOnTarget} value={NEXT_MATCH.avgShotsOnTarget.toFixed(1)} unit="/g" compact />
          </div>

          {/* Set piece threat */}
          <div
            style={{
              marginTop: '12px',
              padding: '8px 10px',
              backgroundColor: '#DC262618',
              border: '1px solid #DC262630',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="font-[Sen] text-[12px]" style={{ fontSize: '12px', color: colors.textMuted }}>{t.setPieceThreat}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>{NEXT_MATCH.setPieceThreat}</span>
          </div>
        </div>

        {/* Coach notes */}
        <div style={{ padding: '16px 20px', flex: 1 }}>
          <p className="font-[Alexandria]" style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {t.notes}
          </p>
          <p className="font-[Alexandria] font-normal" style={{ fontSize: '12px', color: colors.text, lineHeight: 1.7, margin: 0 }}>
            {NEXT_MATCH.coachNote}
          </p>
        </div>

        {/* Assignment summary */}
        {isCoach && assignments.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.elevated }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: colors.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'} Confirmed
            </p>
            {assignments.map(a => {
              const opp = NEXT_MATCH.players.find(p => p.id === a.opponentPlayerId);
              const ucl = UCLUJ_PLAYERS.find(p => p.id === a.uclujPlayerId);
              if (!opp || !ucl) return null;
              return (
                <div key={a.opponentPlayerId} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span className="stat-mono" style={{ fontSize: '10px', color: colors.gold, minWidth: '18px' }}>
                    #{ucl.number}
                  </span>
                  <span style={{ fontSize: '11px', color: colors.text }}>{ucl.name}</span>
                  <span style={{ fontSize: '10px', color: colors.textMuted }}>→</span>
                  <span style={{ fontSize: '11px', color: colors.textMuted }}>{opp.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pitch area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Pitch header */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              {NEXT_MATCH.name} · <strong style={{ color: colors.text }}>{NEXT_MATCH.formation}</strong>
            </span>
            <span style={{ fontSize: '11px', color: colors.textMuted }}>vs</span>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              U Cluj · <strong style={{ color: colors.text }}>4-3-3</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: colors.textMuted }}>
              {selectedPlayer ? `Selected: ${selectedPlayer.name}` : 'Click a player to view stats'}
            </span>
          </div>
        </div>

        {/* Pitch + right drawer container */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Pitch */}
          <div style={{ flex: 1, padding: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PitchView
              opponentPlayers={NEXT_MATCH.players}
              uclujPlayers={UCLUJ_PLAYERS}
              assignments={assignments}
              selectedPlayerId={selectedPlayer?.id || null}
              onPlayerClick={handlePlayerClick}
              onAssignClick={handleAssignClick}
              isCoach={isCoach}
            />
          </div>

          {/* Right drawer */}
          <RightDrawer
            player={selectedPlayer}
            open={drawerOpen}
            onClose={() => { setDrawerOpen(false); setSelectedPlayer(null); }}
            onAssign={() => {
              setAssignTarget(selectedPlayer);
              setModalOpen(true);
            }}
            isAssigned={!!selectedAssignment}
          />
        </div>

        {/* Send to Players CTA (coach only) */}
        {isCoach && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: drawerOpen ? '380px' : '20px',
              transition: 'right 200ms ease',
              zIndex: 10,
            }}
          >
            <SendToPlayersPopover />
          </div>
        )}
      </div>

      {/* Assignment modal */}
      <AssignmentModal
        opponent={assignTarget}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAssignment}
        existingAssignment={
          assignTarget
            ? assignments.find(a => a.opponentPlayerId === assignTarget.id)
            : undefined
        }
      />
    </div>
  );
}