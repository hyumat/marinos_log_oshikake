import * as cheerio from 'cheerio';

// 正確なURL - マリノス公式サイトから確認
const MARINOS_SCHEDULE_URL = 'https://www.f-marinos.com/matches/schedule';
const MARINOS_RESULTS_URL = 'https://www.f-marinos.com/matches/result';

interface MarinosMatch {
  date: string; // ISO format: YYYY-MM-DD
  kickoff?: string; // HH:mm format
  opponent: string;
  homeTeam: string;
  awayTeam: string;
  marinosSide: 'home' | 'away';
  stadium?: string;
  homeScore?: number;
  awayScore?: number;
  isResult: boolean;
  competition: string;
  round?: string;
  sourceUrl: string;
}

interface ScraperResult {
  matches: MarinosMatch[];
  errors: Array<{ url: string; message: string; timestamp: Date }>;
  stats: {
    total: number;
    success: number;
    failed: number;
  };
}

/**
 * Fetch HTML content from URL with retry logic
 */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.log(`[Marinos Scraper] Retry ${i + 1}/${maxRetries} for ${url}: ${error}`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  return null;
}

/**
 * Parse Japanese date format (e.g., "2.6" or "2.6 [金]") to ISO format
 */
function parseJapaneseDateToISO(dateStr: string, year: number): string | null {
  try {
    // Match patterns: "2.6", "2.6[金]", "2.6（金）"
    const match = dateStr.match(/(\d{1,2})\.(\d{1,2})/);
    if (!match) return null;

    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch (error) {
    return null;
  }
}

/**
 * Extract match information from HTML content
 * Parses the structured match data from Marinos official site
 */
function parseMatchesFromHTML(html: string, isResult: boolean, year: number): MarinosMatch[] {
  const matches: MarinosMatch[] = [];
  const $ = cheerio.load(html);

  // マリノス公式サイトの構造に基づいて解析
  // 試合情報は以下の構造で配置されている：
  // HOME/AWAY | 日付 | キックオフ時刻 | 対戦相手 | スタジアム | スコア（結果の場合）

  // すべてのテキストノードを取得して解析
  const bodyText = $('body').text();
  
  // 試合情報を抽出するための複数のセレクタを試す
  const matchElements = $('[data-match], .match-row, .match-item, tr[data-match-id], .match-card');
  
  console.log(`[Marinos Scraper] Found ${matchElements.length} match elements`);

  // セレクタでマッチが見つからない場合、テキストベースで解析
  if (matchElements.length === 0) {
    return parseMatchesFromText(bodyText, isResult, year);
  }

  matchElements.each((index, element) => {
    try {
      const $el = $(element);
      const text = $el.text();
      
      if (!text) return;

      // 日付を抽出（例：2.6、2.14）
      const dateMatch = text.match(/(\d{1,2})\.(\d{1,2})/);
      if (!dateMatch) return;

      const date = parseJapaneseDateToISO(dateMatch[0], year);
      if (!date) return;

      // ホーム/アウェイを判定
      const isHome = text.includes('HOME') || text.includes('ホーム');
      const isAway = text.includes('AWAY') || text.includes('アウェイ');

      if (!isHome && !isAway) return;

      // 対戦相手を抽出
      const opponent = extractOpponent(text);
      if (!opponent) return;

      // スタジアムを抽出
      const stadium = extractStadium(text);

      // キックオフ時刻を抽出
      const kickoffMatch = text.match(/(\d{1,2}):(\d{2})/);
      const kickoff = kickoffMatch ? `${kickoffMatch[1]}:${kickoffMatch[2]}` : undefined;

      // スコアを抽出（結果の場合）
      let homeScore: number | undefined;
      let awayScore: number | undefined;
      if (isResult) {
        const scoreMatch = text.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (scoreMatch) {
          if (isHome) {
            homeScore = parseInt(scoreMatch[1], 10);
            awayScore = parseInt(scoreMatch[2], 10);
          } else {
            homeScore = parseInt(scoreMatch[2], 10);
            awayScore = parseInt(scoreMatch[1], 10);
          }
        }
      }

      // 大会を抽出
      const competition = extractCompetition(text);

      const match: MarinosMatch = {
        date,
        kickoff,
        opponent,
        homeTeam: isHome ? '横浜FM' : opponent,
        awayTeam: isHome ? opponent : '横浜FM',
        marinosSide: isHome ? 'home' : 'away',
        stadium,
        homeScore,
        awayScore,
        isResult,
        competition,
        sourceUrl: isResult ? MARINOS_RESULTS_URL : MARINOS_SCHEDULE_URL,
      };

      matches.push(match);
    } catch (error) {
      console.log(`[Marinos Scraper] Error parsing element ${index}:`, error);
    }
  });

  return matches;
}

/**
 * Parse matches from plain text (fallback method)
 */
function parseMatchesFromText(text: string, isResult: boolean, year: number): MarinosMatch[] {
  const matches: MarinosMatch[] = [];

  // テキストを行ごとに分割
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // 試合情報を含む行を検出
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 日付パターンを検出
    const dateMatch = line.match(/(\d{1,2})\.(\d{1,2})/);
    if (!dateMatch) {
      i++;
      continue;
    }

    const date = parseJapaneseDateToISO(dateMatch[0], year);
    if (!date) {
      i++;
      continue;
    }

    // ホーム/アウェイを判定
    const isHome = line.includes('HOME') || line.includes('ホーム');
    const isAway = line.includes('AWAY') || line.includes('アウェイ');

    if (!isHome && !isAway) {
      i++;
      continue;
    }

    // 対戦相手を抽出
    const opponent = extractOpponent(line);
    if (!opponent) {
      i++;
      continue;
    }

    // スタジアムを抽出
    const stadium = extractStadium(line);

    // キックオフ時刻を抽出
    const kickoffMatch = line.match(/(\d{1,2}):(\d{2})/);
    const kickoff = kickoffMatch ? `${kickoffMatch[1]}:${kickoffMatch[2]}` : undefined;

    // スコアを抽出（結果の場合）
    let homeScore: number | undefined;
    let awayScore: number | undefined;
    if (isResult) {
      const scoreMatch = line.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (scoreMatch) {
        if (isHome) {
          homeScore = parseInt(scoreMatch[1], 10);
          awayScore = parseInt(scoreMatch[2], 10);
        } else {
          homeScore = parseInt(scoreMatch[2], 10);
          awayScore = parseInt(scoreMatch[1], 10);
        }
      }
    }

    const competition = extractCompetition(line);

    const match: MarinosMatch = {
      date,
      kickoff,
      opponent,
      homeTeam: isHome ? '横浜FM' : opponent,
      awayTeam: isHome ? opponent : '横浜FM',
      marinosSide: isHome ? 'home' : 'away',
      stadium,
      homeScore,
      awayScore,
      isResult,
      competition,
      sourceUrl: isResult ? MARINOS_RESULTS_URL : MARINOS_SCHEDULE_URL,
    };

    matches.push(match);
    i++;
  }

  return matches;
}

