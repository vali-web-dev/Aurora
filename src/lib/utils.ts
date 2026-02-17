type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
type ClassArray = ClassValue[];
type ClassDictionary = { [key: string]: any };

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    const type = typeof cls;

    if (type === 'string' || type === 'number') {
      result.push(String(cls));
    } else if (Array.isArray(cls)) {
      const inner = cn(...cls);
      if (inner) result.push(inner);
    } else if (type === 'object') {
      for (const key in cls as ClassDictionary) {
        if ((cls as ClassDictionary)[key]) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

const toDate = (value: Date | string | number): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

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

export const formatDate = (date: Date | string | number): string => {
  const safeDate = toDate(date);
  if (!safeDate) return '';
  const month = pad2(safeDate.getUTCMonth() + 1);
  const day = pad2(safeDate.getUTCDate());
  const year = safeDate.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

export const formatTime = (date: Date | string | number): string => {
  const safeDate = toDate(date);
  if (!safeDate) return '';
  const hours = safeDate.getUTCHours();
  const minutes = pad2(safeDate.getUTCMinutes());
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad2(displayHour)}:${minutes} ${period}`;
};

export const formatDateTime = (date: Date | string | number): string => {
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date);
  if (!formattedDate && !formattedTime) return '';
  if (!formattedDate) return formattedTime;
  if (!formattedTime) return formattedDate;
  return `${formattedDate} ${formattedTime}`;
};

export const formatLongDate = (date: Date | string | number): string => {
  const safeDate = toDate(date);
  if (!safeDate) return '';
  const weekday = weekdayNames[safeDate.getUTCDay()];
  const month = monthNames[safeDate.getUTCMonth()];
  const day = safeDate.getUTCDate();
  return `${weekday}, ${month} ${day}`;
};

export const formatNumber = (value: number): string => {
  const sign = value < 0 ? '-' : '';
  const [whole, fraction] = Math.abs(value).toString().split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${withCommas}${fraction ? `.${fraction}` : ''}`;
};
