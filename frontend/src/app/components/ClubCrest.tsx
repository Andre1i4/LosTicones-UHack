import uclujLogo from '../../imports/UCluj_Sigla.png';

interface ClubCrestProps {
  size?: number;
  className?: string;
}

export function ClubCrest({ size = 36, className = '' }: ClubCrestProps) {
  return (
    <img
      src={uclujLogo}
      width={size}
      height={size}
      alt="U Cluj"
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
}

// Opponent club crest placeholder (uses initials)
interface OpponentCrestProps {
  name: string;
  size?: number;
  className?: string;
}

export function OpponentCrest({ name, size = 36, className = '' }: OpponentCrestProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');

  const colors: Record<string, string> = {
    'Rapid București': '#DC2626',
    'CFR Cluj': '#7C3AED',
    'FCSB': '#DC2626',
    'Farul Constanța': '#0891B2',
    'Petrolul Ploiești': '#D97706',
    'Sepsi OSK': '#16A34A',
    'Dinamo București': '#DC2626',
  };
  const fill = colors[name] || '#475569';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 2L4 8V26C4 35.941 11.046 44.214 20 46C28.954 44.214 36 35.941 36 26V8L20 2Z"
        fill={fill}
        opacity="0.15"
      />
      <path
        d="M20 2L4 8V26C4 35.941 11.046 44.214 20 46C28.954 44.214 36 35.941 36 26V8L20 2Z"
        stroke={fill}
        strokeWidth="1.5"
        fill="none"
      />
      <text
        x="20"
        y="31"
        textAnchor="middle"
        fill={fill}
        fontSize="13"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
      >
        {initials}
      </text>
    </svg>
  );
}
