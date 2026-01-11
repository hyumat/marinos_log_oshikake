# Google Sheets テンプレート - Marinos Match Data

## シート名: `matches`

### 列定義

| 列名 | 型 | 必須 | 説明 | 例 |
|------|-----|------|------|-----|
| match_id | String | ✅ | 固定ID（ユニーク） | M001, M002 |
| date | Date | ✅ | 試合日（YYYY-MM-DD） | 2025-01-12 |
| opponent | String | ✅ | 対戦相手チーム名 | 浦和レッズ |
| home_score | Number | | ホームスコア（試合後のみ） | 2 |
| away_score | Number | | アウェイスコア（試合後のみ） | 1 |
| stadium | String | | スタジアム名 | 日産スタジアム |
| kickoff | String | | キックオフ時刻（HH:MM） | 19:00 |
| competition | String | | 大会名 | J1 |
| ticket_sales_start | Date | | チケット販売開始日 | 2024-12-15 |
| notes | String | | 備考 | |

---

## サンプルデータ

```
| match_id | date | opponent | home_score | away_score | stadium | kickoff | competition | ticket_sales_start | notes |
|----------|------|----------|------------|------------|---------|---------|-------------|-------------------|-------|
| M001 | 2025-01-12 | 浦和レッズ | 2 | 1 | 日産スタジアム | 19:00 | J1 | 2024-12-15 | |
| M002 | 2025-02-16 | ガンバ大阪 | | | 万博記念競技場 | 18:00 | J1 | 2025-01-20 | |
| M003 | 2025-03-02 | FC東京 | 1 | 1 | 日産スタジアム | 14:00 | J1 | 2025-02-01 | |
| M004 | 2025-03-16 | 鹿島アントラーズ | | | カシマスタジアム | 15:00 | J1 | 2025-02-15 | |
| M005 | 2025-04-06 | 川崎フロンターレ | 3 | 2 | 日産スタジアム | 19:00 | J1 | 2025-03-10 | |
```

---

## セットアップ手順

### 1. Google Sheets を作成

1. Google Drive で新しいスプレッドシートを作成
2. シート名を `matches` に変更
3. 1行目にヘッダー行を追加（上記の列定義に従う）
4. サンプルデータを入力

### 2. Google Apps Script をデプロイ

1. Google Sheets で「拡張機能」→「Apps Script」を開く
2. `gas/sync.gs` の内容を貼り付け
3. プロジェクト設定 → スクリプトプロパティ → プロパティを追加
   - プロパティ: `GAS_API_TOKEN`
   - 値: ランダムな文字列（例: `your-secret-token-12345`）
4. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
   - 説明: Marinos Match Data API
   - 次のユーザーとして実行: 自分
   - アクセスできるユーザー: 全員
   - デプロイ
5. デプロイURLをコピー（例: `https://script.google.com/macros/s/XXXXX/exec`）

### 3. 環境変数を設定

プロジェクトの `.env` ファイルに以下を追加:

```env
GAS_API_URL="https://script.google.com/macros/s/XXXXX/exec"
GAS_API_TOKEN="your-secret-token-12345"
```

### 4. 動作確認

```bash
# サーバーを起動
pnpm dev

# 別のターミナルで同期テスト
curl -X POST http://localhost:3000/api/trpc/matches.syncFromSheets \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{}'
```

---

## データ入力のベストプラクティス

### 1. match_id の命名規則

- **形式**: `M{3桁の連番}`
- **例**: M001, M002, M003, ...
- **注意**: 一度設定したIDは変更しない（DBの参照整合性）

### 2. date の形式

- **形式**: `YYYY-MM-DD`
- **例**: 2025-01-12
- **注意**: Google Sheets の日付型ではなく、文字列として入力

### 3. スコアの入力

- **試合前**: 空欄のまま
- **試合後**: 数値を入力（例: 2, 1）
- **注意**: 両方のスコアが入力されている場合のみ「試合結果あり」と判定

### 4. kickoff の形式

- **形式**: `HH:MM`
- **例**: 19:00, 14:00
- **注意**: 24時間表記

### 5. ticket_sales_start の形式

- **形式**: `YYYY-MM-DD`
- **例**: 2024-12-15
- **注意**: 未来試合のみ入力（過去試合は空欄）

---

## トラブルシューティング

### GAS API が 401 Unauthorized を返す

- スクリプトプロパティの `GAS_API_TOKEN` が正しく設定されているか確認
- `.env` ファイルの `GAS_API_TOKEN` と一致しているか確認

### GAS API が 404 Not Found を返す

- シート名が `matches` になっているか確認
- ヘッダー行（1行目）が正しく設定されているか確認

### データが同期されない

- `match_id` 列が空の行がないか確認
- 日付形式が `YYYY-MM-DD` になっているか確認
- サーバーログを確認（`pnpm dev` の出力）

---

## 定期同期の設定

### 方法1: GAS のトリガー（推奨）

1. Apps Script エディタで「トリガー」→「トリガーを追加」
2. 実行する関数: `doPost`（または専用の同期関数を作成）
3. イベントのソース: 時間主導型
4. 時間ベースのトリガー: 日タイマー
5. 時刻: 午前0時〜1時

### 方法2: サーバー側の Cron ジョブ

```typescript
// server/jobs/sync-sheets.ts
import { CronJob } from 'cron';
import { syncFromGoogleSheets } from '../sheets-sync';

export function startSheetsSyncJob() {
  const job = new CronJob(
    '0 0 * * *', // 毎日 00:00
    async () => {
      console.log('Starting Sheets sync job...');
      const result = await syncFromGoogleSheets();
      console.log('Sheets sync completed:', result);
    },
    null,
    true,
    'Asia/Tokyo'
  );

  return job;
}
```

---

## セキュリティ

### トークンの管理

- `GAS_API_TOKEN` は絶対に公開しない
- `.env` ファイルは `.gitignore` に追加
- 定期的にトークンをローテーション

### Sheets のアクセス権限

- 編集権限は信頼できる人のみに付与
- 閲覧権限は「リンクを知っている全員」に設定しない
- 定期的にアクセスログを確認

---

## よくある質問

### Q: 過去試合のスコアを修正したい

A: Google Sheets で直接修正してください。ただし、DB側で `isResult=1` の試合は上書きされません（Issue #147）。強制的に上書きする場合は、管理画面から「過去試合を上書き」オプションを有効にして同期してください。

### Q: 新しい試合を追加したい

A: Google Sheets に新しい行を追加し、`match_id` を採番してください。次回の同期時に自動的にDBに追加されます。

### Q: 試合を削除したい

A: Google Sheets から行を削除しても、DB側のデータは削除されません。DB側で手動削除が必要です。

### Q: 複数のシーズンを管理したい

A: シート名を `matches_2025`, `matches_2026` のように分けるか、`season` 列を追加してフィルタリングしてください。
