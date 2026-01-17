/**
 * Constants
 * Issue #105: Manus OAuth依存削除
 */

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Manus OAuth関連のコードを削除
// getLoginUrl(), getSignUpUrl()は削除され、直接 "/login" へのリンクに変更
