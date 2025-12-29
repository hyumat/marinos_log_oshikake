// server.js (ESM)
// Express API for "Marinos Away Log"
// Data source: J.LEAGUE.jp match/search (club page)

import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import ical from "node-ical";
import { parseISO, format } from "date-fns";
import iconv from "iconv-lite";

const app = express();

const PORT = 3005;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

// ====== Config ======
const TEAM_SLUG = "yokohamafm";
// 過去の結果も取得するため、URLを年度指定なし（デフォルト）または明示的な範囲に変更を検討
// Jリーグ公式サイトの検索ページはパラメータで年度を制御できる
const BASE_URL = `https://www.jleague.jp/match/search/all/all/${TEAM_SLUG}/`;
const PHEW_URL_2025 = "http://soccer.phew.homeip.net/schedule/match/yearly/?team=%B2%A3%C9%CDFM&year=2025";
const PHEW_URL_2024 = "http://soccer.phew.homeip.net/schedule/match/yearly/?team=%B2%A3%C9%CDFM&year=2024";

const MARINOS_NAMES = new Set([
  "横浜FM",
  "横浜ＦＭ",
  "横浜F・マリノス",
  "横浜Ｆ・マリノス",
]);

// ====== Helpers ======
function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeSpaces(s) {
  return String(s || "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function parseJapaneseDateToISO(h4Text) {
  const m = String(h4Text).match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (!m) return null;
  return `${m[1]}-${pad2(Number(m[2]))}-${pad2(Number(m[3]))}`;
}

function parseRoundFromCompetition(competitionText) {
  const t = normalizeSpaces(competitionText);
  if (!t) return { competitionName: null, roundLabel: null, roundNumber: null };

  // Handle "第 1 節" or "第1節" or "MD7"
  const mRound = t.match(/第\s*(\d+)\s*節/);
  const mMD = t.match(/MD\s*(\d+)/);
  
  let roundNumber = null;
  let roundLabel = null;

  if (mRound) {
    roundNumber = Number(mRound[1]);
    roundLabel = `第${roundNumber}節`;
  } else if (mMD) {
    roundNumber = Number(mMD[1]);
    roundLabel = `MD${roundNumber}`;
  }

  // Strip round info from competition name
  let competitionName = t.replace(/第\s*\d+\s*節/g, "").replace(/MD\s*\d+/g, "").trim();

  return {
    competitionName: competitionName || t,
    roundLabel,
    roundNumber,
  };
}

function detectMarinosSide(home, away) {
  const h = normalizeSpaces(home);
  const a = normalizeSpaces(away);

  const homeIs = MARINOS_NAMES.has(h) || h.includes("横浜FM") || h.includes("横浜ＦＭ") || h.includes("横浜F・マリノス");
  const awayIs = MARINOS_NAMES.has(a) || a.includes("横浜FM") || a.includes("横浜ＦＭ") || a.includes("横浜F・マリノス");

  if (homeIs && !awayIs) return { side: "home", opponent: a };
  if (awayIs && !homeIs) return { side: "away", opponent: h };
  return { side: null, opponent: null };
}

function makeAbsoluteUrl(href) {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  return `https://www.jleague.jp${href.startsWith("/") ? "" : "/"}${href}`;
}

// ====== Fetch & Parse ======
async function fetchGoogleCalendarFixtures() {
  const CALENDAR_ID = "f7vhtmj508ct618hung7d7s78c@group.calendar.google.com";
  const ICAL_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
  
  try {
    const res = await axios.get(ICAL_URL, { timeout: 10000 });
    const data = ical.parseICS(res.data);
    const fixtures = [];

    for (const k in data) {
      const event = data[k];
      if (event.type !== "VEVENT") continue;

      const summary = event.summary || "";
      const start = event.start;
      if (!start) continue;

      const dateStr = format(start, "yyyy-MM-dd");
      const kickoff = format(start, "HH:mm");

      // 簡易的なホーム・アウェイ判定（カレンダーのタイトルに依存）
      const homeAway = summary.includes("vs") ? summary.split("vs") : [summary, ""];
      const home = normalizeSpaces(homeAway[0]);
      const away = normalizeSpaces(homeAway[1]);
      const { side, opponent } = detectMarinosSide(home, away);

      fixtures.push({
        source: "google_calendar",
        date: dateStr,
        kickoff: kickoff === "00:00" ? null : kickoff,
        competition: "カレンダー情報",
        roundLabel: null,
        stadium: event.location || null,
        home,
        away,
        homeScore: null,
        awayScore: null,
        status: "vs",
        isResult: false,
        marinosSide: side || "unknown",
        opponent: opponent || away,
        matchUrl: event.url || null,
        key: `gcal-${event.uid || k}`
      });
    }
    return fixtures;
  } catch (e) {
    console.error("Google Calendar fetch failed:", e.message);
    return [];
  }
}

async function fetchPhewFixtures(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      responseType: "arraybuffer",
    });
    const html = iconv.decode(res.data, "euc-jp");
    const $ = cheerio.load(html);
    const fixtures = [];

    // Extract year from URL if possible, or from page
    const urlObj = new URL(url);
    const urlYear = urlObj.searchParams.get("year") || new Date().getFullYear();

    $("h2").each((_, h2) => {
      const competition = $(h2).text().trim();
      const $table = $(h2).next("table");
      if (!$table.length) return;

      $table.find("tr").each((__, tr) => {
        const $tds = $(tr).find("td");
        if ($tds.length < 3) return;

        const sideRaw = $tds.eq(0).text().trim(); // Ｈ or Ａ
        const dateRaw = $tds.eq(1).text().trim(); // 2/12 (水) 19:00
        const infoText = $tds.eq(2).text().trim();

        const dateMatch = dateRaw.match(/(\d+)\/(\d+)/);
        if (!dateMatch) return;

        const dateISO = `${urlYear}-${pad2(dateMatch[1])}-${pad2(dateMatch[2])}`;

        const kickoffMatch = dateRaw.match(/(\d{2}:\d{2})/);
        const kickoff = kickoffMatch ? kickoffMatch[0] : null;

        const stadiumMatch = infoText.match(/\(([^)]+)\)/);
        const stadium = stadiumMatch ? stadiumMatch[1] : null;

        const opponentMatch = infoText.match(/第\d+節\s+(.+?)戦/);
        const opponent = opponentMatch ? opponentMatch[1] : infoText.split("戦")[0].split(" ").pop();

        // Score parsing from Phew
        // Format: "1 ○ 0", "1 △ 1", "0 ● 2"
        const scoreRow = $tds.eq(3).text().trim();
        let homeScore = null;
        let awayScore = null;
        let isResult = false;
        const scoreMatch = scoreRow.match(/(\d+)\s*[○●△]\s*(\d+)/);
        if (scoreMatch) {
          homeScore = Number(scoreMatch[1]);
          awayScore = Number(scoreMatch[2]);
          isResult = true;
        }

        fixtures.push({
          source: "phew.homeip.net",
          date: dateISO,
          kickoff,
          competition,
          roundLabel: infoText.match(/第\d+節/)?.[0] || null,
          stadium,
          home: sideRaw === "Ｈ" ? "横浜FM" : opponent,
          away: sideRaw === "Ａ" ? "横浜FM" : opponent,
          homeScore,
          awayScore,
          status: isResult ? "試合終了" : "vs",
          isResult,
          marinosSide: sideRaw === "Ｈ" ? "home" : "away",
          opponent,
          matchUrl: $tds.eq(2).find("a").attr("href") || null,
          key: `phew-${dateISO}-${opponent}`
        });
      });
    });
    return fixtures;
  } catch (e) {
    console.error("Phew fetch failed:", e.message);
    return [];
  }
}

