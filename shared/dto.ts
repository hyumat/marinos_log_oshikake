/**
 * API Response DTOs - Type-safe data transfer objects
 * Issue #37: APIレスポンス型を固定し、UIのNull安全性を上げる
 */

/**
 * Match DTO - Represents a match returned from API
 * All fields have defined types (no undefined leaking to UI)
 */
export interface MatchDTO {
  id: number;
  sourceKey: string;
  date: string;
  kickoff: string | null;
  competition: string | null;
  roundLabel: string | null;
  homeTeam: string;
  awayTeam: string;
  opponent: string;
  stadium: string | null;
  marinosSide: 'home' | 'away' | null;
  homeScore: number | null;
  awayScore: number | null;
  isResult: number;
  matchUrl: string;
}

/**
 * Stats Summary DTO - Represents aggregated statistics
 */
export interface StatsSummaryDTO {
  period: {
    year: number | undefined;
    from: string | undefined;
    to: string | undefined;
  };
  watchCount: number;
  record: RecordDTO;
  cost: CostDTO;
}

export interface RecordDTO {
  win: number;
  draw: number;
  loss: number;
  unknown: number;
}

export interface CostDTO {
  total: number;
  averagePerMatch: number;
}

/**
 * Matches List Response DTO
 */
export interface MatchesListResponseDTO {
  success: boolean;
  matches: MatchDTO[];
  count: number;
}

/**
 * Available Years Response DTO
 */
export interface AvailableYearsDTO {
  success: boolean;
  years: number[];
}

/**
 * Fetch Official Response DTO
 */
export interface FetchOfficialResponseDTO {
  success: boolean;
  matches: number;
  results: number;
  upcoming: number;
  stats: {
    total: number;
    results: number;
    upcoming: number;
  };
}

/**
 * User Match DTO - User's attendance record
 */
export interface UserMatchDTO {
  id: number;
  userId: string;
  matchId: number;
  status: 'attending' | 'not-attending' | 'undecided';
  costYen: number;
  note: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper function to ensure match has safe defaults
 * Transforms raw database/API data to UI-safe DTO
 */
export function toMatchDTO(raw: Partial<MatchDTO> & { id: number; sourceKey: string; date: string; homeTeam: string; awayTeam: string; matchUrl: string }): MatchDTO {
  return {
    id: raw.id,
    sourceKey: raw.sourceKey,
    date: raw.date,
    kickoff: raw.kickoff ?? null,
    competition: raw.competition ?? null,
    roundLabel: raw.roundLabel ?? null,
    homeTeam: raw.homeTeam,
    awayTeam: raw.awayTeam,
    opponent: raw.opponent ?? (raw.marinosSide === 'home' ? raw.awayTeam : raw.homeTeam),
    stadium: raw.stadium ?? null,
    marinosSide: raw.marinosSide ?? null,
    homeScore: raw.homeScore ?? null,
    awayScore: raw.awayScore ?? null,
    isResult: raw.isResult ?? 0,
    matchUrl: raw.matchUrl,
  };
}

/**
 * Helper function to create empty stats DTO
 */
export function createEmptyStatsSummary(year?: number, from?: string, to?: string): StatsSummaryDTO {
  return {
    period: { year, from, to },
    watchCount: 0,
    record: { win: 0, draw: 0, loss: 0, unknown: 0 },
    cost: { total: 0, averagePerMatch: 0 },
  };
}
