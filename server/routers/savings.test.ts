import { describe, expect, it } from 'vitest';
import { savingsRouter } from './savings';

describe('savings router', () => {
  it('should have listRules procedure', () => {
    expect(savingsRouter._def.procedures.listRules).toBeDefined();
  });

  it('should have addRule procedure', () => {
    expect(savingsRouter._def.procedures.addRule).toBeDefined();
  });

  it('should have deleteRule procedure', () => {
    expect(savingsRouter._def.procedures.deleteRule).toBeDefined();
  });

  it('should have toggleRule procedure', () => {
    expect(savingsRouter._def.procedures.toggleRule).toBeDefined();
  });

  it('should have getHistory procedure', () => {
    expect(savingsRouter._def.procedures.getHistory).toBeDefined();
  });

  it('should have getTotalSavings procedure', () => {
    expect(savingsRouter._def.procedures.getTotalSavings).toBeDefined();
  });

  it('should have triggerSavings procedure', () => {
    expect(savingsRouter._def.procedures.triggerSavings).toBeDefined();
  });

  it('should have testTrigger procedure', () => {
    expect(savingsRouter._def.procedures.testTrigger).toBeDefined();
  });

  it('should have checkPendingSavings procedure', () => {
    expect(savingsRouter._def.procedures.checkPendingSavings).toBeDefined();
  });
});