async function fetchJleagueHtml(url) {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "MarinosAwayLog/2.0 axios",
        "Accept-Language": "ja,en;q=0.8",
      },
    });
    return res.data;
  } catch (e) {
    console.error(`Fetch failed: ${url}`, e.message);
    return null;
  }
}

async function scrapeMatchDetail(matchUrl) {
  const html = await fetchJleagueHtml(matchUrl);
  if (!html) return null;
  const $ = cheerio.load(html);

  // Score - J.LEAGUE Official site
  // The search page sometimes has score, but detail page is more reliable.
  // We need to handle various classes: .score.home, .score.away, or just .score
  const homeScoreRaw = $(".matchScore .score.home").text().trim() || $(".matchScore .home .score").text().trim();
  const awayScoreRaw = $(".matchScore .score.away").text().trim() || $(".matchScore .away .score").text().trim();
  
  const homeScore = (homeScoreRaw !== "" && !isNaN(homeScoreRaw)) ? Number(homeScoreRaw) : null;
  const awayScore = (awayScoreRaw !== "" && !isNaN(awayScoreRaw)) ? Number(awayScoreRaw) : null;

  // Stadium
  let stadium = $(".stadiumInfo .stadiumName").text().trim() || 
                $(".matchData .stadium").text().trim();
  
  // Teams
  const home = normalizeSpaces($(".teamName.home").first().text());
  const away = normalizeSpaces($(".teamName.away").first().text());

  // Kickoff time
  const kickoffText = normalizeSpaces($(".matchData .time").text() || $(".matchData .kickoff").text());
  const kickoffMatch = kickoffText.match(/([01]\d|2[0-3]):[0-5]\d/);
  const kickoff = kickoffMatch ? kickoffMatch[0] : null;

  // Status
  const statusVal = $(".matchStatus").text().trim() || (Number.isFinite(homeScore) ? "試合終了" : "vs");

  return {
    home,
    away,
    homeScore,
    awayScore,
    stadium,
    status: statusVal,
    kickoff,
    isResult: Number.isFinite(homeScore) && Number.isFinite(awayScore),
  };
}

