/**
 * Date and time helper utilities tailored for smart task management
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(dateStr: string, timeStr?: string): {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  if (!dateStr) {
    return { text: 'Sans date', isOverdue: false, isToday: false, isTomorrow: false };
  }

  const todayStr = getTodayDateString();
  const today = new Date(todayStr + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const timeSuffix = timeStr ? ` à ${timeStr}` : '';

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    const dayLabel = daysAgo === 1 ? '1 jour' : `${daysAgo} jours`;
    return {
      text: `En retard de ${dayLabel}${timeSuffix}`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }

  if (diffDays === 0) {
    // Check if time is past today
    let isPastTime = false;
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const now = new Date();
      if (now.getHours() > h || (now.getHours() === h && now.getMinutes() > m)) {
        isPastTime = true;
      }
    }

    return {
      text: isPastTime ? `En retard aujourd'hui${timeSuffix}` : `Aujourd'hui${timeSuffix}`,
      isOverdue: isPastTime,
      isToday: true,
      isTomorrow: false,
    };
  }

  if (diffDays === 1) {
    return {
      text: `Demain${timeSuffix}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
    };
  }

  if (diffDays > 1 && diffDays <= 6) {
    const weekday = target.toLocaleDateString('fr-FR', { weekday: 'long' });
    const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return {
      text: `${capitalized}${timeSuffix}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
    };
  }

  // Format full French date e.g. "14 nov. 2026"
  const formatted = target.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });

  return {
    text: `${formatted}${timeSuffix}`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
  };
}

export function isTaskOverdue(dueDate: string, dueTime?: string, completed?: boolean): boolean {
  if (completed) return false;
  if (!dueDate) return false;

  const now = new Date();
  const dateParts = dueDate.split('-').map(Number);
  let hours = 23;
  let minutes = 59;

  if (dueTime) {
    const timeParts = dueTime.split(':').map(Number);
    hours = timeParts[0];
    minutes = timeParts[1];
  }

  const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes, 0);
  return now.getTime() > targetDate.getTime();
}

export function isDueToday(dueDate: string): boolean {
  return dueDate === getTodayDateString();
}

export function isDueWithinDays(dueDate: string, days: number): boolean {
  if (!dueDate) return false;
  const todayStr = getTodayDateString();
  const today = new Date(todayStr + 'T00:00:00');
  const target = new Date(dueDate + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}
