# Marinos Away Log V2 - Project TODO

## NorthStarGoal
- 公式試合データを取り込み、ユーザーが観戦した試合の記録と費用を蓄積できる
- 観戦試合の結果（勝敗など）と費用（合計・内訳）を集計できる

## MVP
### A. 公式試合データ（基盤）
- 公式データを取得しDBへ同期（最低限のフィールドが埋まる）
- 日付、キックオフ、対戦（home/away）、会場、スコア/結果、競技/大会、節/ラウンド
- データが取れない時はログに残り、アプリは落ちない

### B. 観戦記録（ユーザー入力）
- 試合を1件選んで「観戦した」として登録できる
- 登録項目（MVP最小）
- 観戦日（datetime）
- 費用合計（number）
- メモ（text、任意）
- 任意でHome/Awayは試合情報から判定 or 選択不要
- 編集・削除ができる

### C. 集計（MVP最小）
- 観戦試合の集計
- 観戦試合数
- 勝・分・敗（※スコアがある試合のみ対象、未確定は除外）
- 費用集計
- 費用合計
- 1試合あたり平均費用（費用合計 / 観戦試合数）
- フィルタ
- 年（または期間指定）で絞れる

### D. 画面（MVP最小の3画面）
- 試合一覧（公式）
- 公式試合を一覧表示、各試合から詳細へ
- 試合詳細（観戦ログ入力）
- 試合情報＋「観戦記録の追加/編集/削除」
- 集計（Stats）
- 観戦数、勝分敗、費用合計、平均、期間フィルタ

## Data Model（MVP最小）
### matches（公式試合）
id
date（YYYY-MM-DD）
kickoff（HH:MM）
competition（大会名）
roundLabel（第◯節/MD◯など）
stadium（会場）
home / away
homeScore / awayScore（null可）
status（試合終了/試合前など）
sourceUrl（matchUrl）
fetchedAt / updatedAt（任意）

### userMatches（観戦ログ）
id
matchId（FK）
watchedAt（datetime）
costTotal（number）
memo（text, nullable）
createdAt / updatedAt

## API（MVP最小）
matches.fetchOfficial：公式試合を取得→DB upsert（同期）
matches.listOfficial：DBの公式試合一覧
userMatches.add/update/delete/getByMatchId：観戦ログCRUD
stats.getSummary：期間指定で集計（観戦数、勝分敗、費用合計、平均）
