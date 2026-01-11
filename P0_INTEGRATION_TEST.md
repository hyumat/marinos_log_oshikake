# P0 Critical Issues - 統合テストチェックリスト

## 実装完了したIssue

- ✅ Issue #145: Google Sheets + GAS API統合
- ✅ Issue #146: DBスキーマ統一
- ✅ Issue #147: 過去試合上書き防止
- ✅ Issue #148: チケット販売情報表示制御

---

## セットアップ手順

### 1. Google Sheets の準備

#### 1.1 Sheetsを作成
1. Google Drive で新しいスプレッドシートを作成
2. シート名を `matches` に変更
3. 1行目にヘッダー行を追加:
   ```
   match_id | date | opponent | home_score | away_score | stadium | kickoff | competition | ticket_sales_start | notes
   ```

#### 1.2 サンプルデータを入力
```
M001 | 2025-01-12 | 浦和レッズ | 2 | 1 | 日産スタジアム | 19:00 | J1 | 2024-12-15 | 
M002 | 2025-02-16 | ガンバ大阪 |  |  | 万博記念競技場 | 18:00 | J1 | 2025-01-20 | 
M003 | 2025-03-02 | FC東京 | 1 | 1 | 日産スタジアム | 14:00 | J1 | 2025-02-01 | 
M004 | 2025-03-16 | 鹿島アントラーズ |  |  | カシマスタジアム | 15:00 | J1 | 2025-02-15 | 
M005 | 2025-04-06 | 川崎フロンターレ | 3 | 2 | 日産スタジアム | 19:00 | J1 | 2025-03-10 | 
```

### 2. Google Apps Script のデプロイ

#### 2.1 Apps Script を開く
1. Google Sheets で「拡張機能」→「Apps Script」を開く
2. `gas/sync.gs` の内容を貼り付け

#### 2.2 スクリプトプロパティを設定
1. プロジェクト設定 → スクリプトプロパティ → プロパティを追加
2. プロパティ: `GAS_API_TOKEN`
3. 値: ランダムな文字列（例: `marinos-secret-token-12345`）

#### 2.3 デプロイ
1. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
2. 説明: Marinos Match Data API
3. 次のユーザーとして実行: 自分
4. アクセスできるユーザー: 全員
5. デプロイ
6. デプロイURLをコピー（例: `https://script.google.com/macros/s/XXXXX/exec`）

### 3. 環境変数の設定

プロジェクトの `.env` ファイルに以下を追加:

```env
GAS_API_URL="https://script.google.com/macros/s/XXXXX/exec"
GAS_API_TOKEN="marinos-secret-token-12345"
```

### 4. DBマイグレーション

```bash
cd /home/ubuntu/marinos_log_oshikake
pnpm db:push
```

---

## テスト項目

### Issue #145: Google Sheets + GAS API統合

#### ✅ GAS API の動作確認

```bash
# GAS API エンドポイントをテスト
curl -X POST "https://script.google.com/macros/s/XXXXX/exec" \
  -H "Authorization: Bearer marinos-secret-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"action":"getMatches"}'
```

**期待される結果:**
```json
{
  "success": true,
  "data": [
    {
      "match_id": "M001",
      "date": "2025-01-12",
      "opponent": "浦和レッズ",
      ...
    }
  ],
  "count": 5
}
```

#### ✅ Sheets同期機能のテスト

```bash
# サーバーを起動
pnpm dev

# 別のターミナルで同期テスト（管理者権限必要）
# ブラウザで http://localhost:3000 にアクセス
# 管理者としてログイン
# マッチログページで「公式から取得」ボタンをクリック
```

**期待される動作:**
- Sheets から試合データが取得される
- DB に保存される
- 試合一覧に表示される

#### ✅ syncLog の記録確認

```bash
# syncLogs テーブルを確認
# DB管理画面で確認、または:
pnpm db:studio
```

**期待される結果:**
- `source = 'sheets'`
- `status = 'success'`
- `matchesCount = 5`

---

### Issue #146: DBスキーマ統一

#### ✅ スキーマ変更の確認

```bash
# マイグレーション後、スキーマを確認
pnpm db:studio
```

**期待される列:**
- `matchId` (varchar, unique)
- `ticketSalesStart` (varchar, nullable)
- `notes` (text, nullable)
- `sourceKey` (varchar, unique) - 互換性維持

#### ✅ マッピングロジックの確認

Sheets同期後、DB内のデータを確認:

```sql
SELECT matchId, date, opponent, homeScore, awayScore, ticketSalesStart, notes
FROM matches
WHERE source = 'sheets'
LIMIT 5;
```

**期待される結果:**
- `matchId` = Sheetsの`match_id`
- `ticketSalesStart` = Sheetsの`ticket_sales_start`
- `notes` = Sheetsの`notes`

---

### Issue #147: 過去試合上書き防止

#### ✅ 過去試合の上書き防止テスト

1. **初回同期**
   ```bash
   # 管理画面で「公式から取得」をクリック
   ```

2. **Sheets側でスコアを変更**
   - M001のスコアを `2-1` → `3-2` に変更

3. **再同期（デフォルト: overwriteArchived=false）**
   ```bash
   # 再度「公式から取得」をクリック
   ```