/**
 * Extract opponent team name from text
 */
function extractOpponent(text: string): string | null {
  const teamNames = [
    'FC町田ゼルビア', '鹿島アントラーズ', '浦和レッズ', '東京ヴェルディ',
    'ジェフユナイテッド千葉', '水戸ホーリーホック', '川崎フロンターレ',
    '柏レイソル', 'FC東京', 'ガンバ大阪', 'アビスパ福岡', 'セレッソ大阪',
    'ヴィッセル神戸', 'サンフレッチェ広島', '京都サンガF.C.', '清水エスパルス',
    '横浜FC', '湘南ベルマーレ', 'ファジアーノ岡山', 'アルビレックス新潟',
    '名古屋グランパス',
  ];

  for (const team of teamNames) {
    if (text.includes(team)) {
      return team;
    }
  }

  return null;
}

/**
 * Extract stadium name from text
 */
function extractStadium(text: string): string | undefined {
  const stadiums = [
    '日産スタジアム', 'メルカリスタジアム', 'MUFGスタジアム',
    'ニッパツ三ツ沢球技場', '横浜国際総合競技場',
  ];

  for (const stadium of stadiums) {
    if (text.includes(stadium)) {
      return stadium;
    }
  }

  return undefined;
}

/**
 * Extract competition name from text
 */
