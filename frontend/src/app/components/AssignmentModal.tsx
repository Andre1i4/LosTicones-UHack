import { useState, useEffect, useRef } from 'react';
import { X, Paperclip, FileText, Film, Image, File, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../translations';
import type { OpponentPlayer } from '../data/mockData';
import { UCLUJ_PLAYERS } from '../data/mockData';
import type { Attachment } from '../context/AppContext';

interface AssignmentModalProps {
  opponent: OpponentPlayer | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (uclujPlayerId: string, note: string, attachments: Attachment[]) => void;
  existingAssignment?: { uclujPlayerId: string; note: string; attachments: Attachment[] };
}

function getFileType(file: File): Attachment['fileType'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  return 'document';
}

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

export function AssignmentModal({
  opponent,
  open,
  onClose,
  onConfirm,
  existingAssignment,
}: AssignmentModalProps) {
  const { colors, language } = useApp();
  const t = useT(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedUclujId, setSelectedUclujId] = useState(existingAssignment?.uclujPlayerId || '');
  const [note, setNote] = useState(existingAssignment?.note || '');
  const [attachments, setAttachments] = useState<Attachment[]>(existingAssignment?.attachments || []);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setSelectedUclujId(existingAssignment?.uclujPlayerId || '');
    setNote(existingAssignment?.note || '');
    setAttachments(existingAssignment?.attachments || []);
  }, [opponent?.id, open]);

  if (!open || !opponent) return null;

  const handleConfirm = () => {
    if (!selectedUclujId) return;
    onConfirm(selectedUclujId, note, attachments);
    onClose();
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      const fileType = getFileType(file);
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = e => {
          setAttachments(prev => [...prev, {
            id,
            name: file.name,
            fileType,
            dataUrl: e.target?.result as string,
            size: file.size,
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, {
          id,
          name: file.name,
          fileType,
          size: file.size,
        }]);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const selectedUcluj = UCLUJ_PLAYERS.find(p => p.id === selectedUclujId);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: colors.elevated,
          border: `1px solid ${colors.border}`,
          borderRadius: '4px',
          width: '500px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
              {t.assignPlayer} — #{opponent.number} · {opponent.positionShort}
            </p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: 0 }}>
              {opponent.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, display: 'flex', alignItems: 'center' }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* UCLuj player selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {t.assignTo}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {UCLUJ_PLAYERS.filter(p => p.positionShort !== 'GK').map(player => {
                const isSelected = player.id === selectedUclujId;
                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedUclujId(player.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderTop: `1px solid ${isSelected ? colors.gold : colors.border}`,
                      borderRight: `1px solid ${isSelected ? colors.gold : colors.border}`,
                      borderBottom: `1px solid ${isSelected ? colors.gold : colors.border}`,
                      borderLeft: isSelected ? `3px solid ${colors.gold}` : `1px solid ${colors.border}`,
                      backgroundColor: isSelected ? `${colors.gold}12` : 'transparent',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? colors.gold : colors.elevated,
                        border: `1px solid ${isSelected ? colors.gold : colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? colors.bg : colors.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {player.number}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text, lineHeight: 1.2 }}>{player.name}</div>
                      <div style={{ fontSize: '10px', color: colors.textMuted }}>{player.positionShort}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tactical note */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {t.tacticalNote}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t.tacticalNotePlaceholder}
              rows={3}
              style={{
                width: '100%',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '3px',
                color: colors.text,
                fontSize: '13px',
                padding: '10px 12px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
                boxSizing: 'border-box',
                lineHeight: 1.5,
              }}
              onFocus={e => (e.target.style.borderColor = colors.gold)}
              onBlur={e => (e.target.style.borderColor = colors.border)}
            />
          </div>

          {/* Attachments section */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Attachments
            </label>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? colors.gold : colors.border}`,
                borderRadius: '6px',
                padding: '18px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dragOver ? `${colors.gold}08` : colors.card,
                transition: 'all 150ms ease',
                marginBottom: attachments.length > 0 ? '10px' : '0',
              }}
            >
              <Paperclip size={18} strokeWidth={1.5} color={dragOver ? colors.gold : colors.textMuted} style={{ margin: '0 auto 6px' }} />
              <p style={{ margin: 0, fontSize: '12px', color: dragOver ? colors.gold : colors.textMuted }}>
                Drop files here or <span style={{ textDecoration: 'underline' }}>browse</span>
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '10px', color: colors.textMuted }}>
                Images · Videos · PDFs · Documents
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {attachments.map(att => (
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
                    {/* Thumbnail or icon */}
                    {att.fileType === 'image' && att.dataUrl ? (
                      <img src={att.dataUrl} alt={att.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                    ) : (
                      <div style={{
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
                      }}>
                        {FILE_TYPE_ICON[att.fileType]}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {att.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '10px', color: colors.textMuted }}>
                        {att.fileType.toUpperCase()} · {formatSize(att.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0 }}
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedUcluj && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: `${colors.gold}10`,
                border: `1px solid ${colors.gold}30`,
                borderRadius: '3px',
                marginBottom: '16px',
                fontSize: '12px',
                color: colors.text,
              }}
            >
              <span style={{ color: colors.textMuted }}>Matchup: </span>
              <strong style={{ color: colors.gold }}>{selectedUcluj.name}</strong>
              <span style={{ color: colors.textMuted }}> marks </span>
              <strong style={{ color: colors.text }}>{opponent.name}</strong>
              {attachments.length > 0 && (
                <span style={{ color: colors.textMuted }}> · {attachments.length} attachment{attachments.length > 1 ? 's' : ''}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <button
            onClick={handleConfirm}
            disabled={!selectedUclujId}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: selectedUclujId ? colors.gold : colors.border,
              color: selectedUclujId ? '#0B0F1A' : colors.textMuted,
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.05em',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedUclujId ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              transition: 'opacity 150ms ease',
              marginBottom: '10px',
            }}
            onMouseEnter={e => { if (selectedUclujId) (e.currentTarget.style.opacity = '0.88'); }}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {t.confirmAssignment}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}