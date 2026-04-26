import { useState, useRef, useEffect } from 'react';
import { Send, Bell, MessageSquare, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';

export function SendToPlayersPopover() {
  const { colors, language, assignments } = useApp();
  const t = useT(language);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSend = (type: string) => {
    setSent(type);
    setTimeout(() => {
      setSent(null);
      setOpen(false);
    }, 1800);
  };

  const actions = [
    { id: 'push', icon: Bell, label: t.pushNotification },
    { id: 'message', icon: MessageSquare, label: t.inAppMessage },
    { id: 'ai', icon: Sparkles, label: t.aiSummary },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 16px',
          backgroundColor: colors.gold,
          color: '#0B0F1A',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '12px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <Send size={13} />
        {t.sendToPlayers}
        {assignments.length > 0 && (
          <span
            style={{
              backgroundColor: '#0B0F1A',
              color: colors.gold,
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 6px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {assignments.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            width: '220px',
            backgroundColor: colors.elevated,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: `1px solid ${colors.border}`,
              fontSize: '10px',
              fontWeight: 600,
              color: colors.textMuted,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {t.sendToPlayers} — {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </div>
          {actions.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleSend(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 14px',
                backgroundColor: sent === id ? `${colors.gold}15` : 'transparent',
                border: 'none',
                borderBottom: `1px solid ${colors.border}`,
                color: sent === id ? colors.gold : colors.text,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={e => {
                if (sent !== id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${colors.border}50`;
              }}
              onMouseLeave={e => {
                if (sent !== id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              {sent === id
                ? <Check size={15} strokeWidth={2} />
                : <Icon size={15} strokeWidth={1.5} color={colors.textMuted} />}
              <span>{sent === id ? 'Sent!' : label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
