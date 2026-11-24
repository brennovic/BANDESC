export function formatCDU(value) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return `${safe.toLocaleString('pt-BR')} CDU`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatEventDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name) {
  const parts = String(name || 'Estudante')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'ES';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
