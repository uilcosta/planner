import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Combines class names with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Brazilian Real (BRL) currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : (value ?? 0);

  // Use Intl.NumberFormat with pt-BR locale; replace non-breaking space with regular space for consistency
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numericValue)
    .replace(/ /g, ' ');
}

/**
 * Formats a date as a localized string in pt-BR
 * @param date - The date to format (Date object, ISO string, or timestamp)
 * @param pattern - Optional date-fns pattern (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, pattern = 'dd/MM/yyyy'): string {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Parse ISO string as local date to avoid timezone issues
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date(date);
  }

  // Handle MMMM pattern with our own Portuguese month names for consistency
  if (pattern.includes('MMMM')) {
    const monthName = getMonthName(dateObj.getMonth() + 1);
    return pattern.replace('MMMM', monthName);
  }
  if (pattern.includes('MMM')) {
    const monthName = getShortMonthName(dateObj.getMonth() + 1);
    return pattern.replace('MMM', monthName);
  }

  return format(dateObj, pattern, { locale: ptBR });
}

/**
 * Formats a date with time as a localized string in pt-BR
 * @param date - The date to format
 * @returns Formatted date string (e.g., "15/11/2026 14:30")
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Returns the Portuguese (Brazil) month name for a given month number (1-12)
 * @param month - Month number (1 = Janeiro, 12 = Dezembro)
 * @returns Month name in Portuguese
 */
export function getMonthName(month: number): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Month must be between 1 and 12.`);
  }

  return months[month - 1];
}

/**
 * Returns the short Portuguese (Brazil) month name for a given month number (1-12)
 * @param month - Month number (1 = Jan, 12 = Dez)
 * @returns Short month name in Portuguese
 */
export function getShortMonthName(month: number): string {
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Month must be between 1 and 12.`);
  }

  return months[month - 1];
}

/**
 * Returns an array of month objects for a given year
 * @param _year - Year (e.g., 2026) - unused but kept for API consistency
 * @returns Array of { value: number, label: string, shortLabel: string }
 */
export function getMonthsForYear(
  _year: number
): Array<{ value: number; label: string; shortLabel: string }> {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
    shortLabel: getShortMonthName(i + 1),
  }));
}

/**
 * Returns an array of years for the month/year picker
 * @param startYear - Start year (default: 2025)
 * @param endYear - End year (default: 2030)
 * @returns Array of year numbers
 */
export function getYearRange(startYear = 2025, endYear = 2030): number[] {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
}

/**
 * Parses a currency string (e.g., "R$ 1.234,56") to a number
 * @param currencyString - Currency string in pt-BR format
 * @returns Numeric value
 */
export function parseCurrency(currencyString: string): number {
  // Remove R$, spaces, and replace comma with dot
  const cleaned = currencyString
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  return parseFloat(cleaned) || 0;
}

/**
 * Calculates variance percentage between planned and actual values
 * @param planned - Planned value
 * @param actual - Actual value
 * @returns Variance percentage
 */
export function calculateVariance(planned: number, actual: number): number {
  if (planned === 0) return actual > 0 ? 100 : 0;
  return ((actual - planned) / Math.abs(planned)) * 100;
}

/**
 * Returns variance color based on percentage
 * @param variance - Variance percentage
 * @returns Color category: "success" | "danger" | "warning" | "neutral"
 */
export function getVarianceColor(variance: number): 'success' | 'danger' | 'warning' | 'neutral' {
  if (variance > 10) return 'danger';
  if (variance < -10) return 'success';
  if (variance > 0) return 'warning';
  return 'neutral';
}

/**
 * Returns the number of days in a given month/year
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Number of days
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Adjusts day of month to fit within the valid range for a given month/year
 * @param day - Day to adjust
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Adjusted day
 */
export function adjustDayOfMonth(day: number, year: number, month: number): number {
  const maxDay = getDaysInMonth(year, month);
  return Math.min(day, maxDay);
}

/**
 * Checks if a date is valid
 * @param date - Date to check
 * @returns True if valid
 */
export function isValidDate(date: Date | string | number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d instanceof Date && !isNaN(d.getTime());
}
