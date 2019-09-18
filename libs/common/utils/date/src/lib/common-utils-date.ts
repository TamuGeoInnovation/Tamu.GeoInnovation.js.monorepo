export function dateForDateTimeString(time: string, baseDate?: Date): Date {
  const tilde_offset = time.startsWith('~') ? 1 : 0;
  const hours = parseInt(time.substr(tilde_offset, 2), 10);
  const minutes = parseInt(time.substr(tilde_offset + 3, 2), 10);
  const is_afternoon = time.substr(tilde_offset + 6) === 'PM';
  const date = baseDate == null ? new Date() : new Date(baseDate);
  date.setHours(hours + (is_afternoon && hours !== 12 ? 12 : 0), minutes, 0);
  return date;
}

export function timeStringForDate(date: Date): string {
  let hours = date.getHours();
  let ampm = 'AM';
  if (hours > 12) {
    hours -= 12;
    ampm = 'PM';
  }
  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, '0');
  return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
}
