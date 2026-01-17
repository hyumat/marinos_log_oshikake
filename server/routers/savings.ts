/**
 * Issue #144: マリノス貯金機能 - tRPCルーター
 * 
 * 貯金ルールの管理と貯金履歴の記録
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { db } from '../db';
import { savingsRules, savingsHistory, matches } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export const savingsRouter = router({
  /**
   * 貯金ルール一覧取得
   */
  listRules: protectedProcedure.query(async ({ ctx }) => {
    const rules = await db.query.savingsRules.findMany({
      where: eq(savingsRules.userId, ctx.user.openId),
      orderBy: [desc(savingsRules.createdAt)],
    });
    
    return { rules };
  }),

  /**
   * 貯金ルール追加
   */
  addRule: protectedProcedure
    .input(z.object({
      condition: z.string().min(1).max(256),
      amount: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [rule] = await db.insert(savingsRules).values({
        userId: ctx.user.openId,
        condition: input.condition,
        amount: input.amount,
        enabled: true,
      });
      
      return { success: true, rule };
    }),

  /**
   * 貯金ルール削除
   */
  deleteRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // ルールの所有者確認
      const rule = await db.query.savingsRules.findFirst({
        where: and(
          eq(savingsRules.id, input.id),
          eq(savingsRules.userId, ctx.user.openId)
        ),
      });
      
      if (!rule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'ルールが見つかりません' });
      }
      
      await db.delete(savingsRules).where(eq(savingsRules.id, input.id));
      
      return { success: true };
    }),

  /**
   * 貯金ルール有効/無効切り替え
   */
  toggleRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // ルールの所有者確認
      const rule = await db.query.savingsRules.findFirst({
        where: and(
          eq(savingsRules.id, input.id),
          eq(savingsRules.userId, ctx.user.openId)
        ),
      });
      
      if (!rule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'ルールが見つかりません' });
      }
      
      await db.update(savingsRules)
        .set({ enabled: !rule.enabled })
        .where(eq(savingsRules.id, input.id));
      
      return { success: true, enabled: !rule.enabled };
    }),

  /**
   * 貯金履歴取得
   */
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const history = await db.query.savingsHistory.findMany({
        where: eq(savingsHistory.userId, ctx.user.openId),
        orderBy: [desc(savingsHistory.triggeredAt)],
        limit: input.limit,
      });
      
      // 試合情報を取得
      const historyWithMatches = await Promise.all(
        history.map(async (item: typeof savingsHistory.$inferSelect) => {
          if (!item.matchId) return { ...item, match: null };

          const match = await db.query.matches.findFirst({
            where: eq(matches.id, item.matchId),
          });

          return { ...item, match };
        })
      );
      
      return { history: historyWithMatches };
    }),

  /**
   * 累計貯金額取得
   */
  getTotalSavings: protectedProcedure.query(async ({ ctx }) => {
    const history = await db.query.savingsHistory.findMany({
      where: eq(savingsHistory.userId, ctx.user.openId),
    });

    const total = history.reduce((sum: number, item: typeof savingsHistory.$inferSelect) => sum + item.amount, 0);

    return { total };
  }),

  /**
   * 試合結果に基づいて貯金をトリガー
   * 
   * @param matchId - 試合ID
   * @param result - 試合結果 ('勝利', '引き分け', '敗北')
   * @param scorers - 得点者リスト (オプション)
   */
  triggerSavings: protectedProcedure
    .input(z.object({
      matchId: z.number(),
      result: z.enum(['勝利', '引き分け', '敗北']),
      scorers: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 有効なルールを取得
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
        if (input.scorers && input.scorers.length > 0) {
          for (const scorer of input.scorers) {
            if (
              rule.condition.includes(scorer) || 
              rule.condition === `${scorer}得点`
            ) {
              matched = true;
              break;
            }
          }
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
      
      const totalAmount = triggeredRules.reduce((sum, r) => sum + r.amount, 0);
      
      return {
        triggered: triggeredRules.length > 0,
        rules: triggeredRules,
        totalAmount,
        message: triggeredRules.length > 0
          ? `${triggeredRules.map(r => r.condition).join('、')}により ${totalAmount}円の貯金です！`
          : '該当するルールがありませんでした',
      };
    }),

  /**
   * テスト用: 試合データを送信して貯金をトリガー
   */
  testTrigger: protectedProcedure
    .input(z.object({
      result: z.enum(['勝利', '引き分け', '敗北']),
      scorers: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 有効なルールを取得
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
        if (input.scorers && input.scorers.length > 0) {
          for (const scorer of input.scorers) {
            if (
              rule.condition.includes(scorer) || 
              rule.condition === `${scorer}得点`
            ) {
              matched = true;
              break;
            }
          }
        }
        
        if (matched) {
          triggeredRules.push(rule);
        }
      }
      
      // テスト用なので実際には履歴に追加しない
      const totalAmount = triggeredRules.reduce((sum, r) => sum + r.amount, 0);
      
      return {
        triggered: triggeredRules.length > 0,
        rules: triggeredRules,
        totalAmount,
        message: triggeredRules.length > 0
          ? `${triggeredRules.map(r => r.condition).join('、')}により ${totalAmount}円の貯金です！`
          : '該当するルールがありませんでした',
      };
    }),

  /**
   * 未処理の試合結果に対して自動的に貯金をトリガー
   *
   * 試合結果が確定している（isResult=1）が、まだ貯金履歴に記録されていない試合を検出し、
   * 該当するルールを適用して貯金履歴を作成する。
   *
   * 使用タイミング:
   * - ユーザーが貯金ページを開いたとき
   * - 定期的なバックグラウンドジョブ（将来実装）
   */
  checkPendingSavings: protectedProcedure.query(async ({ ctx }) => {
    try {
      // 有効なルールを取得
      const rules = await db.query.savingsRules.findMany({
        where: and(
          eq(savingsRules.userId, ctx.user.openId),
          eq(savingsRules.enabled, true)
        ),
      });

      if (rules.length === 0) {
        return {
          success: true,
          processed: 0,
          totalAmount: 0,
          newSavings: [],
          message: '有効な貯金ルールがありません',
        };
      }

      // 結果が確定している試合を取得
      const completedMatches = await db.query.matches.findMany({
        where: eq(matches.isResult, 1),
      });

      if (completedMatches.length === 0) {
        return {
          success: true,
          processed: 0,
          totalAmount: 0,
          newSavings: [],
          message: '結果確定済みの試合がありません',
        };
      }

      // 既存の貯金履歴を取得（重複チェック用）
      const existingHistory = await db.query.savingsHistory.findMany({
        where: eq(savingsHistory.userId, ctx.user.openId),
      });

      // 既に処理済みの試合IDのセット
      const processedMatchIds = new Set(
        existingHistory.map((h: typeof savingsHistory.$inferSelect) => h.matchId).filter((id: number | null): id is number => id !== null)
      );

      // 未処理の試合をフィルタリング
      const pendingMatches = completedMatches.filter(
        (match: typeof matches.$inferSelect) => match.id && !processedMatchIds.has(match.id)
      );

      if (pendingMatches.length === 0) {
        return {
          success: true,
          processed: 0,
          totalAmount: 0,
          newSavings: [],
          message: '新しい試合結果はありません',
        };
      }

      const newSavings: Array<{
        matchId: number;
        condition: string;
        amount: number;
        result: string;
      }> = [];

      // 各試合に対してルールを適用
      for (const match of pendingMatches) {
        if (!match.id || match.homeScore === null || match.awayScore === null) {
          continue;
        }

        // 試合結果を判定
        let result: '勝利' | '引き分け' | '敗北';

        // marinosSide: 'home' or 'away'
        const marinosScore = match.marinosSide === 'home' ? match.homeScore : match.awayScore;
        const opponentScore = match.marinosSide === 'home' ? match.awayScore : match.homeScore;

        if (marinosScore > opponentScore) {
          result = '勝利';
        } else if (marinosScore === opponentScore) {
          result = '引き分け';
        } else {
          result = '敗北';
        }

        // 該当するルールを検索
        const matchedRules = rules.filter((rule: typeof savingsRules.$inferSelect) => {
          // 試合結果のチェック
          if (rule.condition === result) {
            return true;
          }

          // TODO: 得点者ベースのルール（将来実装）
          // if (rule.condition.includes('得点')) {
          //   // 得点者情報が利用可能になったら実装
          // }

          return false;
        });

        // 貯金履歴に追加
        for (const rule of matchedRules) {
          await db.insert(savingsHistory).values({
            userId: ctx.user.openId,
            ruleId: rule.id,
            matchId: match.id,
            condition: rule.condition,
            amount: rule.amount,
          });

          newSavings.push({
            matchId: match.id,
            condition: rule.condition,
            amount: rule.amount,
            result,
          });
        }
      }

      const totalAmount = newSavings.reduce((sum, s) => sum + s.amount, 0);

      return {
        success: true,
        processed: pendingMatches.length,
        totalAmount,
        newSavings,
        message: newSavings.length > 0
          ? `${pendingMatches.length}試合を処理し、${totalAmount}円の貯金が追加されました！`
          : `${pendingMatches.length}試合を処理しましたが、該当するルールはありませんでした`,
      };
    } catch (error) {
      console.error('checkPendingSavings error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '貯金チェック中にエラーが発生しました',
      });
    }
  }),
});
