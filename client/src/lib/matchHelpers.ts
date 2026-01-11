/**
 * Issue #148: チケット販売情報表示制御
 * 試合関連のヘルパー関数
 */

/**
 * 試合が過去かどうかを判定
 * @param matchDate - 試合日 (YYYY-MM-DD)
 * @returns true if past, false if future or today
 */
export function isPastMatch(matchDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 今日の00:00:00

  const match = new Date(matchDate);
  match.setHours(0, 0, 0, 0);

  return match < today;
}

/**
 * チケット販売情報を表示すべきかどうかを判定
 * Issue #148: 未来試合のみ表示
 * 
 * @param matchDate - 試合日 (YYYY-MM-DD)
 * @param ticketSalesStart - チケット販売開始日 (YYYY-MM-DD | null)
 * @returns true if should show ticket info, false otherwise
 */
export function shouldShowTicketInfo(
  matchDate: string,
  ticketSalesStart?: string | null
): boolean {
  // 過去試合は表示しない
  if (isPastMatch(matchDate)) {
    return false;
  }

  // チケット販売開始日が設定されていない場合は表示しない
  if (!ticketSalesStart) {
    return false;
  }

  return true;
}

/**
 * チケット販売状況を取得
 * @param matchDate - 試合日 (YYYY-MM-DD)
 * @param ticketSalesStart - チケット販売開始日 (YYYY-MM-DD | null)
 * @returns 販売状況のラベルと色
 */
export function getTicketSalesStatus(
  matchDate: string,
  ticketSalesStart?: string | null
): {
  label: string;
  color: string;
  bgColor: string;
  show: boolean;
} {
  // 過去試合または販売開始日が未設定の場合は非表示
  if (!shouldShowTicketInfo(matchDate, ticketSalesStart)) {
    return {
      label: '',
      color: '',
      bgColor: '',
      show: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const salesStart = new Date(ticketSalesStart!);
  salesStart.setHours(0, 0, 0, 0);

  // 販売開始前
  if (salesStart > today) {
    return {
      label: `販売開始: ${ticketSalesStart}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      show: true,
    };
  }

  // 販売中
  return {
    label: 'チケット販売中',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    show: true,
  };
}

/**
 * 試合までの日数を取得
 * @param matchDate - 試合日 (YYYY-MM-DD)
 * @returns 日数 (負の値は過去)
 */
export function getDaysUntilMatch(matchDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const match = new Date(matchDate);
  match.setHours(0, 0, 0, 0);

  const diffTime = match.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 試合までの日数を人間が読みやすい形式で取得
 * @param matchDate - 試合日 (YYYY-MM-DD)
 * @returns 「今日」「明日」「3日後」「2日前」など
 */
export function getMatchCountdown(matchDate: string): string {
  const days = getDaysUntilMatch(matchDate);

  if (days === 0) return '今日';
  if (days === 1) return '明日';
  if (days === 2) return '明後日';
  if (days > 0) return `${days}日後`;
  if (days === -1) return '昨日';
  if (days < 0) return `${Math.abs(days)}日前`;

  return '';
}
