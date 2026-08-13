export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());
  return `${day}/${month}/${year}`;
}

export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function formatDateFR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export function dateToInput(ddmmyyyy) {
  if (!ddmmyyyy) return '';
  const p = ddmmyyyy.split('/');
  if (p.length !== 3) return '';
  return `${p[2]}-${p[1]}-${p[0]}`;
}

export function inputToDate(iso) {
  if (!iso) return '';
  const p = iso.split('-');
  if (p.length !== 3) return '';
  return `${p[2]}/${p[1]}/${p[0]}`;
}

export function parseDateFR(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    return new Date(year, parts[1] - 1, parts[0]);
  }
  return null;
}

export function getNextMonday(dateStr) {
  const date = parseDateFR(dateStr);
  if (!date) return '';
  const nextMonday = new Date(date);
  nextMonday.setDate(nextMonday.getDate() + 1);
  while (nextMonday.getDay() !== 1) {
    nextMonday.setDate(nextMonday.getDate() + 1);
  }
  return formatDate(nextMonday);
}

export function calculateDocDate(weekEnd) {
  if (!weekEnd) return new Date().toLocaleDateString('fr-FR');
  const nextMonday = getNextMonday(weekEnd);
  return nextMonday || new Date().toLocaleDateString('fr-FR');
}

function toMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getCurrentWeekRange() {
  const now = new Date();
  const monday = toMonday(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

export function getWeekByOffset(offset) {
  const now = new Date();
  const monday = toMonday(now);
  monday.setDate(monday.getDate() + (offset * 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

export function generateRefFromDate(dateStr) {
  const date = parseDateFR(dateStr);
  if (!date) return 'REF-00000000';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `REF-${y}${m}${d}`;
}

export function getNextMondayDateStr(weekEnd) {
  const date = parseDateFR(weekEnd);
  if (!date) return '';
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (next.getDay() !== 1) {
    next.setDate(next.getDate() + 1);
  }
  return formatDate(next);
}

export function getDayName(dateStr) {
  if (!dateStr) return '';
  const date = parseDateFR(dateStr);
  if (!date) return '';
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[date.getDay()] || '';
}

export function getDaysOfWeek() {
  return ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function getMonthName(monthIndex) {
  return MONTH_NAMES_FR[monthIndex] || '';
}

export function getMonthLabel(year, month) {
  return `${MONTH_NAMES_FR[month]} ${year}`;
}

function getFirstMondayOfMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  return toMonday(firstDay);
}

function getLastSundayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0);
  const day = lastDay.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(lastDay);
  sunday.setDate(lastDay.getDate() + diff);
  return sunday;
}

export function getMonthWeeks(year, month) {
  const weeks = [];
  let monday = getFirstMondayOfMonth(year, month);
  const lastSunday = getLastSundayOfMonth(year, month);

  while (monday <= lastSunday) {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    weeks.push({
      start: formatDate(monday),
      end: formatDate(sunday)
    });
    monday.setDate(monday.getDate() + 7);
  }

  return weeks;
}

export function getAdjacentMonth(year, month, offset) {
  let newMonth = month + offset;
  let newYear = year;
  while (newMonth < 0) { newMonth += 12; newYear--; }
  while (newMonth > 11) { newMonth -= 12; newYear++; }
  return { year: newYear, month: newMonth };
}

export function generateWeekId() {
  const now = new Date();
  return `${now.getFullYear()}-W${String(now.getWeekNumber()).padStart(2, '0')}`;
}

Date.prototype.getWeekNumber = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};
