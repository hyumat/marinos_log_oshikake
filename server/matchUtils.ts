// src/matchUtils.js

function normTeam(s: string): string {
  return String(s || "")
    .trim()
    .replace(/[Ｆ]/g, "F")
    .replace(/[－―ー]/g, "-")
    .replace(/\s+/g, "");
}

export function isMarinos(teamName: string): boolean {
  const t = normTeam(teamName);
  // 「横浜FM」「横浜F・マリノス」など揺れ吸収（必要に応じて増やしてください）
  return (
    t.includes("横浜FM") ||
    t.includes("横浜Fマリノス") ||
    t.includes("横浜F・マリノス") ||
    t === "横浜FM"
  );
}

/**
 * API fixture (jleague.jp / data.j-league どちらでも) を
 * Summary.jsx が期待する result 形式に変換
 *
 * fixture例（あなたのAPIが返している想定）
 * - { home, away, scoreHome, scoreAway, score, played }
 */
export function fixtureToResult(fx: any) {
  if (!fx || !fx.played) return null;
  const sh = Number(fx.scoreHome);
  const sa = Number(fx.scoreAway);
  if (!Number.isFinite(sh) || !Number.isFinite(sa)) return null;

  const marinosHome = isMarinos(fx.home);
  const marinosAway = isMarinos(fx.away);
  if (!marinosHome && !marinosAway) return null;

  const marinosGoals = marinosHome ? sh : sa;
  const opponentGoals = marinosHome ? sa : sh;

  let wdl = "D";
  if (marinosGoals > opponentGoals) wdl = "W";
  else if (marinosGoals < opponentGoals) wdl = "L";

  return { wdl, marinosGoals, opponentGoals };
}

/**
 * trip と fixture のマッチングに使う「安定キー」
 * まずは fixture.key を trip.matchKey に保存しておくのが最強。
 */
export function matchTripToFixture(trip: any, fx: any): boolean {
  if (!trip || !fx) return false;

  // 1) 最優先：matchKey（追加時に保存しておく）
  if (trip.matchKey && fx.key && trip.matchKey === fx.key) return true;

  // 2) 次点：日付 + 対戦相手 + home/away（簡易一致）
  const tripDate = String(trip.date || "").slice(0, 10);
  const fxDate = String(fx.date || "").slice(0, 10);
  if (tripDate && fxDate && tripDate !== fxDate) return false;

  const oppTrip = normTeam(trip.opponent || "");
  const oppFx = normTeam(isMarinos(fx.home) ? fx.away : fx.home);

  if (!oppTrip || !oppFx) return false;
  if (oppTrip !== oppFx) return false;

  // homeAway が保存されているなら、それも見る
  if (trip.homeAway) {
    const ha = String(trip.homeAway);
    const fxHa = isMarinos(fx.home) ? "home" : "away";
    if (ha !== fxHa) return false;
  }

  return true;
}