4. **DB確認**
   ```sql
   SELECT matchId, homeScore, awayScore, isResult
   FROM matches
   WHERE matchId = 'M001';
   ```

**期待される結果:**
- `homeScore = 2` (元のまま)
- `awayScore = 1` (元のまま)
- `isResult = 1`

#### ✅ 強制上書きテスト

1. **管理画面で「過去試合を上書き」オプションを有効にして同期**
   （UI実装が必要な場合は、tRPCミューテーションを直接呼び出し）

2. **DB確認**
   ```sql
   SELECT matchId, homeScore, awayScore
   FROM matches
   WHERE matchId = 'M001';
   ```

**期待される結果:**
- `homeScore = 3` (更新された)
- `awayScore = 2` (更新された)

#### ✅ 未来試合の更新テスト

1. **Sheets側でM002のスタジアムを変更**
   - `万博記念競技場` → `パナソニックスタジアム吹田`

2. **再同期（overwriteArchived=false）**

3. **DB確認**
   ```sql
   SELECT matchId, stadium, isResult
   FROM matches
   WHERE matchId = 'M002';
   ```

**期待される結果:**
- `stadium = 'パナソニックスタジアム吹田'` (更新された)
- `isResult = 0`

---

### Issue #148: チケット販売情報表示制御

#### ✅ 未来試合のチケット情報表示

1. **ブラウザで http://localhost:3000/matches にアクセス**

2. **未来試合カードを確認**
   - M002（2025-02-16）
   - M004（2025-03-16）

**期待される表示:**
- チケット販売開始日が未来の場合: 「販売開始: YYYY-MM-DD」（オレンジ）
- チケット販売開始日が過去の場合: 「チケット販売中」（緑）
- 試合までのカウントダウン: 「今日」「明日」「3日後」など

#### ✅ 過去試合のチケット情報非表示

1. **過去試合カードを確認**
   - M001（2025-01-12）

**期待される表示:**
- チケット販売情報は表示されない
- 試合結果（スコア）が表示される

#### ✅ チケット販売開始日が未設定の試合

1. **Sheets側でM004の`ticket_sales_start`を空にする**

2. **再同期**

3. **ブラウザで確認**

**期待される表示:**
- チケット販売情報は表示されない

---

## 単体テストの実行

```bash
cd /home/ubuntu/marinos_log_oshikake

# 全テストを実行
pnpm test

# 特定のテストファイルのみ実行
pnpm test sheets-sync.test.ts
pnpm test matchHelpers.test.ts
```

**期待される結果:**
- すべてのテストがパス
- カバレッジ: 80%以上

---

## エラーハンドリングのテスト

### ✅ GAS API エラー

1. **不正なトークンでアクセス**
   ```bash
   curl -X POST "https://script.google.com/macros/s/XXXXX/exec" \
     -H "Authorization: Bearer invalid-token" \
     -H "Content-Type: application/json" \
     -d '{"action":"getMatches"}'
   ```

**期待される結果:**
- `{ "success": false, "error": "Unauthorized: Invalid or missing token" }`

### ✅ ネットワークタイムアウト

1. **GAS_API_URLを不正なURLに変更**
   ```env
   GAS_API_URL="https://invalid-url.example.com"
   ```

2. **同期を実行**

**期待される結果:**
- エラーメッセージ: 「GAS API request timeout or network error」
- syncLog に `status = 'failed'` が記録される

### ✅ 不正なデータ形式

1. **Sheets側で`match_id`を空にする**

2. **同期を実行**

**期待される結果:**
- 空のIDはスキップされる
- 他の有効なデータは正常に同期される

---

## パフォーマンステスト

### ✅ 大量データの同期

1. **Sheets側で100件の試合データを追加**

2. **同期を実行**

**期待される結果:**
- 同期時間: 10秒以内
- メモリ使用量: 正常範囲内

---

## 統合テスト完了チェックリスト

- [ ] GAS API の動作確認
- [ ] Sheets同期機能のテスト
- [ ] syncLog の記録確認
- [ ] スキーマ変更の確認
- [ ] マッピングロジックの確認
- [ ] 過去試合の上書き防止テスト
- [ ] 強制上書きテスト
- [ ] 未来試合の更新テスト
- [ ] 未来試合のチケット情報表示
- [ ] 過去試合のチケット情報非表示
- [ ] チケット販売開始日が未設定の試合
- [ ] 単体テストの実行
- [ ] エラーハンドリングのテスト
- [ ] パフォーマンステスト

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

### マイグレーションエラー

- DB接続情報が正しいか確認
- `DATABASE_URL` が正しく設定されているか確認
- `pnpm db:push --force` で強制マイグレーション

---

## 次のステップ

P0の実装とテストが完了したら、以下に進む:

1. **P1: High Priority Issues**
   - Issue #143: 広告表示制御（Free/Plus/Pro）
   - Issue #144: マリノス貯金機能

2. **P2: Medium Priority Issues**
   - パフォーマンス最適化
   - UI/UX改善

3. **本番環境デプロイ**
   - 環境変数の設定
   - DBマイグレーション
   - 定期同期ジョブの設定
