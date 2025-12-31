import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  isMarinosName,
  detectMarinosSide,
  deriveOpponent,
  parseJapaneseDateToISO,
  toMatchBaseUrl,
  type RawMatchData,
} from './scraper';

describe('Scraper Utilities', () => {
  describe('normalizeText', () => {
    it('should remove extra whitespace and newlines', () => {
      expect(normalizeText('  横浜FM  \n  vs  \n  新潟  ')).toBe('横浜FM vs 新潟');
    });

    it('should handle empty strings', () => {
      expect(normalizeText('')).toBe('');
    });

    it('should handle undefined', () => {
      expect(normalizeText(undefined)).toBe('');
    });
  });

  describe('isMarinosName', () => {
    it('should recognize Marinos names', () => {
      expect(isMarinosName('横浜FM')).toBe(true);
      expect(isMarinosName('横浜ＦＭ')).toBe(true);
      expect(isMarinosName('横浜F・マリノス')).toBe(true);
      expect(isMarinosName('横浜Ｆ・マリノス')).toBe(true);
    });

    it('should not recognize other team names', () => {
      expect(isMarinosName('新潟')).toBe(false);
      expect(isMarinosName('浦和')).toBe(false);
      expect(isMarinosName('川崎')).toBe(false);
    });
  });

  describe('parseJapaneseDateToISO', () => {
    it('should convert Japanese date format to ISO', () => {
      expect(parseJapaneseDateToISO('2025年2月12日')).toBe('2025-02-12');
    });

    it('should handle single-digit months and days', () => {
      expect(parseJapaneseDateToISO('2025年1月5日')).toBe('2025-01-05');
    });

    it('should return null for invalid format', () => {
      expect(parseJapaneseDateToISO('2025-02-12')).toBe(null);
    });
  });

  describe('toMatchBaseUrl', () => {
    it('should normalize match URLs to base format', () => {
      expect(toMatchBaseUrl('https://www.jleague.jp/match/j1/2025/021501/live/')).toBe('https://www.jleague.jp/match/j1/2025/021501/');
    });

    it('should handle relative URLs', () => {
      expect(toMatchBaseUrl('/match/j1/2025/021501/live/')).toBe('https://www.jleague.jp/match/j1/2025/021501/');
    });

    it('should return null for invalid URLs', () => {
      expect(toMatchBaseUrl('https://www.jleague.jp/club/yokohamafm/')).toBe(null);
    });

    it('should return null for empty input', () => {
      expect(toMatchBaseUrl('')).toBe(null);
    });
  });

  describe('detectMarinosSide', () => {
    it('should detect Marinos as home team', () => {
      expect(detectMarinosSide('横浜FM', '新潟')).toBe('home');
    });

    it('should detect Marinos as away team', () => {
      expect(detectMarinosSide('新潟', '横浜FM')).toBe('away');
    });

    it('should return null if Marinos is not found', () => {
      expect(detectMarinosSide('新潟', '浦和')).toBe(null);
    });
  });

  describe('deriveOpponent', () => {
    it('should extract opponent when Marinos is home', () => {
      expect(deriveOpponent('横浜FM', '新潟')).toBe('新潟');
    });

    it('should extract opponent when Marinos is away', () => {
      expect(deriveOpponent('新潟', '横浜FM')).toBe('新潟');
    });
  });
});

describe('Scraper Data Validation', () => {
  it('should validate RawMatchData structure', () => {
    const mockMatch: RawMatchData = {
      sourceKey: 'j1/2025/021501',
      date: '2025-02-15',
      kickoff: '14:00',
      competition: 'J1',
      roundLabel: '第1節',
      roundNumber: 1,
      homeTeam: '横浜FM',
      awayTeam: '新潟',
      opponent: '新潟',
      stadium: '日産スタジアム',
      marinosSide: 'home',
      homeScore: 1,
      awayScore: 1,
      status: '試合終了',
      isResult: true,
      matchUrl: 'https://www.jleague.jp/match/j1/2025/021501/live/',
    };

    expect(mockMatch.sourceKey).toBeDefined();
    expect(mockMatch.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mockMatch.homeTeam).toBeDefined();
    expect(mockMatch.awayTeam).toBeDefined();
    expect(mockMatch.opponent).toBeDefined();
    expect(mockMatch.marinosSide).toMatch(/^(home|away)$/);
    expect(mockMatch.isResult).toBe(true);
    expect(mockMatch.matchUrl).toMatch(/^https?:\/\//);
  });

  it('should handle partial match data', () => {
    const mockMatch: Partial<RawMatchData> = {
      sourceKey: 'j1/2025/021501',
      date: '2025-02-15',
      homeTeam: '横浜FM',
      awayTeam: '新潟',
      opponent: '新潟',
      marinosSide: 'home',
      isResult: false,
      matchUrl: 'https://www.jleague.jp/match/j1/2025/021501/live/',
    };

    expect(mockMatch.sourceKey).toBeDefined();
    expect(mockMatch.kickoff).toBeUndefined();
    expect(mockMatch.homeScore).toBeUndefined();
    expect(mockMatch.isResult).toBe(false);
  });
});
