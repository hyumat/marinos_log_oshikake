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
- [x] テストが全て通る（`pnpm test` → 104件パス）
- [x] モバイル幅で主要画面が破綻しない

---

## Completed GitHub Issues
- [x] Issue #1: Stats集計バックエンド実装（2025-12-30）
- [x] Issue #2: StatsページUI実装（2025-12-30）
- [x] Issue #6: Stats年別フィルタ・Empty表示（2025-12-30）
- [x] Issue #9: 試合一覧フィルタリング（期間/対戦相手/Home-Away）（2025-12-30）
- [x] Issue #10: syncLog永続化（URL/status/exception/duration/counts）（2025-12-31）
- [x] Issue #11: matchUrl正規化・重複防止（generateMatchKey()関数）（2025-12-31）


---

## P0: Critical Issues (MVP完成に必須) - ✅ 実装完了

### Issue #145: Google Sheets + GAS API統合
- [x] Google Sheets設計（match_id, date, opponent, scores, stadium, kickoff, competition, ticket_sales_start, notes）
- [x] GASスクリプト作成・デプロイ（Bearer Token認証）
- [x] `server/sheets-sync.ts` 実装（fetchFromGoogleSheets, syncFromGoogleSheets）
- [x] tRPCルーター実装（matches.syncFromSheets, matches.getSheetsSyncLogs）
- [ ] 環境変数設定（GAS_API_URL, GAS_API_TOKEN）
- [ ] 定期同期ジョブ実装（毎日00:00）
- [ ] テスト実装・実行
- [ ] 外部スクレイピング依存削除

### Issue #146: DBスキーマ統一
- [x] Sheets列定義の確定
- [x] DBスキーマ更新（matchId, date, opponent, homeScore, awayScore, stadium, kickoff, competition, ticketSalesStart, notes）
- [x] マッピングロジック更新（mapSheetsToDb）
- [x] 同期ロジックをmatchIdベースに変更
- [ ] マイグレーション実行（pnpm db:push）
- [ ] 既存データ検証

### Issue #147: 過去試合上書き防止
- [x] 上書き制御ロジック実装（syncFromGoogleSheets with overwriteArchived option）
- [x] isResult判定ロジック実装（homeScore/awayScoreがある場合にisResult=1）
- [x] テスト実装（sheets-sync.test.ts）
- [ ] テスト実行（pnpm test）
- [ ] 既存データ### Issue #148: チケット販売情報表示制御
- [x] matchHelpers.ts実装（isPastMatch, shouldShowTicketInfo, getTicketSalesStatus）
- [x] Matchesページ更新（未来試合のみチケット情報表示）
- [x] テスト実装（matchHelpers.test.ts）
- [ ] テスト実行（pnpm test）
- [ ] UI検証ブラウザ確認


---

## P1: High Priority Issues (MVP後の重要機能)

### Issue #143: 広告表示制御（Free/Plus/Pro）
- [x] プラン判定ロジック実装（`canShowAds`, `getUserPlan`）
- [x] `AdBanner` コンポーネントを作成（MVPはプレースホルダ）
- [x] マッチログ一覧に挿入（ページ下部）
- [x] 集計ページに挿入（ページ下部）
- [x] テスト実装（AdBanner.test.tsx）
- [ ] Plus/Proで表示されないことを確認
- [ ] 画面確認（PC/SP）スクショを添付
- [ ] テスト実行（pnpm test）

### Issue #144: マリノス貯金機能
- [x] DBスキーマ追加（savings_rules, savings_history）
- [x] tRPCルーター実装（savings.ts）
- [x] フロントエンドコンポーネント実装（Savings.tsx）
- [x] App.tsxにルート追加（/savings）
- [ ] マイグレーション実行（pnpm db:push）
- [ ] 試合結果確定時の自動トリガー実装
- [ ] 通知機能実装（ブラウザ通知 or アラート）
- [ ] テスト実装・実行
- [ ] モバイル対応確認