async function parseJleagueSearch(html) {
  const $ = cheerio.load(html);
  let currentDateISO = null;
  let currentCompetitionRaw = null;
  const fixtures = [];
  const processedUrls = new Set();

  const elements = $("h4, h5, a, .score").toArray();

  for (const el of elements) {
    const $el = $(el);
    const tag = (el.tagName || "").toLowerCase();
    const className = $el.attr("class") || "";

    if (tag === "h4") {
      const iso = parseJapaneseDateToISO(normalizeSpaces($el.text()));
      if (iso) currentDateISO = iso;
      continue;
    }

    if (tag === "h5") {
      const t = normalizeSpaces($el.text());
      if (t) currentCompetitionRaw = t;
      continue;
    }

    const href = $el.attr("href") || "";
    if (!href.includes("/match/")) continue;
    
    // Normalize URL
    const matchBaseUrl = href.replace(/\/(ticket|player|live|photo|coach|stats|map|report|news|event|commentary)\/.*$/, "/");
    const matchUrl = makeAbsoluteUrl(matchBaseUrl);
    
    if (!matchUrl || processedUrls.has(matchUrl)) continue;
    processedUrls.add(matchUrl);

    const anchorText = normalizeSpaces($el.text());
    
    if (!anchorText.includes("vs") && !anchorText.match(/\d+\s*-\s*\d+/) && anchorText.length < 5) {
      continue;
    }

    const { competitionName, roundLabel: roundLabelParsed, roundNumber: roundNumberParsed } = parseRoundFromCompetition(currentCompetitionRaw);

    // Try to extract score from search page as fallback
    let homeScore = null;
    let awayScore = null;
    let isResult = false;
    const scoreMatch = anchorText.match(/(\d+)\s*-\s*(\d+)/);
    if (scoreMatch) {
      homeScore = Number(scoreMatch[1]);
      awayScore = Number(scoreMatch[2]);
      isResult = true;
    }

    fixtures.push({
      source: "jleague.jp",
      date: currentDateISO,
      competition: competitionName,
      roundLabel: roundLabelParsed,
      roundNumber: roundNumberParsed,
      matchUrl,
      home: null,
      away: null,
      homeScore,
      awayScore,
      stadium: null,
      status: isResult ? "試合終了" : "fetching",
      isResult,
      marinosSide: "home", 
    });
  }

  const detailedFixtures = await Promise.all(fixtures.map(async (f) => {
    const detail = await scrapeMatchDetail(f.matchUrl);
    if (detail) {
      const { side, opponent } = detectMarinosSide(detail.home, detail.away);
      return {
        ...f,
        ...detail,
        // Keep search page score if detail page is empty (rare)
        homeScore: detail.homeScore ?? f.homeScore,
        awayScore: detail.awayScore ?? f.awayScore,
        isResult: detail.isResult || f.isResult,
        marinosSide: side,
        opponent,
      };
    }
    return f;
  }));

  return detailedFixtures.filter(f => f.marinosSide !== null);
}

