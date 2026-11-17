import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getMonthName,
  getShortMonthName,
  getMonthsForYear,
  getYearRange,
  getDaysInMonth,
  isValidDate,
} from '@/lib/utils';

describe('Date Utilities', () => {
  describe('getMonthName', () => {
    it('returns correct Portuguese month names', () => {
      expect(getMonthName(1)).toBe('Janeiro');
      expect(getMonthName(2)).toBe('Fevereiro');
      expect(getMonthName(3)).toBe('Março');
      expect(getMonthName(4)).toBe('Abril');
      expect(getMonthName(5)).toBe('Maio');
      expect(getMonthName(6)).toBe('Junho');
      expect(getMonthName(7)).toBe('Julho');
      expect(getMonthName(8)).toBe('Agosto');
      expect(getMonthName(9)).toBe('Setembro');
      expect(getMonthName(10)).toBe('Outubro');
      expect(getMonthName(11)).toBe('Novembro');
      expect(getMonthName(12)).toBe('Dezembro');
    });

    it('throws error for invalid month numbers', () => {
      expect(() => getMonthName(0)).toThrow('Month must be between 1 and 12');
      expect(() => getMonthName(13)).toThrow('Month must be between 1 and 12');
      expect(() => getMonthName(-1)).toThrow('Month must be between 1 and 12');
    });
  });

  describe('getShortMonthName', () => {
    it('returns correct Portuguese abbreviated month names', () => {
      expect(getShortMonthName(1)).toBe('Jan');
      expect(getShortMonthName(2)).toBe('Fev');
      expect(getShortMonthName(3)).toBe('Mar');
      expect(getShortMonthName(4)).toBe('Abr');
      expect(getShortMonthName(5)).toBe('Mai');
      expect(getShortMonthName(6)).toBe('Jun');
      expect(getShortMonthName(7)).toBe('Jul');
      expect(getShortMonthName(8)).toBe('Ago');
      expect(getShortMonthName(9)).toBe('Set');
      expect(getShortMonthName(10)).toBe('Out');
      expect(getShortMonthName(11)).toBe('Nov');
      expect(getShortMonthName(12)).toBe('Dez');
    });

    it('throws error for invalid month numbers', () => {
      expect(() => getShortMonthName(0)).toThrow('Month must be between 1 and 12');
      expect(() => getShortMonthName(13)).toThrow('Month must be between 1 and 12');
    });
  });

  describe('getMonthsForYear', () => {
    it('returns array of 12 month objects', () => {
      const months = getMonthsForYear(2026);
      expect(months).toHaveLength(12);
    });

    it('each month object has correct structure', () => {
      const months = getMonthsForYear(2026);
      months.forEach((month, index) => {
        expect(month).toEqual({
          value: index + 1,
          label: getMonthName(index + 1),
          shortLabel: getShortMonthName(index + 1),
        });
      });
    });
  });

  describe('getYearRange', () => {
    it('returns correct range with defaults', () => {
      const years = getYearRange();
      expect(years).toEqual([2025, 2026, 2027, 2028, 2029, 2030]);
    });

    it('returns correct range with custom start and end', () => {
      const years = getYearRange(2020, 2023);
      expect(years).toEqual([2020, 2021, 2022, 2023]);
    });

    it('returns single year when start equals end', () => {
      const years = getYearRange(2026, 2026);
      expect(years).toEqual([2026]);
    });
  });

  describe('getDaysInMonth', () => {
    it('returns correct days for each month', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31); // Janeiro
      expect(getDaysInMonth(2026, 2)).toBe(28); // Fevereiro (não bissexto)
      expect(getDaysInMonth(2024, 2)).toBe(29); // Fevereiro (bissexto)
      expect(getDaysInMonth(2026, 3)).toBe(31); // Março
      expect(getDaysInMonth(2026, 4)).toBe(30); // Abril
      expect(getDaysInMonth(2026, 5)).toBe(31); // Maio
      expect(getDaysInMonth(2026, 6)).toBe(30); // Junho
      expect(getDaysInMonth(2026, 7)).toBe(31); // Julho
      expect(getDaysInMonth(2026, 8)).toBe(31); // Agosto
      expect(getDaysInMonth(2026, 9)).toBe(30); // Setembro
      expect(getDaysInMonth(2026, 10)).toBe(31); // Outubro
      expect(getDaysInMonth(2026, 11)).toBe(30); // Novembro
      expect(getDaysInMonth(2026, 12)).toBe(31); // Dezembro
    });
  });

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date(2026, 10, 17); // 17 Nov 2026 (month is 0-indexed)
      expect(formatDate(date)).toBe('17/11/2026');
    });

    it('formats timestamp correctly', () => {
      const timestamp = new Date(2026, 10, 17).getTime();
      expect(formatDate(timestamp)).toBe('17/11/2026');
    });

    it('supports custom patterns', () => {
      const date = new Date(2026, 10, 17);
      expect(formatDate(date, 'dd/MM')).toBe('17/11');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2026-11-17');
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2026-11-15')).toBe(true);
      expect(isValidDate('2026-11-15T10:30:00')).toBe(true);
      expect(isValidDate(new Date(2026, 10, 15))).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('not-a-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });
});
