import type { WDL } from '../data/mockData';

interface WDLPillProps {
  result: WDL;
  size?: 'sm' | 'md';
}

export function WDLPill({ result, size = 'sm' }: WDLPillProps) {
  const config = {
    W: { bg: '#16A34A', text: '#ffffff', label: 'W' },
    D: { bg: '#475569', text: '#ffffff', label: 'D' },
    L: { bg: '#DC2626', text: '#ffffff', label: 'L' },
  };
  const { bg, text, label } = config[result];
  const px = size === 'sm' ? '6px' : '10px';
  const py = size === 'sm' ? '2px' : '4px';
  const fontSize = size === 'sm' ? '10px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        color: text,
        fontSize,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        borderRadius: '3px',
        padding: `${py} ${px}`,
        minWidth: size === 'sm' ? '20px' : '24px',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
}

interface FormRowProps {
  form: WDL[];
  size?: 'sm' | 'md';
}

export function FormRow({ form, size = 'sm' }: FormRowProps) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {form.map((result, i) => (
        <WDLPill key={i} result={result} size={size} />
      ))}
    </div>
  );
}
