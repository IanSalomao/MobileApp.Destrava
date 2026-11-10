// Formata uma data em tempo relativo, no estilo usado nos cards das listas ("Há 12 min",
// "Ontem"). O "agora" é injetável para os testes ficarem determinísticos.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < MINUTE) return 'Agora';

  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return `Há ${minutes} min`;
  }

  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return `Há ${hours} h`;
  }

  if (diffMs < 2 * DAY) return 'Ontem';

  const days = Math.floor(diffMs / DAY);
  if (days < 7) return `Há ${days} dias`;

  return formatDate(date);
}
