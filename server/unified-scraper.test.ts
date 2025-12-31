import { describe, it, expect } from 'vitest';
import { normalizeMatchUrl, generateMatchKey } from './unified-scraper';

describe('normalizeMatchUrl', () => {
  it('should remove trailing slashes', () => {
    expect(normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501/')).toBe(
      'https://www.jleague.jp/match/j1/2025/021501'
    );
  });

  it('should remove sub-paths like /ticket/, /player/', () => {
    expect(normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501/ticket/')).toBe(
      'https://www.jleague.jp/match/j1/2025/021501'
    );
    expect(normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501/player/')).toBe(
      'https://www.jleague.jp/match/j1/2025/021501'
    );
    expect(normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501/live/')).toBe(
      'https://www.jleague.jp/match/j1/2025/021501'
    );
  });

  it('should remove query params and hash', () => {
    expect(normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501?ref=top')).toBe(
      'https://www.jleague.jp/match/j1/2025/021501'
    );
    expect(normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501#section')).toBe(
      'https://www.jleague.jp/match/j1/2025/021501'
    );
  });

  it('should return null for null/undefined input', () => {
    expect(normalizeMatchUrl(null)).toBeNull();
    expect(normalizeMatchUrl(undefined)).toBeNull();
    expect(normalizeMatchUrl('')).toBeNull();
  });

  it('should handle complex URLs', () => {
    expect(
      normalizeMatchUrl('https://www.jleague.jp/match/j1/2025/021501/ticket/online/?utm_source=google')
    ).toBe('https://www.jleague.jp/match/j1/2025/021501');
  });
});

describe('generateMatchKey', () => {
  it('should generate key from matchUrl if available', () => {
    const key = generateMatchKey({
      date: '2025-02-15',
      opponent: '新潟',
      matchUrl: 'https://www.jleague.jp/match/j1/2025/021501/',
    });
    expect(key).toMatch(/^(jleague-|url-)/);
  });

  it('should fallback to date+opponent+kickoff when no matchUrl', () => {
    const key = generateMatchKey({
      date: '2025-02-15',
      opponent: '新潟',
      kickoff: '14:00',
      competition: 'J1リーグ',
    });
    expect(key).toBe('2025-02-15-新潟-14:00-J1リーグ');
  });

  it('should use away team if opponent is not set', () => {
    const key = generateMatchKey({
      date: '2025-02-15',
      away: '浦和',
      kickoff: '14:00',
    });
    expect(key).toBe('2025-02-15-浦和-14:00');
  });

  it('should handle missing data gracefully', () => {
    const key = generateMatchKey({});
    expect(key).toBe('unknown');
  });
});
