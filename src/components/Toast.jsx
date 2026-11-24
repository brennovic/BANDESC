import { AlertCircle, BadgeCheck, Info, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  if (!toast?.message) return null;

  const tone = toast.tone || 'success';
  const Icon = tone === 'error' ? AlertCircle : tone === 'info' ? Info : BadgeCheck;

  return (
    <div
      className={`toast toast-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{toast.message}</span>
      {onDismiss && (
        <button
          type="button"
          className="toast-close"
          onClick={onDismiss}
          aria-label="Fechar aviso"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
