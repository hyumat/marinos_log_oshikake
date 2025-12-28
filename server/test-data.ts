/**
 * Test data for development and testing
 * Information source:
 * - Marinos Official Site (https://www.f-marinos.com/)
 * - J-League Official Site (https://www.jleague.jp/match/search/)
 */

export interface TestMatch {
  date: string;
  kickoff?: string;
  competition?: string;
  homeTeam: string;
  awayTeam: string;
  opponent: string;
  stadium?: string;
  marinosSide: 'home' | 'away';
  homeScore?: number;
  awayScore?: number;
  isResult: boolean;
  sourceUrl: string;
}

/**
 * Sample matches for testing and development
 * These are real matches from 2026 season (from Marinos official site)
 */
export const SAMPLE_MATCHES: TestMatch[] = [
  // 2026年2月6日 - 第1節 (ホーム)
  {
    date: '2026-02-06',
    kickoff: '19:00',
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: 'FC町田ゼルビア',
    opponent: 'FC町田ゼルビア',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年2月21日～23日 - 第3節 (ホーム)
  {
    date: '2026-02-21',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: '浦和レッズ',
    opponent: '浦和レッズ',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年2月28日～3月1日 - 第4節 (ホーム)
  {
    date: '2026-02-28',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: '東京ヴェルディ',
    opponent: '東京ヴェルディ',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年3月14日～15日 - 第6節 (ホーム)
  {
    date: '2026-03-14',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: 'ジェフユナイテッド千葉',
    opponent: 'ジェフユナイテッド千葉',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年4月11日～12日 - 第10節 (ホーム)
  {
    date: '2026-04-11',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: 'FC東京',
    opponent: 'FC東京',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年4月18日～19日 - 第11節 (ホーム)
  {
    date: '2026-04-18',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: '川崎フロンターレ',
    opponent: '川崎フロンターレ',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年5月2日～3日 - 第14節 (ホーム)
  {
    date: '2026-05-02',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: '水戸ホーリーホック',
    opponent: '水戸ホーリーホック',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年5月9日～10日 - 第16節 (ホーム)
  {
    date: '2026-05-09',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: '鹿島アントラーズ',
    opponent: '鹿島アントラーズ',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // 2026年5月16日～17日 - 第17節 (ホーム)
  {
    date: '2026-05-16',
    kickoff: undefined,
    competition: 'J1百年構想リーグ',
    homeTeam: '横浜F・マリノス',
    awayTeam: '柏レイソル',
    opponent: '柏レイソル',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: undefined,
    awayScore: undefined,
    isResult: false,
    sourceUrl: 'https://www.f-marinos.com/',
  },
  // Past matches (2025) for testing
  {
    date: '2025-11-30',
    kickoff: '14:00',
    competition: 'J1',
    homeTeam: '横浜F・マリノス',
    awayTeam: 'セレッソ大阪',
    opponent: 'セレッソ大阪',
    stadium: '日産スタジアム',
    marinosSide: 'home',
    homeScore: 3,
    awayScore: 1,
    isResult: true,
    sourceUrl: 'https://www.football-lab.jp/y-fm',
  },
  {
    date: '2025-12-06',
    kickoff: '14:00',
    competition: 'J1',
    homeTeam: '鹿島アントラーズ',
    awayTeam: '横浜F・マリノス',
    opponent: '鹿島アントラーズ',
    stadium: '茨城県立カシマサッカースタジアム',
    marinosSide: 'away',
    homeScore: 2,
    awayScore: 1,
    isResult: true,
    sourceUrl: 'https://www.football-lab.jp/y-fm',
  },
];

/**
 * Get sample matches for development
 * In production, this should be replaced with actual scraping
 */
export function getSampleMatches(): TestMatch[] {
  return SAMPLE_MATCHES.map(m => ({ ...m }));
}

/**
 * Check if we should use test data
 * Returns true if environment is development or test
 */
export function shouldUseTestData(): boolean {
  const env = process.env.NODE_ENV;
  return env === 'development' || env === 'test' || !process.env.NODE_ENV;
}
