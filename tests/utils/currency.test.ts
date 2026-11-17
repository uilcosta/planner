import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency } from '@/lib/utils';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('formats integer values correctly', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00');
    });

    it('formats small decimal values correctly', () => {
      expect(formatCurrency(0.99)).toBe('R$ 0,99');
    });

    it('formats large numbers correctly', () => {
      expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89');
    });

    it('handles string input correctly', () => {
      expect(formatCurrency('1234.56')).toBe('R$ 1.234,56');
    });

    it('handles null/undefined input as zero', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });

    it('handles negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-R$ 1.234,56');
    });
  });

  describe('parseCurrency', () => {
    it('parses formatted currency string to number', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
    });

    it('parses currency string without symbol', () => {
      expect(parseCurrency('1.234,56')).toBe(1234.56);
    });

    it('parses integer currency string', () => {
      expect(parseCurrency('R$ 1.000,00')).toBe(1000);
    });

    it('handles small values', () => {
      expect(parseCurrency('R$ 0,99')).toBe(0.99);
    });

    it('handles large values', () => {
      expect(parseCurrency('R$ 1.234.567,89')).toBe(1234567.89);
    });
  });

  describe('round-trip', () => {
    it('formatCurrency -> parseCurrency preserves value', () => {
      const original = 1234.56;
      const formatted = formatCurrency(original);
      const parsed = parseCurrency(formatted);
      expect(parsed).toBe(original);
    });

    it('handles various values', () => {
      const testValues = [0, 0.01, 0.99, 1, 10, 100, 1000, 10000, 1234567.89];
      testValues.forEach((value) => {
        const formatted = formatCurrency(value);
        const parsed = parseCurrency(formatted);
        expect(parsed).toBe(value);
      });
    });
  });
});
