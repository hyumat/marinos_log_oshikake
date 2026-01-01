# オフライン対応設計

## 概要

観戦中の電波が弱い環境でも入力を守るためのオフライン対応設計です。

## 段階的実装計画

### Phase 1: 下書き保存（MVP）

入力途中のデータをローカルに保存し、消失を防ぐ。

**対象データ**
- 観戦記録（memo等）
- 費用（カテゴリ/金額）

**保存先**
- localStorage（Web）
- Capacitor Preferences（Native）

**トリガー**
- 入力フィールドのblur時
- 一定間隔（30秒）での自動保存

### Phase 2: オンライン復帰時の同期

ネットワーク復帰時に下書きをサーバーに送信。

**フロー**
1. オンライン検出（navigator.onLine / Network plugin）
2. 下書きキューをチェック
3. サーバーに送信
4. 成功したら下書きを削除

### Phase 3: 競合解決

同じ記録を複数端末で編集した場合の対応。

**方針**
- Last Write Wins（最後に書き込んだものが勝ち）
- 競合発生時はユーザーに通知

## 技術設計

### 下書きデータ構造

```typescript
interface Draft {
  id: string;           // UUID
  matchId: number;      // 対象試合ID
  data: {
    expenses: {
      transport: number;
      ticket: number;
      food: number;
      other: number;
    };
    note: string;
  };
  savedAt: string;      // ISO timestamp
  syncStatus: 'pending' | 'synced' | 'failed';
}
```

### ストレージキー

```
oshikake:draft:{matchId}
oshikake:drafts:queue
```

### フック実装例

```typescript
function useLocalDraft(matchId: number) {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`oshikake:draft:${matchId}`);
    if (saved) setDraft(JSON.parse(saved));
  }, [matchId]);

  const saveDraft = (data: Draft['data']) => {
    const draft: Draft = {
      id: crypto.randomUUID(),
      matchId,
      data,
      savedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    localStorage.setItem(`oshikake:draft:${matchId}`, JSON.stringify(draft));
    setDraft(draft);
  };

  const clearDraft = () => {
    localStorage.removeItem(`oshikake:draft:${matchId}`);
    setDraft(null);
  };

  return { draft, saveDraft, clearDraft };
}
```

### オンライン検出

```typescript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

## UI/UX

### オフライン時の表示

- ヘッダーにオフラインバナー表示
- 「下書き保存中」のインジケーター
- 同期ボタンは無効化

### 同期時の表示

- 「同期中...」のローディング
- 成功時: 「同期しました」トースト
- 失敗時: 「同期に失敗しました。再試行してください」

## 注意事項

- 下書きはあくまで一時的なもの
- 同期完了まではサーバーにデータがない
- 端末を変えると下書きは引き継げない

## 更新履歴

- 2026-01-01: 初版作成
