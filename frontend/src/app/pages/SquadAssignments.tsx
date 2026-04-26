import { useApp } from '../context/AppContext';
import { useT } from '../translations';
import { NEXT_MATCH, UCLUJ_PLAYERS } from '../data/mockData';
import { OpponentCrest } from '../components/ClubCrest';
import { FormRow } from '../components/WDLPill';

export function SquadAssignments() {
  const { colors, language, assignments, removeAssignment } = useApp();
  const t = useT(language);

  const unassigned = UCLUJ_PLAYERS.filter(
    p => p.positionShort !== 'GK' && !assignments.some(a => a.uclujPlayerId === p.id)
  );

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <OpponentCrest name={NEXT_MATCH.name} size={36} />
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: 0 }}>
            {t.squadAssignments}
          </h2>
          <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>
            {NEXT_MATCH.name} · {NEXT_MATCH.matchDate}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <FormRow form={NEXT_MATCH.form} size="md" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Confirmed assignments */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: colors.gold, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Confirmed Assignments ({assignments.length})
            </p>
          </div>

          {assignments.length === 0 ? (
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0 }}>
                No assignments yet. Go to Opponent Analysis to assign players.
              </p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {assignments.map((a, i) => {
                const opp = NEXT_MATCH.players.find(p => p.id === a.opponentPlayerId);
                const ucl = UCLUJ_PLAYERS.find(p => p.id === a.uclujPlayerId);
                if (!opp || !ucl) return null;

                return (
                  <div
                    key={a.opponentPlayerId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderBottom: i < assignments.length - 1 ? `1px solid ${colors.border}` : 'none',
                      gap: '10px',
                    }}
                  >
                    {/* UCLuj player */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="stat-mono" style={{ fontSize: '11px', color: colors.gold, minWidth: '22px' }}>
                          #{ucl.number}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{ucl.name}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            color: colors.textMuted,
                            backgroundColor: colors.elevated,
                            padding: '1px 5px',
                            borderRadius: '2px',
                          }}
                        >
                          {ucl.positionShort}
                        </span>
                      </div>
                      {a.note && (
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: '4px 0 0 28px', fontStyle: 'italic', lineHeight: 1.5 }}>
                          {a.note.length > 60 ? a.note.slice(0, 60) + '...' : a.note}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <span style={{ color: colors.gold, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>→</span>

                    {/* Opponent player */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#DC2626',
                            backgroundColor: '#DC262615',
                            padding: '1px 5px',
                            borderRadius: '2px',
                          }}
                        >
                          {opp.positionShort}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{opp.name}</span>
                        <span className="stat-mono" style={{ fontSize: '11px', color: colors.textMuted }}>
                          #{opp.number}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeAssignment(a.opponentPlayerId)}
                      style={{
                        background: 'none',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '3px',
                        color: colors.textMuted,
                        fontSize: '11px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 150ms ease',
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
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unassigned players */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              {t.unassigned} Players ({unassigned.length})
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {unassigned.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderBottom: i < unassigned.length - 1 ? `1px solid ${colors.border}` : 'none',
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1A3A6B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="stat-mono" style={{ fontSize: '10px', fontWeight: 600, color: 'white' }}>
                    {p.number}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: colors.text }}>{p.name}</span>
                  <span style={{ fontSize: '10px', color: colors.textMuted, marginLeft: '6px' }}>
                    {p.positionShort}
                  </span>
                </div>
              </div>
            ))}
            {unassigned.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ color: colors.gold, fontSize: '13px', fontWeight: 600, margin: 0 }}>
                  All field players assigned ✓
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
