/**
 * Shared validation functions
 * Issue #39: Form validation logic extracted for testability
 */

export interface ExpenseFormData {
  transportation: string;
  ticket: string;
  food: string;
  other: string;
  note: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate expense form data
 * @param data - Form data to validate
 * @returns Validation result with errors
 */
export function validateExpenseData(data: ExpenseFormData): ValidationResult {
  const errors: string[] = [];
  
  const parseAmount = (val: string): number | null => {
    if (val === '' || val === undefined) return 0;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  const amounts = [
    { field: '交通費', value: data.transportation },
    { field: 'チケット代', value: data.ticket },
    { field: '飲食代', value: data.food },
    { field: 'その他', value: data.other },
  ];

  for (const { field, value } of amounts) {
    const parsed = parseAmount(value);
    if (parsed === null) {
      errors.push(`${field}は数値で入力してください`);
    } else if (parsed < 0) {
      errors.push(`${field}は0以上で入力してください`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate total cost from expense data
 * @param data - Expense form data
 * @returns Total cost in yen
 */
export function calculateTotalCost(data: ExpenseFormData): number {
  return [
    data.transportation,
    data.ticket,
    data.food,
    data.other,
  ].reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
}
