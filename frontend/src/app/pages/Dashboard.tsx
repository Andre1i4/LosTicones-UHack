import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';

import { FormRow } from '../components/WDLPill';
import { OpponentCrest } from '../components/ClubCrest';
import { ProgressStat, StatRow } from '../components/StatRow';
import { apiClient } from '../../services/api';
import type { Match, MatchSummary } from '../../services/api';

export function Dashboard() {
  const { colors, language, selectMatch } = useApp();
  const t = useT(language);
  const navigate = useNavigate();
  const gold = colors.gold;

  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch next match and recent analyses in parallel
        const [match, analyses] = await Promise.all([
          apiClient.getNextMatch(),
          apiClient.getRecentAnalyses(),
        ]);
        
        setNextMatch(match);
        setRecentAnalyses(analyses.length > 0 ? analyses : []);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        // Fallback to mock data on error
        // DO NOT fallback to mock data (per user request)
        setNextMatch(null);
        setRecentAnalyses([]);
        setError('Error: API unavailable. Cannot load live match data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayMatch = nextMatch;
  const displayAnalyses = recentAnalyses.length > 0 ? recentAnalyses : [];

  if (!displayMatch) {
    return <div style={{ padding: '24px', color: colors.text }}>Loading tactical dashboard context or failed to connect to API...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px' }}>
      {/* Next Match Banner */}
      <div
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          borderLeft: `3px solid ${gold}`,
          borderRadius: '4px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Label */}
        <div style={{ flexShrink: 0 }}>
          <p className="font-[Alexandria]" style={{ fontSize: '10px', fontWeight: 700, color: gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {t.nextMatch}
          </p>
          <p className="font-[Alexandria]" style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.05em' }}>
            {displayMatch.competition}
          </p>
        </div>

        <div style={{ width: '1px', height: '48px', backgroundColor: colors.border }} />

        {/* Opponent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
          <OpponentCrest name={displayMatch.name} size={48} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: colors.text, margin: 0, lineHeight: 1.2 }}>
              {displayMatch.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} color={colors.textMuted} strokeWidth={1.5} />
                <span style={{ fontSize: '12px', color: colors.textMuted }}>{displayMatch.matchDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={12} color={colors.textMuted} strokeWidth={1.5} />
                <span style={{ fontSize: '12px', color: colors.textMuted }}>Cluj Arena · Home</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ flexShrink: 0 }}>
          <p className="font-[Alexandria]" style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t.form}
          </p>
          <FormRow form={displayMatch.form} size="md" />
        </div>

        <div style={{ width: '1px', height: '48px', backgroundColor: colors.border }} />

        {/* Formation */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <p className="font-[Alexandria]" style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t.formation}
          </p>
          <span
            className="stat-mono"
            style={{ fontSize: '22px', fontWeight: 700, color: colors.text }}
          >
            {displayMatch.formation}
          </span>
        </div>

        {/* CTA */}
        <button className="font-[Alexandria]"
          onClick={() => navigate('/opponent-analysis')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: gold,
            color: '#0B0F1A',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {t.beginAnalysis}
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Main content: 2-col analysis list + right panel */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Recent analysis sessions */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              {t.recentAnalysis}
            </h3>
            <span style={{ fontSize: '10px', color: colors.textMuted }}>{displayAnalyses.length} sessions</span>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 80px 80px 100px',
              gap: '12px',
              padding: '6px 12px',
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderBottom: 'none',
              borderRadius: '4px 4px 0 0',
            }}
          >
            {['Opponent', t.formation, t.dateAnalyzed, t.form].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          <div
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '0 0 4px 4px',
              overflow: 'hidden',
            }}
          >
            {displayAnalyses.map((session, i) => (
              <div
                key={session.id}
                onClick={() => {
                  selectMatch(session.id);
                  navigate('/opponent-analysis');
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 80px 100px',
                  gap: '12px',
                  padding: '11px 12px',
                  borderBottom: i < displayAnalyses.length - 1 ? `1px solid ${colors.border}` : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    colors.elevated;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                {/* Opponent */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <OpponentCrest name={session.opponentName} size={28} />
                  <div>
                    <div className="font-[Alexandria]" style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                      {session.opponentName}
                    </div>
                    <div className="font-[Alexandria]" style={{ fontSize: '11px', color: colors.textMuted }}>{session.country}</div>
                  </div>
                </div>
                {/* Formation */}
                <span className="stat-mono font-[Alexandria]" style={{ fontSize: '13px', color: colors.text }}>
                  {session.formation}
                </span>
                {/* Date */}
                <span className="font-[Alexandria]" style={{ fontSize: '12px', color: colors.textMuted }}>{session.dateAnalyzed}</span>
                {/* Form */}
                <FormRow form={session.form} />
              </div>
            ))}
          </div>
        </div>

        {/* Right quick stats panel */}
        
      </div>
    </div>
  );
}
