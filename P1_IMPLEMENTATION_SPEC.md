# P1: High Priority Issues - 実装仕様書

## 概要

P1では、MVP後の重要機能として「広告表示制御」と「マリノス貯金機能」を実装します。これらはマネタイズ対応の基盤となる機能です。

---

## Issue #143: 広告表示制御（Free/Plus/Pro）

### 背景・目的

- Freeプランの収益化として広告を導入
- Plus/Proでは広告を非表示にし、体験の差別化
- まずは最も壊れにくい **固定バナー枠1つ** から開始

### スコープ（MVP）

**対象ページ**:
- マッチログ一覧（`/matches`）
- 集計ページ（`/stats`）

**対象外**:
- ランディングページ（LP）
- フォーム入力中（観戦記録/費用入力）

### 仕様

#### 表示条件
- **Freeプランのみ表示**
- Plus/Proでは **DOMごと出さない**（空白も作らない）

#### 表示位置
- ページ下部（コンテンツの最後）

#### サイズ/レイアウト
- 高さを固定してレイアウトシフトを防ぐ
- モバイル/PCのレスポンシブ対応
- ラベル「広告」を小さく表示

### 技術要件

#### 1) プラン判定ロジック

```typescript
// server/lib/planHelpers.ts
export type UserPlan = 'free' | 'plus' | 'pro';

export function getUserPlan(user: User): UserPlan {
  // entitlements/planから判定
  // 将来のIAP追加にも耐える設計
  if (!user) return 'free';
  
  // TODO: entitlementsテーブルから取得
  // 現状はデフォルトでfree
  return user.plan || 'free';
}

export function canShowAds(user: User): boolean {
  const plan = getUserPlan(user);
  return plan === 'free';
}
```

#### 2) AdBannerコンポーネント

```typescript
// client/src/components/AdBanner.tsx
import { useAuth } from '@/contexts/AuthContext';
import { canShowAds } from '@/lib/planHelpers';

interface AdBannerProps {
  placement: 'matchLog' | 'stats';
}

export function AdBanner({ placement }: AdBannerProps) {
  const { user } = useAuth();
  
  // Plus/Proでは何も表示しない
  if (!canShowAds(user)) {
    return null;
  }
  
  return (
    <div className="w-full py-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs text-gray-400 mb-1">広告</div>
        <div className="w-full h-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400">広告枠（プレースホルダ）</span>
        </div>
      </div>
    </div>
  );
}
```

#### 3) ページへの挿入

```typescript
// client/src/pages/Matches.tsx
import { AdBanner } from '@/components/AdBanner';

export default function Matches() {
  // ... existing code ...
  
  return (
    <div>
      {/* ... existing content ... */}
      
      {/* 広告バナー */}
      <AdBanner placement="matchLog" />
    </div>
  );
}
```

### 受け入れ条件

- [ ] Freeプランのユーザーで「マッチログ一覧」「集計」に固定バナー枠が表示される
- [ ] Plus/Proでは広告枠が一切表示されない（空白も出ない）
- [ ] レイアウトが崩れない（モバイルでも押せる/見切れない）
- [ ] 広告枠が原因でページ初期表示が極端に遅くならない

### 実装タスク

- [ ] `canShowAds` を実装（entitlements/planから判定）
- [ ] `AdBanner` コンポーネントを作成（MVPはプレースホルダでOK）
- [ ] マッチログ一覧に挿入（ページ下部）
- [ ] 集計ページに挿入（ページ下部）
- [ ] Plus/Proで表示されないことを確認
- [ ] 画面確認（PC/SP）スクショを添付

---

## Issue #144: マリノス貯金機能

### 背景・目的

- ユーザーが試合結果に応じて貯金ルールを設定
- 試合結果が確定したら通知を表示
- 貯金履歴を記録・可視化

### 機能概要

#### 1) 貯金ルール設定

**デフォルトルール**:
- 勝利: 500円
- 引き分け: 300円
- エジガル得点: 300円
- アンデルソン・ロペス得点: 300円

**カスタムルール**:
- ユーザーが自由に条件と金額を設定可能
- 有効/無効の切り替え
- ルールの追加・削除

