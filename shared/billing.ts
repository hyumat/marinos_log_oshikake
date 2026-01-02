/**
 * Billing utilities for plan management
 * Issue #44: 無料プラン制限（10件まで）
 * Issue #50: 実効プラン値をAPIで統一（期限切れでもPro表示されない）
 * Issue #55: 3プラン対応（Free/Plus/Pro）
 * Issue #59: シーズン跨ぎでリセットされない
 */

export const FREE_PLAN_LIMIT = 10;
export const PLUS_PLAN_LIMIT = 30;

export type Plan = 'free' | 'plus' | 'pro';

export interface PlanStatus {
  plan: Plan;
  effectivePlan: Plan;
  isPro: boolean;
  isPlus: boolean;
  seasonYear: number;
  attendanceCount: number;
  limit: number;
  remaining: number;
  canCreate: boolean;
}

export function getCurrentSeasonYear(): number {
  return new Date().getFullYear();
}

export function isPaidPlan(plan: Plan, planExpiresAt: Date | null): boolean {
  if (plan === 'free') return false;
  if (planExpiresAt && planExpiresAt < new Date()) return false;
  return true;
}

export function isPro(plan: Plan, planExpiresAt: Date | null): boolean {
  if (plan !== 'pro') return false;
  if (planExpiresAt && planExpiresAt < new Date()) return false;
  return true;
}

export function isPlus(plan: Plan, planExpiresAt: Date | null): boolean {
  if (plan !== 'plus') return false;
  if (planExpiresAt && planExpiresAt < new Date()) return false;
  return true;
}

export function getEffectivePlan(plan: Plan, planExpiresAt: Date | null): Plan {
  if (!isPaidPlan(plan, planExpiresAt)) return 'free';
  return plan;
}

export function getPlanLimit(plan: Plan, planExpiresAt: Date | null): number {
  const effective = getEffectivePlan(plan, planExpiresAt);
  if (effective === 'pro') return Infinity;
  if (effective === 'plus') return PLUS_PLAN_LIMIT;
  return FREE_PLAN_LIMIT;
}

export function canCreateAttendance(
  plan: Plan,
  planExpiresAt: Date | null,
  currentCount: number
): boolean {
  const limit = getPlanLimit(plan, planExpiresAt);
  return currentCount < limit;
}

export function calculatePlanStatus(
  plan: Plan,
  planExpiresAt: Date | null,
  attendanceCount: number
): PlanStatus {
  const userIsPro = isPro(plan, planExpiresAt);
  const userIsPlus = isPlus(plan, planExpiresAt);
  const effectivePlan = getEffectivePlan(plan, planExpiresAt);
  const seasonYear = getCurrentSeasonYear();
  const limit = getPlanLimit(plan, planExpiresAt);
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - attendanceCount);
  const canCreate = attendanceCount < limit;

  return {
    plan,
    effectivePlan,
    isPro: userIsPro,
    isPlus: userIsPlus,
    seasonYear,
    attendanceCount,
    limit,
    remaining,
    canCreate,
  };
}