// ====== Routes =====
app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "marinos-away-log-api", port: PORT });
});

app.get("/api/fixtures/marinos", async (req, res) => {
  const yearsRaw = String(req.query.years || "").trim();
  const years = yearsRaw
    ? yearsRaw.split(",").map((s) => Number(s.trim())).filter(Number.isFinite)
    : [];

  const pretty = String(req.query.pretty || "0") === "1";

  try {
    const [jleagueHtml, gcalFixtures, phewFixtures2025, phewFixtures2024] = await Promise.all([
      fetchJleagueHtml(BASE_URL),
      fetchGoogleCalendarFixtures(),
      fetchPhewFixtures(PHEW_URL_2025),
      fetchPhewFixtures(PHEW_URL_2024)
    ]);

    let jFixtures = [];
    if (jleagueHtml) {
      jFixtures = await parseJleagueSearch(jleagueHtml);
    }

    const phewFixtures = [...phewFixtures2025, ...phewFixtures2024];

    // Merge logic: Use J-League as primary, complement with others
    // We want to keep scores from ANY source if available
    const combinedMap = new Map();

    const addOrUpdate = (f) => {
      if (!f.date) return;
      const existing = combinedMap.get(f.date);
      if (!existing) {
        combinedMap.set(f.date, f);
      } else {
        // 大会名と節情報を確実に保持するようにマージ
        const competition = f.competition || existing.competition;
        const roundLabel = f.roundLabel || existing.roundLabel;

        // If existing doesn't have score but new one does, update it
        if (!existing.isResult && f.isResult) {
          combinedMap.set(f.date, { ...existing, ...f, competition, roundLabel });
        } else if (existing.source !== "jleague.jp" && f.source === "jleague.jp") {
          // Prefer J-League for metadata but keep score if J-League doesn't have it
          combinedMap.set(f.date, {
            ...f,
            competition,
            roundLabel,
            homeScore: (f.homeScore !== null) ? f.homeScore : existing.homeScore,
            awayScore: (f.awayScore !== null) ? f.awayScore : existing.awayScore,
            isResult: f.isResult || existing.isResult,
            status: f.isResult || existing.isResult ? "試合終了" : f.status
          });
        } else if (existing.isResult && f.isResult && f.source === "jleague.jp") {
          // Both have results, J-League is likely more official for scores
          combinedMap.set(f.date, { ...existing, ...f, competition, roundLabel });
        } else {
          // それ以外の場合も情報を補完
          combinedMap.set(f.date, { ...existing, ...f, competition, roundLabel });
        }
      }
    };

    jFixtures.forEach(addOrUpdate);
    phewFixtures.forEach(addOrUpdate);
    gcalFixtures.forEach(addOrUpdate);

    let fixtures = Array.from(combinedMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    if (years.length) {
      const set = new Set(years);
      fixtures = fixtures.filter((f) => f.date && set.has(Number(String(f.date).slice(0, 4))));
    }

    const results = fixtures.filter((f) => f.isResult);
    const upcoming = fixtures.filter((f) => !f.isResult);

    const payload = {
      fixtures,
      results,
      upcoming,
      counts: { total: fixtures.length, results: results.length, upcoming: upcoming.length },
      debug: { urlUsed: BASE_URL },
    };

    return pretty
      ? res.type("json").send(JSON.stringify(payload, null, 2))
      : res.json(payload);
  } catch (e) {
    const payload = { error: "FETCH_FAILED", message: e?.message || String(e) };
    res.status(502);
    return pretty
      ? res.type("json").send(JSON.stringify(payload, null, 2))
      : res.json(payload);
  }
});

app.use((req, res) => {
  res
    .status(404)
    .json({ status: "error", message: "this route doesn't exist", path: req.originalUrl });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
