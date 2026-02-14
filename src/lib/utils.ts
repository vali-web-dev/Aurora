export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((c): c is string => typeof c === 'string' && c.length > 0)
    .join(' ');
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const formatDate = (date: Date): string => {
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

export const formatTime = (date: Date): string => {
  const hours = date.getUTCHours();
  const minutes = pad2(date.getUTCMinutes());
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad2(displayHour)}:${minutes} ${period}`;
};

export const formatDateTime = (date: Date): string => `${formatDate(date)} ${formatTime(date)}`;

export const formatLongDate = (date: Date): string => {
  const weekday = weekdayNames[date.getUTCDay()];
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  return `${weekday}, ${month} ${day}`;
};

export const formatNumber = (value: number): string => {
  const sign = value < 0 ? '-' : '';
  const [whole, fraction] = Math.abs(value).toString().split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${withCommas}${fraction ? `.${fraction}` : ''}`;
};
