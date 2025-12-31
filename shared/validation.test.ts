import { describe, it, expect } from 'vitest';
import { validateExpenseData, calculateTotalCost, type ExpenseFormData } from './validation';

describe('validateExpenseData', () => {
  it('validates valid empty form', () => {
    const data: ExpenseFormData = {
      transportation: '',
      ticket: '',
      food: '',
      other: '',
      note: '',
    };
    
    const result = validateExpenseData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates valid form with all values', () => {
    const data: ExpenseFormData = {
      transportation: '1000',
      ticket: '5000',
      food: '2000',
      other: '500',
      note: 'Great match!',
    };
    
    const result = validateExpenseData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates form with zero values', () => {
    const data: ExpenseFormData = {
      transportation: '0',
      ticket: '0',
      food: '0',
      other: '0',
      note: '',
    };
    
    const result = validateExpenseData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid number in transportation', () => {
    const data: ExpenseFormData = {
      transportation: 'abc',
      ticket: '5000',
      food: '2000',
      other: '500',
      note: '',
    };
    
    const result = validateExpenseData(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('交通費は数値で入力してください');
  });

  it('rejects negative values', () => {
    const data: ExpenseFormData = {
      transportation: '-100',
      ticket: '5000',
      food: '2000',
      other: '500',
      note: '',
    };
    
    const result = validateExpenseData(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('交通費は0以上で入力してください');
  });

  it('reports multiple errors', () => {
    const data: ExpenseFormData = {
      transportation: 'abc',
      ticket: '-100',
      food: 'xyz',
      other: '-50',
      note: '',
    };
    
    const result = validateExpenseData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('calculateTotalCost', () => {
  it('calculates total from all fields', () => {
    const data: ExpenseFormData = {
      transportation: '1000',
      ticket: '5000',
      food: '2000',
      other: '500',
      note: '',
    };
    
    expect(calculateTotalCost(data)).toBe(8500);
  });

  it('handles empty strings as zero', () => {
    const data: ExpenseFormData = {
      transportation: '',
      ticket: '5000',
      food: '',
      other: '',
      note: '',
    };
    
    expect(calculateTotalCost(data)).toBe(5000);
  });

  it('handles all empty as zero', () => {
    const data: ExpenseFormData = {
      transportation: '',
      ticket: '',
      food: '',
      other: '',
      note: '',
    };
    
    expect(calculateTotalCost(data)).toBe(0);
  });

  it('ignores invalid numbers (treats as zero)', () => {
    const data: ExpenseFormData = {
      transportation: 'abc',
      ticket: '5000',
      food: 'xyz',
      other: '',
      note: '',
    };
    
    expect(calculateTotalCost(data)).toBe(5000);
  });
});
