const TZ = 'America/Campo_Grande';

const DAY_MAP: Record<string, number> = {
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6,
};

export function nowInCampoGrande(): { dayOfWeek: number; time: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find(p => p.type === 'weekday')?.value?.toLowerCase().replace('.', '') ?? '';
  const hour    = parts.find(p => p.type === 'hour')?.value   ?? '00';
  const minute  = parts.find(p => p.type === 'minute')?.value ?? '00';

  return {
    dayOfWeek: DAY_MAP[weekday] ?? 0,
    time: `${hour}:${minute}`,
  };
}

// Suporta virada de meia-noite (ex: openTime "22:00", closeTime "02:00")
export function isWithinSchedule(openTime: string, closeTime: string, current: string): boolean {
  if (closeTime > openTime) return current >= openTime && current <= closeTime;
  return current >= openTime || current <= closeTime;
}

// Sem horários cadastrados = sem restrição (sempre disponível)
export function isScheduleAvailableNow(
  schedules: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[],
): boolean {
  if (schedules.length === 0) return true;

  const { dayOfWeek, time } = nowInCampoGrande();
  const todaySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
  if (!todaySchedule || !todaySchedule.isOpen) return false;

  return isWithinSchedule(todaySchedule.openTime, todaySchedule.closeTime, time);
}
