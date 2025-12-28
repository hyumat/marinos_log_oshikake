import puppeteer from 'puppeteer';

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
 * Parse Japanese date format to ISO format
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
 * Scrape matches using Puppeteer (handles JavaScript-rendered content)
 */
async function scrapeWithPuppeteer(url: string, isResult: boolean): Promise<MarinosMatch[]> {
  let browser: any = null;
  const matches: MarinosMatch[] = [];

  try {
    console.log(`[Marinos Scraper Puppeteer] Launching browser for ${url}`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set timeout to 30 seconds
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log(`[Marinos Scraper Puppeteer] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for match content to load
    await page.waitForSelector('[data-match], .match-row, .match-item, tr[data-match-id], .match-card, .match', {
      timeout: 10000,
    }).catch(() => {
      console.log('[Marinos Scraper Puppeteer] Match selector not found, will use text extraction');
    });

    // Extract all text content
    const bodyText = await page.evaluate(() => {
      return document.body.innerText;
    });

    console.log(`[Marinos Scraper Puppeteer] Extracted ${bodyText.length} characters of text`);

    // Parse matches from extracted text
    const lines = bodyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    const year = new Date().getFullYear();

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
        sourceUrl: url,
      };

      matches.push(match);
      i++;
    }

    console.log(`[Marinos Scraper Puppeteer] Extracted ${matches.length} matches from ${url}`);
  } catch (error) {
    console.error(`[Marinos Scraper Puppeteer] Error scraping ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return matches;
}

/**
 * Scrape future matches from Marinos official site using Puppeteer
 */
export async function scrapeMarinosFutureMatchesPuppeteer(): Promise<ScraperResult> {
  const errors: Array<{ url: string; message: string; timestamp: Date }> = [];
  const matches: MarinosMatch[] = [];

  try {
    console.log('[Marinos Scraper Puppeteer] Fetching future matches from', MARINOS_SCHEDULE_URL);
    const scrapedMatches = await scrapeWithPuppeteer(MARINOS_SCHEDULE_URL, false);
    matches.push(...scrapedMatches);
    console.log(`[Marinos Scraper Puppeteer] Extracted ${matches.length} future matches`);
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
 * Scrape past match results from Marinos official site using Puppeteer
 */
export async function scrapeMarinosPastMatchesPuppeteer(): Promise<ScraperResult> {
  const errors: Array<{ url: string; message: string; timestamp: Date }> = [];
  const matches: MarinosMatch[] = [];

  try {
    console.log('[Marinos Scraper Puppeteer] Fetching past matches from', MARINOS_RESULTS_URL);
    const scrapedMatches = await scrapeWithPuppeteer(MARINOS_RESULTS_URL, true);
    matches.push(...scrapedMatches);
    console.log(`[Marinos Scraper Puppeteer] Extracted ${matches.length} past matches`);
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
 * Scrape all Marinos matches using Puppeteer
 */
export async function scrapeAllMarinosMatchesPuppeteer(): Promise<ScraperResult> {
  const [futureResult, pastResult] = await Promise.all([
    scrapeMarinosFutureMatchesPuppeteer(),
    scrapeMarinosPastMatchesPuppeteer(),
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