function extractCompetition(text: string): string {
  if (text.includes('J1百年構想リーグ') || text.includes('J1')) return 'J1';
  if (text.includes('J2')) return 'J2';
  if (text.includes('J3')) return 'J3';
  if (text.includes('ルヴァンカップ')) return 'ルヴァンカップ';
  if (text.includes('天皇杯')) return '天皇杯';
  if (text.includes('AFC')) return 'AFC';
  if (text.includes('ワールドチャレンジ')) return 'ワールドチャレンジ';
  return 'J1';
}

/**
 * Scrape future matches from Marinos official site
 */
export async function scrapeMarinosFutureMatches(): Promise<ScraperResult> {
  const errors: Array<{ url: string; message: string; timestamp: Date }> = [];
  const matches: MarinosMatch[] = [];

  try {
    console.log('[Marinos Scraper] Fetching future matches from', MARINOS_SCHEDULE_URL);
    const html = await fetchWithRetry(MARINOS_SCHEDULE_URL);

    if (!html) {
      errors.push({
        url: MARINOS_SCHEDULE_URL,
        message: 'Failed to fetch schedule page after retries',
        timestamp: new Date(),
      });
      return { matches, errors, stats: { total: 0, success: 0, failed: 1 } };
    }

    const year = new Date().getFullYear();
    const parsedMatches = parseMatchesFromHTML(html, false, year);
    matches.push(...parsedMatches);

    console.log(`[Marinos Scraper] Extracted ${matches.length} future matches`);
  } catch (error) {
    errors.push({
      url: MARINOS_SCHEDULE_URL,
      message: `Error scraping future matches: ${error}`,
      timestamp: new Date(),
    });
  }

  return {
    matches,
    errors,
    stats: {
      total: matches.length + errors.length,
      success: matches.length,
      failed: errors.length,
    },
  };
}

/**
 * Scrape past match results from Marinos official site
 */
export async function scrapeMarinosPastMatches(): Promise<ScraperResult> {
  const errors: Array<{ url: string; message: string; timestamp: Date }> = [];
  const matches: MarinosMatch[] = [];

  try {
    console.log('[Marinos Scraper] Fetching past matches from', MARINOS_RESULTS_URL);
    const html = await fetchWithRetry(MARINOS_RESULTS_URL);

    if (!html) {
      errors.push({
        url: MARINOS_RESULTS_URL,
        message: 'Failed to fetch results page after retries',
        timestamp: new Date(),
      });
      return { matches, errors, stats: { total: 0, success: 0, failed: 1 } };
    }

    const year = new Date().getFullYear();
    const parsedMatches = parseMatchesFromHTML(html, true, year);
    matches.push(...parsedMatches);

    console.log(`[Marinos Scraper] Extracted ${matches.length} past matches`);
  } catch (error) {
    errors.push({
      url: MARINOS_RESULTS_URL,
      message: `Error scraping past matches: ${error}`,
      timestamp: new Date(),
    });
  }

  return {
    matches,
    errors,
    stats: {
      total: matches.length + errors.length,
      success: matches.length,
      failed: errors.length,
    },
  };
}

/**
 * Scrape all Marinos matches (future + past)
 */
export async function scrapeAllMarinosMatches(): Promise<ScraperResult> {
  const [futureResult, pastResult] = await Promise.all([
    scrapeMarinosFutureMatches(),
    scrapeMarinosPastMatches(),
  ]);

  const allMatches = [...futureResult.matches, ...pastResult.matches];

  // Remove duplicates based on date + opponent
  const uniqueMatches = Array.from(
    new Map(
      allMatches.map(m => [`${m.date}-${m.opponent}`, m])
    ).values()
  );

  // Sort by date
  uniqueMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    matches: uniqueMatches,
    errors: [...futureResult.errors, ...pastResult.errors],
    stats: {
      total: uniqueMatches.length,
      success: uniqueMatches.length,
      failed: futureResult.errors.length + pastResult.errors.length,
    },
  };
}
