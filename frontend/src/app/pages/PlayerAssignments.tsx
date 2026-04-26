import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';
import { UCLUJ_PLAYERS } from '../data/mockData';
import { PitchView } from '../components/PitchView';
import { StatRow } from '../components/StatRow';
import { FileText, Film, File, Image, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { Attachment } from '../context/AppContext';

// For demo purposes, the logged-in player is Cordea (#11, LW)
const MY_PLAYER_ID = 'ucl-11';

const OPPONENT_PHOTO = 'https://images.unsplash.com/flagged/photo-1568407395619-84338c4665c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzc3MTM5OTE2fDA&ixlib=rb-4.1.0&q=80&w=400';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_TYPE_ICON: Record<Attachment['fileType'], React.ReactNode> = {
  image: <Image size={14} strokeWidth={1.5} />,
  video: <Film size={14} strokeWidth={1.5} />,
  pdf: <FileText size={14} strokeWidth={1.5} />,
  document: <File size={14} strokeWidth={1.5} />,
};

const FILE_TYPE_COLOR: Record<Attachment['fileType'], string> = {
  image: '#3B82F6',
  video: '#8B5CF6',
  pdf: '#EF4444',
  document: '#F59E0B',
};

export function PlayerAssignments() {
  const { colors, language, assignments, currentMatch } = useApp();
  const t = useT(language);
  const [photoError, setPhotoError] = useState(false);
  const [styleExpanded, setStyleExpanded] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const myPlayer = UCLUJ_PLAYERS.find(p => p.id === MY_PLAYER_ID)!;
  const myAssignment = assignments.find(a => a.uclujPlayerId === MY_PLAYER_ID);

  if (!currentMatch) {
    return <div style={{ padding: '40px', color: colors.text }}>Loading assignment data...</div>;
  }

  const assignedOpponent = myAssignment
    ? currentMatch.players.find(p => p.id === myAssignment.opponentPlayerId)
    : null;

  const imageAttachments = myAssignment?.attachments.filter(a => a.fileType === 'image' && a.dataUrl) ?? [];
  const otherAttachments = myAssignment?.attachments.filter(a => !(a.fileType === 'image' && a.dataUrl)) ?? [];

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px 16px 40px',
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#3B82F6',
              backgroundColor: '#3B82F620',
              border: '1px solid #3B82F640',
              borderRadius: '10px',
              padding: '2px 8px',
            }}
          >
            {t.player}
          </span>
          <span style={{ fontSize: '12px', color: colors.textMuted }}>{t.myAssignments}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: colors.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="stat-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#0B0F1A' }}>
              {myPlayer.number}
            </span>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0 }}>
              A. Cordea
            </h1>
            <p style={{ fontSize: '12px', color: colors.textMuted, margin: '1px 0 0' }}>
              {myPlayer.position} · U Cluj
            </p>
          </div>
        </div>
      </div>

      {/* ── Pitch ── */}
      <div
        style={{
          backgroundColor: '#1A3D2B',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '16px',
          height: '300px',
          position: 'relative',
          border: `1px solid ${colors.border}`,
        }}
      >
        {myAssignment ? (
          <PitchView
            opponentPlayers={currentMatch.players}
            uclujPlayers={UCLUJ_PLAYERS}
            assignments={assignments}
            selectedPlayerId={assignedOpponent?.id || null}
            onPlayerClick={() => {}}
            onAssignClick={() => {}}
            isCoach={false}
            simplified
            focusedUclujPlayerId={MY_PLAYER_ID}
          />
        ) : (
          <>
            <PitchView
              opponentPlayers={currentMatch.players}
              uclujPlayers={UCLUJ_PLAYERS}
              assignments={[]}
              selectedPlayerId={null}
              onPlayerClick={() => {}}
              onAssignClick={() => {}}
              isCoach={false}
              simplified
              focusedUclujPlayerId={MY_PLAYER_ID}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <AlertCircle size={28} color="rgba(255,255,255,0.5)" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                  Awaiting Assignment
                </p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '4px', margin: '4px 0 0' }}>
                  Your coach will assign you before the match.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Assignment content ── */}
      {myAssignment && assignedOpponent ? (
        <>
          {/* ── Opponent profile card ── */}
          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: '10px 14px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.elevated,
              }}
            >
              <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                {t.yourAssignment}
              </p>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#22C55E',
                  backgroundColor: '#22C55E18',
                  border: '1px solid #22C55E40',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  letterSpacing: '0.06em',
                }}
              >
                CONFIRMED
              </span>
            </div>

            {/* Opponent photo + info */}
            <div style={{ padding: '16px 14px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Photo */}
                <div
                  style={{
                    width: '80px',
                    height: '90px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '2px solid #DC262650',
                    flexShrink: 0,
                    position: 'relative',
                    backgroundColor: '#DC262615',
                  }}
                >
                  {!photoError ? (
                    <img
                      src={OPPONENT_PHOTO}
                      alt={assignedOpponent.name}
                      onError={() => setPhotoError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#DC2626',
                      }}
                    >
                      {assignedOpponent.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Number badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      backgroundColor: '#DC2626',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '3px',
                      padding: '1px 5px',
                      fontFamily: 'monospace',
                    }}
                  >
                    #{assignedOpponent.number}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '17px', fontWeight: 800, color: colors.text, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {assignedOpponent.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#DC2626', margin: '0 0 10px', fontWeight: 600 }}>
                    {currentMatch.name}
                  </p>

                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { label: 'Position', value: assignedOpponent.position },
                      { label: 'Number', value: `#${assignedOpponent.number}` },
                      { label: 'Pref. Foot', value: assignedOpponent.foot },
                      { label: 'Age', value: String(assignedOpponent.age) },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          backgroundColor: colors.elevated,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '4px',
                          padding: '6px 8px',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '9px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {label}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: 700, color: colors.text }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ marginTop: '14px', borderTop: `1px solid ${colors.border}`, paddingTop: '12px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Season Stats
                </p>
                <StatRow label={t.goals} value={assignedOpponent.stats.goals} compact />
                <StatRow label={t.assists} value={assignedOpponent.stats.assists} compact />
                <StatRow label={t.dribblesPerGame} value={assignedOpponent.stats.dribblesPerGame?.toFixed(1) ?? '—'} compact trend="up" highlight />
                <StatRow label={t.crossingAcc} value={assignedOpponent.stats.crossingAcc ? `${assignedOpponent.stats.crossingAcc}%` : '—'} compact />
                <StatRow label={t.passAcc} value={`${assignedOpponent.stats.passAcc}%`} compact />
              </div>

              {/* Strengths */}
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {t.strengths}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {assignedOpponent.strengths.map((s: string) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '11px',
                        color: '#DC2626',
                        backgroundColor: '#DC262615',
                        border: '1px solid #DC262630',
                        borderRadius: '3px',
                        padding: '3px 8px',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Playing style notes ── */}
          {assignedOpponent.playingStyleNotes.length > 0 && (
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <button
                onClick={() => setStyleExpanded(v => !v)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: styleExpanded ? `1px solid ${colors.border}` : 'none',
                  cursor: 'pointer',
                  color: colors.text,
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Playing Style Notes
                </span>
                {styleExpanded
                  ? <ChevronUp size={14} strokeWidth={1.5} color={colors.textMuted} />
                  : <ChevronDown size={14} strokeWidth={1.5} color={colors.textMuted} />}
              </button>

              {styleExpanded && (
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {assignedOpponent.playingStyleNotes.map((note: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        backgroundColor: colors.elevated,
                        borderRadius: '4px',
                        borderLeft: `3px solid #DC2626`,
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#DC2626', marginTop: '1px', flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: colors.text, lineHeight: 1.6 }}>
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Coach's tactical note ── */}
          {myAssignment.note && (
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${colors.gold}`,
                borderRadius: '6px',
                padding: '14px 16px',
                marginBottom: '12px',
              }}
            >
              <p style={{ fontSize: '10px', fontWeight: 600, color: colors.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t.coachNote}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: colors.text,
                  fontStyle: 'italic',
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                "{myAssignment.note}"
              </p>
            </div>
          )}

          {/* ── Attachments from coach ── */}
          {myAssignment.attachments.length > 0 && (
            <div
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                  Coach's Materials · {myAssignment.attachments.length} file{myAssignment.attachments.length > 1 ? 's' : ''}
                </p>
              </div>

              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Image gallery grid */}
                {imageAttachments.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '6px',
                      marginBottom: otherAttachments.length > 0 ? '8px' : '0',
                    }}
                  >
                    {imageAttachments.map((att: any) => (
                      <div
                        key={att.id}
                        onClick={() => setLightboxSrc(att.dataUrl!)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          border: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0)',
                            transition: 'background-color 150ms ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)')}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Non-image attachments */}
                {otherAttachments.map(att => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      backgroundColor: colors.elevated,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        backgroundColor: `${FILE_TYPE_COLOR[att.fileType]}18`,
                        border: `1px solid ${FILE_TYPE_COLOR[att.fileType]}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: FILE_TYPE_COLOR[att.fileType],
                      }}
                    >
                      {FILE_TYPE_ICON[att.fileType]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {att.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '10px', color: colors.textMuted }}>
                        {att.fileType.toUpperCase()} · {formatSize(att.size)}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: FILE_TYPE_COLOR[att.fileType],
                        backgroundColor: `${FILE_TYPE_COLOR[att.fileType]}18`,
                        border: `1px solid ${FILE_TYPE_COLOR[att.fileType]}30`,
                        borderRadius: '3px',
                        padding: '2px 6px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {att.fileType.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── No assignment state ── */
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            padding: '28px 16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: colors.elevated,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <AlertCircle size={22} strokeWidth={1.5} color={colors.textMuted} />
          </div>
          <p style={{ color: colors.text, fontSize: '14px', fontWeight: 700, marginBottom: '6px', margin: '0 0 6px' }}>
            No Assignment Yet
          </p>
          <p style={{ color: colors.textMuted, fontSize: '12px', margin: 0, lineHeight: 1.65 }}>
            Your coach hasn't sent your matchup assignment yet.<br />
            Check back closer to match day — <strong style={{ color: colors.text }}>{currentMatch.matchDate}</strong>.
          </p>
        </div>
      )}

      {/* ── Match info footer ── */}
      <div style={{ marginTop: '12px', padding: '10px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: colors.textMuted }}>
          {currentMatch.matchDate} · {currentMatch.competition}
        </p>
      </div>

      {/* ── Image lightbox ── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <img
            src={lightboxSrc}
            alt="Attachment preview"
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '6px' }}
          />
        </div>
      )}
    </div>
  );
}
