import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateTime, formatWDL, formatScore, calcAverage } from './formatters';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234)).toBe('¥1,234');
    expect(formatCurrency(0)).toBe('¥0');
    expect(formatCurrency(1000000)).toBe('¥1,000,000');
  });

  it('handles string input', () => {
    expect(formatCurrency('5000')).toBe('¥5,000');
    expect(formatCurrency('0')).toBe('¥0');
  });

  it('returns ¥0 for null/undefined/empty', () => {
    expect(formatCurrency(null)).toBe('¥0');
    expect(formatCurrency(undefined)).toBe('¥0');
    expect(formatCurrency('')).toBe('¥0');
  });

  it('returns ¥0 for NaN', () => {
    expect(formatCurrency('abc')).toBe('¥0');
    expect(formatCurrency(NaN)).toBe('¥0');
  });
});

describe('formatDateTime', () => {
  it('formats short date correctly', () => {
    const result = formatDateTime('2025-03-15', 'short');
    expect(result).toBe('2025/03/15');
  });

  it('formats long date correctly', () => {
    const result = formatDateTime('2025-03-15', 'long');
    expect(result).toContain('2025');
    expect(result).toContain('3');
    expect(result).toContain('15');
  });

  it('formats date with weekday', () => {
    const result = formatDateTime('2025-03-15', 'withWeekday');
    expect(result).toContain('2025');
    expect(result).toContain('土');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
    expect(formatDateTime('')).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDateTime('invalid-date')).toBe('');
  });

  it('handles Date object input', () => {
    const date = new Date('2025-03-15');
    const result = formatDateTime(date, 'short');
    expect(result).toBe('2025/03/15');
  });
});

describe('formatWDL', () => {
  it('formats win/draw/loss correctly', () => {
    expect(formatWDL(3, 2, 1)).toBe('3勝 2分 1敗');
    expect(formatWDL(10, 5, 3)).toBe('10勝 5分 3敗');
  });

  it('includes unknown when present', () => {
    expect(formatWDL(3, 2, 1, 2)).toBe('3勝 2分 1敗 2未確定');
  });

  it('does not include unknown when zero', () => {
    expect(formatWDL(3, 2, 1, 0)).toBe('3勝 2分 1敗');
  });

  it('handles null/undefined as 0', () => {
    expect(formatWDL(null, undefined, 0)).toBe('0勝 0分 0敗');
  });

  it('handles all zeros', () => {
    expect(formatWDL(0, 0, 0)).toBe('0勝 0分 0敗');
  });
});

describe('formatScore', () => {
  it('formats score correctly', () => {
    expect(formatScore(2, 1)).toBe('2-1');
    expect(formatScore(0, 0)).toBe('0-0');
  });

  it('returns vs for missing scores', () => {
    expect(formatScore(null, 1)).toBe('vs');
    expect(formatScore(2, undefined)).toBe('vs');
    expect(formatScore(null, null)).toBe('vs');
    expect(formatScore(undefined, undefined)).toBe('vs');
  });
});

describe('calcAverage', () => {
  it('calculates average correctly', () => {
    expect(calcAverage(1000, 4)).toBe(250);
    expect(calcAverage(100, 3)).toBe(33);
  });

  it('returns 0 for zero count', () => {
    expect(calcAverage(1000, 0)).toBe(0);
  });

  it('returns 0 for null/undefined', () => {
    expect(calcAverage(null, 5)).toBe(0);
    expect(calcAverage(1000, null)).toBe(0);
    expect(calcAverage(null, null)).toBe(0);
  });
});
