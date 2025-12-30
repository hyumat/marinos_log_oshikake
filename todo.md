# Marinos Away Log V2 - TODO

## North Star Goal
公式の試合情報を基盤データとして取り込み、ユーザーが**観戦した試合の記録**と**費用**を蓄積できる。  
さらに、観戦試合の**結果集計（勝敗など）**と**費用集計（合計・平均・内訳）**を行えるアプリにする。

---

## Current Status (High Level)

### ✅ Done / Implemented
- DBスキーマ（Drizzle）: `matches`, `userMatches`, `syncLog`
- 公式試合データ同期（tRPC）: `matches.fetchOfficial`
- 公式試合一覧ページ: `/matches`
- 試合詳細ページ + 観戦ログCRUD（tRPC + UI）
- フィルタリング（期間/対戦相手/Home-Away）
- **Stats 集計API（tRPC）**: `stats.getSummary`, `stats.getAvailableYears`
  - GitHub Issue #1: matchesテーブルとJOINして勝敗判定（homeScore/awayScore + marinosSide）
  - 出力形式: `{ period, watchCount, record: {win, draw, loss, unknown}, cost: {total, averagePerMatch} }`
  - `calculateResult`関数で勝敗ロジックを分離
  - ユニットテスト23件追加（0件/勝ち/負け/引き分け/unknown混在）
- **Statsページ（UI）**: `/stats`
  - GitHub Issue #2: 年セレクト、観戦数/勝分敗/費用集計表示
  - Empty状態（0件時）、Error UI（再試行ボタン付き）
  - DB接続エラー時のグレースフルフォールバック
  - 円表示対応（¥84,200 / ¥12,029形式）
- **マッチ詳細ページ**: `/matches/:id`
  - 観戦費用記録（交通費/チケット代/飲食代/その他）
  - LocalStorageで費用データを永続化
  - スコア表示（過去試合のみ）
  - 観戦ステータス管理（参加/不参加/未定）

### 🚧 In Progress / Needs Stabilization
- スクレイピング精度の固定（公式サイトの構造変化に追従、JSON-LD優先）
- "実データ" を用いた統合テストの整備（季節を跨ぐデータ・欠損耐性）

### ⏳ Not Started (Post-MVP)
- 最終QA/最適化

---

## Post-MVP (Nice-to-have)
- [ ] 費用カテゴリ内訳（交通/チケット/飲食…）
- [ ] グラフ/チャート（勝率推移、月別支出など）
- [ ] オフライン体験の強化（キャッシュ戦略の明文化）
- [ ] 共有/エクスポート（CSV等）

---

## Release Checklist (MVP)
- [x] Stats 集計API実装（GitHub Issue #1）
- [x] Statsページ UI実装（GitHub Issue #2）
- [x] 同期 → 一覧表示 → 詳細 → 観戦記録追加/編集/削除 → Stats表示 が一通り動く
- [x] テストが全て通る（`pnpm test` → 93件パス）
- [ ] モバイル幅で主要画面が破綻しない

---

## Completed GitHub Issues
- [x] Issue #1: Stats集計バックエンド実装（2025-12-30）
- [x] Issue #2: StatsページUI実装（2025-12-30）
