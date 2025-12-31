import { describe, it, expect } from 'vitest';
import { toMatchDTO, createEmptyStatsSummary } from './dto';

describe('toMatchDTO', () => {
  it('transforms raw data to DTO with required fields', () => {
    const raw = {
      id: 1,
      sourceKey: 'test-key',
      date: '2025-03-15',
      homeTeam: 'Yokohama FM',
      awayTeam: 'Urawa',
      matchUrl: 'https://example.com/match/1',
    };
    
    const dto = toMatchDTO(raw);
    
    expect(dto.id).toBe(1);
    expect(dto.sourceKey).toBe('test-key');
    expect(dto.date).toBe('2025-03-15');
    expect(dto.homeTeam).toBe('Yokohama FM');
    expect(dto.awayTeam).toBe('Urawa');
    expect(dto.matchUrl).toBe('https://example.com/match/1');
  });

  it('defaults optional fields to null', () => {
    const raw = {
      id: 1,
      sourceKey: 'test-key',
      date: '2025-03-15',
      homeTeam: 'Yokohama FM',
      awayTeam: 'Urawa',
      matchUrl: 'https://example.com/match/1',
    };
    
    const dto = toMatchDTO(raw);
    
    expect(dto.kickoff).toBeNull();
    expect(dto.competition).toBeNull();
    expect(dto.roundLabel).toBeNull();
    expect(dto.stadium).toBeNull();
    expect(dto.marinosSide).toBeNull();
    expect(dto.homeScore).toBeNull();
    expect(dto.awayScore).toBeNull();
    expect(dto.isResult).toBe(0);
  });

  it('preserves provided optional values', () => {
    const raw = {
      id: 1,
      sourceKey: 'test-key',
      date: '2025-03-15',
      kickoff: '14:00',
      competition: 'J1リーグ',
      roundLabel: '第10節',
      homeTeam: 'Yokohama FM',
      awayTeam: 'Urawa',
      stadium: '日産スタジアム',
      marinosSide: 'home' as const,
      homeScore: 2,
      awayScore: 1,
      isResult: 1,
      matchUrl: 'https://example.com/match/1',
    };
    
    const dto = toMatchDTO(raw);
    
    expect(dto.kickoff).toBe('14:00');
    expect(dto.competition).toBe('J1リーグ');
    expect(dto.roundLabel).toBe('第10節');
    expect(dto.stadium).toBe('日産スタジアム');
    expect(dto.marinosSide).toBe('home');
    expect(dto.homeScore).toBe(2);
    expect(dto.awayScore).toBe(1);
    expect(dto.isResult).toBe(1);
  });

  it('calculates opponent from marinosSide when not provided', () => {
    const rawHome = {
      id: 1,
      sourceKey: 'test-key',
      date: '2025-03-15',
      homeTeam: 'Yokohama FM',
      awayTeam: 'Urawa',
      marinosSide: 'home' as const,
      matchUrl: 'https://example.com/match/1',
    };
    
    const dtoHome = toMatchDTO(rawHome);
    expect(dtoHome.opponent).toBe('Urawa');

    const rawAway = {
      id: 2,
      sourceKey: 'test-key-2',
      date: '2025-03-22',
      homeTeam: 'FC Tokyo',
      awayTeam: 'Yokohama FM',
      marinosSide: 'away' as const,
      matchUrl: 'https://example.com/match/2',
    };
    
    const dtoAway = toMatchDTO(rawAway);
    expect(dtoAway.opponent).toBe('FC Tokyo');
  });
});

describe('createEmptyStatsSummary', () => {
  it('creates empty stats with year', () => {
    const summary = createEmptyStatsSummary(2025);
    
    expect(summary.period.year).toBe(2025);
    expect(summary.period.from).toBeUndefined();
    expect(summary.period.to).toBeUndefined();
    expect(summary.watchCount).toBe(0);
    expect(summary.record).toEqual({ win: 0, draw: 0, loss: 0, unknown: 0 });
    expect(summary.cost).toEqual({ total: 0, averagePerMatch: 0 });
  });

  it('creates empty stats with date range', () => {
    const summary = createEmptyStatsSummary(undefined, '2025-01-01', '2025-12-31');
    
    expect(summary.period.year).toBeUndefined();
    expect(summary.period.from).toBe('2025-01-01');
    expect(summary.period.to).toBe('2025-12-31');
  });

  it('creates empty stats with no parameters', () => {
    const summary = createEmptyStatsSummary();
    
    expect(summary.period.year).toBeUndefined();
    expect(summary.watchCount).toBe(0);
    expect(summary.record.win).toBe(0);
    expect(summary.cost.total).toBe(0);
  });
});
