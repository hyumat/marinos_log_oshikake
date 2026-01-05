# エクスポート設計

## 概要

ユーザーが自分のデータを持ち出せるようにするエクスポート機能の設計です。
「資産感」を提供し、有料プランの差別化にも活用します。

## エクスポート形式

### Phase 1: CSV（MVP）

**観戦記録CSV**

```csv
日付,対戦相手,HOME/AWAY,スコア,結果,交通費,チケット代,飲食代,その他,合計,メモ
2026-03-15,FC東京,HOME,2-1,勝,2400,5000,1500,0,8900,良い試合だった
2026-03-22,浦和レッズ,AWAY,1-1,分,4800,5500,2000,500,12800,アウェイ遠征
```

**年間集計CSV**

```csv
シーズン,観戦数,勝,分,敗,勝率,費用合計,平均費用
2026,15,10,3,2,66.7%,145000,9667
2025,20,12,5,3,60.0%,198000,9900
```

### Phase 2: PDF（将来）

**今季まとめPDF**
- 表紙: シーズン、観戦数、勝率
- 試合一覧: カレンダー形式
- 費用サマリー: グラフ付き
- ベストマッチ: 費用最高/最低

### Phase 3: バックアップ（将来）

- Google Drive連携
- iCloud連携

## API設計

### CSV生成

```
GET /api/export/csv?type=attendance&seasonYear=2026
GET /api/export/csv?type=summary&seasonYear=2026
```

### レスポンス

```typescript
// Content-Type: text/csv; charset=utf-8
// Content-Disposition: attachment; filename="oshika_2026_attendance.csv"
```

## エクスポート対象フィールド

### 観戦記録

| フィールド | 日本語名 | 型 |
|------------|----------|-----|
| date | 日付 | YYYY-MM-DD |
| opponent | 対戦相手 | string |
| marinosSide | HOME/AWAY | string |
| homeScore | ホームスコア | number |
| awayScore | アウェイスコア | number |
| result | 結果 | 勝/分/敗/- |
| transport | 交通費 | number |
| ticket | チケット代 | number |
| food | 飲食代 | number |
| other | その他 | number |
| total | 合計 | number |
| note | メモ | string |

### 年間集計

| フィールド | 日本語名 | 型 |
|------------|----------|-----|
| seasonYear | シーズン | number |
| watchCount | 観戦数 | number |
| win | 勝 | number |
| draw | 分 | number |
| loss | 敗 | number |
| winRate | 勝率 | string (%) |
| totalCost | 費用合計 | number |
| avgCost | 平均費用 | number |

## プラン別機能

| 機能 | Free | Pro |
|------|------|-----|
| CSV（今季） | 制限付き | 可 |
| CSV（全シーズン） | - | 可 |
| PDF | - | 可 |
| バックアップ | - | 可 |

## 実装タスク

1. [ ] CSVエクスポートAPI作成
2. [ ] エクスポートページ作成
3. [ ] ダウンロードボタン実装
4. [ ] Pro制限チェック追加

## セキュリティ

- 認証必須
- 自分のデータのみエクスポート可能
- レート制限（1分に1回まで）

## 更新履歴

- 2026-01-01: 初版作成
