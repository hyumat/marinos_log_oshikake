# 課金設計ドキュメント

## 概要

おしかけログの無料/有料プラン設計と課金方式の方針を定義します。

## プラン定義

### Free（無料プラン）

| 項目 | 制限 |
|------|------|
| 対象シーズン | 今季のみ |
| 観戦記録作成 | 10件まで |
| 既存記録の閲覧 | 無制限 |
| 既存記録の編集 | 可能 |
| 試合予定/結果閲覧 | 無制限 |
| 基本集計 | 可能 |

### Pro（有料プラン）

| 項目 | 内容 |
|------|------|
| 対象シーズン | 複数シーズン（過去/来季含む） |
| 観戦記録作成 | 無制限 |
| 詳細集計 | 可能（将来拡張） |
| CSV/PDFエクスポート | 可能（将来拡張） |
| 優先サポート | 可能（将来拡張） |

## データベース設計

### usersテーブル拡張

```sql
ALTER TABLE users ADD COLUMN plan VARCHAR(16) DEFAULT 'free';
ALTER TABLE users ADD COLUMN planExpiresAt TIMESTAMP NULL;
```

### 判定ロジック

```typescript
function isPro(user: User): boolean {
  if (user.plan !== 'pro') return false;
  if (user.planExpiresAt && user.planExpiresAt < new Date()) return false;
  return true;
}

function canCreateAttendance(user: User, seasonYear: number, currentCount: number): boolean {
  if (isPro(user)) return true;
  const currentSeason = getCurrentSeasonYear();
  if (seasonYear !== currentSeason) return false;
  return currentCount < 10;
}
```

## 課金方式の検討

### オプション1: Web課金（Stripe）

**メリット**
- 手数料が低い（約3%）
- 実装がシンプル
- Web/Nativeで統一可能

**デメリット**
- ストア規約との整合性確認が必要
- 決済画面がWebに遷移する

### オプション2: ストア課金（IAP）

**メリット**
- ストア審査でスムーズ
- ユーザーにとって馴染みがある

**デメリット**
- 手数料が高い（15-30%）
- iOS/Androidで別々の実装が必要
- レシート検証が必要

### 推奨方針

**Phase 1（MVP）**: Web課金（Stripe）で開始
- Webアプリが主軸のため、Stripeで統一
- ネイティブアプリからもWebの課金ページへ遷移

**Phase 2（ストア配信後）**: 必要に応じてIAP追加
- ストア規約で求められる場合のみ

## アップセル導線

### 制限到達時のモーダル

```
┌─────────────────────────────────────┐
│ 無料プランは今季10試合まで記録できます │
│                                     │
│ 11試合目からはProで無制限に。         │
│ 過去シーズンの記録もまとめて見返せます。│
│                                     │
│  [Proで続ける]  [キャンセル]          │
└─────────────────────────────────────┘
```

### 残り件数の表示

- ヘッダーまたは観戦記録一覧に表示
- 例: `今季の記録：7/10`

## API設計

### 件数チェック

```typescript
// GET /api/attendance/count?seasonYear=2026
{
  seasonYear: 2026,
  count: 7,
  limit: 10,
  isPro: false
}
```

### 作成時バリデーション

```typescript
// POST /api/attendance
// 403 Forbidden if limit reached
{
  error: 'LIMIT_REACHED',
  message: '無料プランの上限に達しました',
  limit: 10,
  upgradeUrl: '/upgrade'
}
```

## ページ構成

- `/upgrade` - Proプラン紹介ページ
- `/pricing` - 料金ページ（将来）
- `/account/subscription` - サブスク管理（将来）

## 更新履歴

- 2026-01-01: 初版作成