#### 2) 試合データ処理

- 試合結果が確定したら自動的にルールをチェック
- マッチしたルールを貯金履歴に追加
- 通知を表示（ブラウザ通知 or アラート）

#### 3) 貯金履歴

- 貯金した日時、条件、金額を記録
- 累計貯金額を表示
- 履歴一覧を表示

### 技術要件

#### 1) DBスキーマ

```typescript
// drizzle/schema.ts

// 貯金ルール
export const savingsRules = sqliteTable('savings_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.openId),
  condition: text('condition').notNull(), // '勝利', 'エジガル得点', etc.
  amount: integer('amount').notNull(), // 貯金額（円）
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 貯金履歴
export const savingsHistory = sqliteTable('savings_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.openId),
  ruleId: integer('rule_id').references(() => savingsRules.id),
  matchId: integer('match_id').references(() => matches.id),
  condition: text('condition').notNull(),
  amount: integer('amount').notNull(),
  triggeredAt: text('triggered_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

#### 2) tRPCルーター

```typescript
// server/routers/savings.ts

export const savingsRouter = router({
  // ルール一覧取得
  listRules: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.savingsRules.findMany({
      where: eq(savingsRules.userId, ctx.user.openId),
      orderBy: [desc(savingsRules.createdAt)],
    });
  }),

  // ルール追加
  addRule: protectedProcedure
    .input(z.object({
      condition: z.string(),
      amount: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [rule] = await db.insert(savingsRules).values({
        userId: ctx.user.openId,
        condition: input.condition,
        amount: input.amount,
        enabled: true,
      }).returning();
      return rule;
    }),

  // ルール削除
  deleteRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(savingsRules).where(
        and(
          eq(savingsRules.id, input.id),
          eq(savingsRules.userId, ctx.user.openId)
        )
      );
      return { success: true };
    }),

  // ルール有効/無効切り替え
  toggleRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const rule = await db.query.savingsRules.findFirst({
        where: and(
          eq(savingsRules.id, input.id),
          eq(savingsRules.userId, ctx.user.openId)
        ),
      });
      
      if (!rule) throw new TRPCError({ code: 'NOT_FOUND' });
      
      await db.update(savingsRules)
        .set({ enabled: !rule.enabled })
        .where(eq(savingsRules.id, input.id));
      
      return { success: true };
    }),

  // 貯金履歴取得
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.savingsHistory.findMany({
      where: eq(savingsHistory.userId, ctx.user.openId),
      orderBy: [desc(savingsHistory.triggeredAt)],
      with: {
        match: true,
      },
    });
  }),

  // 累計貯金額取得
  getTotalSavings: protectedProcedure.query(async ({ ctx }) => {
    const history = await db.query.savingsHistory.findMany({
      where: eq(savingsHistory.userId, ctx.user.openId),
    });
    
    const total = history.reduce((sum, item) => sum + item.amount, 0);
    return { total };
  }),

  // 試合結果に基づいて貯金をトリガー
  triggerSavings: protectedProcedure
    .input(z.object({
      matchId: z.number(),
      result: z.enum(['勝利', '引き分け', '敗北']),
      scorers: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const rules = await db.query.savingsRules.findMany({
        where: and(
          eq(savingsRules.userId, ctx.user.openId),
          eq(savingsRules.enabled, true)
        ),
      });
      
      const triggeredRules = [];
      
      for (const rule of rules) {
        let matched = false;
        
        // 試合結果のチェック
        if (rule.condition === input.result) {
          matched = true;
        }
        
        // 得点者のチェック
        if (input.scorers && input.scorers.some(scorer => 
          rule.condition.includes(scorer) || rule.condition === `${scorer}得点`
        )) {
          matched = true;
        }
        
        if (matched) {
          triggeredRules.push(rule);
        }
      }
      
      // 貯金履歴に追加
      for (const rule of triggeredRules) {
        await db.insert(savingsHistory).values({
          userId: ctx.user.openId,
          ruleId: rule.id,
          matchId: input.matchId,
          condition: rule.condition,
          amount: rule.amount,
        });
      }
      
      return {
        triggered: triggeredRules.length > 0,
        rules: triggeredRules,
        totalAmount: triggeredRules.reduce((sum, r) => sum + r.amount, 0),
      };
    }),
});
```

#### 3) フロントエンドコンポーネント

```typescript
// client/src/pages/Savings.tsx

