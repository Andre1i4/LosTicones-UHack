import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | null;
  highlight?: boolean;
  compact?: boolean;
}

export function StatRow({ label, value, unit, trend, highlight, compact }: StatRowProps) {
  const { colors } = useApp();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: compact ? '5px 0' : '7px 0',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span className="font-[Alexandria]" style={{ fontSize: '12px', color: colors.textMuted, letterSpacing: '0.01em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {trend === 'up' && <TrendingUp size={12} color="#16A34A" />}
        {trend === 'down' && <TrendingDown size={12} color="#DC2626" />}
        <span
          className="stat-mono font-[Alexandria]"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: highlight ? colors.gold : colors.text,
          }}
        >
          {value}
          {unit && (
            <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: '2px' }}>{unit}</span>
          )}
        </span>
      </div>
    </div>
  );
}

interface ProgressStatProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function ProgressStat({ label, value, max = 100, color }: ProgressStatProps) {
  const { colors } = useApp();
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span className="font-[Alexandria]" style={{ fontSize: '12px', color: colors.textMuted }}>{label}</span>
        <span className="stat-mono font-[Alexandria]" style={{ fontSize: '12px', color: colors.text, fontWeight: 500 }}>
          {value}
          {max === 100 ? '%' : ''}
        </span>
      </div>
      <div
        style={{
          height: '3px',
          backgroundColor: colors.border,
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color || colors.gold,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}