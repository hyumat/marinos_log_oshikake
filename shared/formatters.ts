/**
 * Shared formatters for consistent display across the application
 * Issue #36: 共通Formatterを導入（通貨/日付/勝分敗）
 */

/**
 * Format currency in Japanese Yen
 * @param value - The amount (number, string, null, or undefined)
 * @returns Formatted string like "¥1,234" or "¥0" for invalid/empty values
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '¥0';
  }
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num)) {
    return '¥0';
  }
  return `¥${num.toLocaleString('ja-JP')}`;
}

/**
 * Format date in Japanese format
 * @param dateStr - Date string (YYYY-MM-DD or ISO format)
 * @param options - Format options
 * @returns Formatted date string
 */
export type DateFormatStyle = 'short' | 'long' | 'withTime' | 'withWeekday';

export function formatDateTime(
  dateStr: string | Date | null | undefined,
  style: DateFormatStyle = 'short'
): string {
  if (!dateStr) {
    return '';
  }

  try {
    const date = typeof dateStr === 'string' 
      ? new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
      : dateStr;

    if (isNaN(date.getTime())) {
      return '';
    }

    switch (style) {
      case 'short':
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      case 'long':
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'withWeekday':
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        });
      case 'withTime':
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return date.toLocaleDateString('ja-JP');
    }
  } catch {
    return '';
  }
}

/**
 * Format win/draw/loss record
 * @param win - Number of wins
 * @param draw - Number of draws  
 * @param loss - Number of losses
 * @param unknown - Number of unknown results (optional)
 * @returns Formatted string like "3勝 2分 2敗" or "3勝 2分 2敗 1未確定"
 */
export function formatWDL(
  win: number | null | undefined,
  draw: number | null | undefined,
  loss: number | null | undefined,
  unknown?: number | null | undefined
): string {
  const w = win ?? 0;
  const d = draw ?? 0;
  const l = loss ?? 0;
  const u = unknown ?? 0;

  let result = `${w}勝 ${d}分 ${l}敗`;
  if (u > 0) {
    result += ` ${u}未確定`;
  }
  return result;
}

/**
 * Format score display
 * @param homeScore - Home team score
 * @param awayScore - Away team score
 * @returns Formatted score like "2-1" or "vs" if scores are not available
 */
export function formatScore(
  homeScore: number | null | undefined,
  awayScore: number | null | undefined
): string {
  if (homeScore !== undefined && homeScore !== null && 
      awayScore !== undefined && awayScore !== null) {
    return `${homeScore}-${awayScore}`;
  }
  return 'vs';
}

/**
 * Calculate average, returning 0 for empty/zero cases
 * @param total - Total amount
 * @param count - Number of items
 * @returns Average rounded to nearest integer
 */
export function calcAverage(
  total: number | null | undefined,
  count: number | null | undefined
): number {
  const t = total ?? 0;
  const c = count ?? 0;
  if (c === 0) {
    return 0;
  }
  return Math.round(t / c);
}