export default function Savings() {
  const [view, setView] = useState<'home' | 'rules' | 'history'>('home');
  
  const { data: rules } = trpc.savings.listRules.useQuery();
  const { data: history } = trpc.savings.getHistory.useQuery();
  const { data: totalSavings } = trpc.savings.getTotalSavings.useQuery();
  
  const addRuleMutation = trpc.savings.addRule.useMutation();
  const deleteRuleMutation = trpc.savings.deleteRule.useMutation();
  const toggleRuleMutation = trpc.savings.toggleRule.useMutation();
  
  // ... implementation ...
  
  return (
    <div>
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PiggyBank size={32} />
          マリノス貯金
        </h1>
        <div className="mt-4">
          <div className="text-sm opacity-90">累計貯金額</div>
          <div className="text-3xl font-bold">
            ¥{totalSavings?.total.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* ナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto flex">
          <button onClick={() => setView('home')}>ホーム</button>
          <button onClick={() => setView('rules')}>ルール設定</button>
          <button onClick={() => setView('history')}>履歴</button>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      {view === 'home' && <HomeView />}
      {view === 'rules' && <RulesView />}
      {view === 'history' && <HistoryView />}
    </div>
  );
}
```

### 受け入れ条件

- [ ] ユーザーが貯金ルールを追加・削除・有効/無効切り替えできる
- [ ] 試合結果が確定したら自動的にルールをチェックし、貯金履歴に追加
- [ ] 通知を表示（ブラウザ通知 or アラート）
- [ ] 貯金履歴一覧を表示
- [ ] 累計貯金額を表示
- [ ] モバイル対応

### 実装タスク

- [ ] DBスキーマ追加（savings_rules, savings_history）
- [ ] tRPCルーター実装（savings.ts）
- [ ] フロントエンドコンポーネント実装（Savings.tsx）
- [ ] 試合結果確定時の自動トリガー実装
- [ ] 通知機能実装
- [ ] テスト実装

---

## 実装順序

1. **Issue #143: 広告表示制御** (1-2日)
   - プラン判定ロジック実装
   - AdBannerコンポーネント作成
   - マッチログ一覧・集計ページに挿入
   - テスト・画面確認

2. **Issue #144: マリノス貯金機能** (2-3日)
   - DBスキーマ追加・マイグレーション
   - tRPCルーター実装
   - フロントエンドコンポーネント実装
   - 試合結果確定時の自動トリガー実装
   - 通知機能実装
   - テスト実装

---

## 技術的考慮事項

### プラン判定の一元化

- `canShowAds(user)` のような関数に集約
- 画面ごとに `if (plan === "free")` を散らさない
- 将来のIAP追加にも耐える設計

### パフォーマンス

- 広告SDK導入時は遅延ロード（初期表示をブロックしない）
- MVPはプレースホルダで開始

### 通知

- ブラウザ通知API（Notification）を使用
- 権限がない場合はアラートで代替

---

## テスト項目

### Issue #143

- [ ] Freeプランで広告が表示される
- [ ] Plus/Proで広告が表示されない
- [ ] レイアウトが崩れない（PC/SP）
- [ ] ページ初期表示が遅くならない

### Issue #144

- [ ] 貯金ルールの追加・削除・有効/無効切り替え
- [ ] 試合結果確定時の自動トリガー
- [ ] 通知表示
- [ ] 貯金履歴一覧表示
- [ ] 累計貯金額表示
- [ ] モバイル対応

---

## 後続タスク（別Issue推奨）

### Issue #143

- 実際の広告プロバイダ選定・導入（タグ/SDK）
- Privacy/Termsへの広告配信に関する追記

### Issue #144

- 試合結果確定時の自動トリガーを定期ジョブで実装
- 貯金目標設定機能
- 貯金グラフ・統計表示
