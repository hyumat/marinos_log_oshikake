/**
 * Issue #144: マリノス貯金機能 - フロントエンドコンポーネント
 *
 * 貯金ルールの管理と貯金履歴の表示
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, PiggyBank, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { formatCurrency } from '@shared/formatters';
import DashboardLayout from '@/components/DashboardLayout';

export default function Savings() {
  const [newCondition, setNewCondition] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useUtils();

  // 未処理の貯金をチェック
  const { data: pendingCheck } = trpc.savings.checkPendingSavings.useQuery(undefined, {
    // ページロード時に1回だけ実行
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 新しい貯金が見つかったら通知を表示
  useEffect(() => {
    if (pendingCheck && pendingCheck.success && pendingCheck.newSavings.length > 0) {
      const { totalAmount, processed, newSavings } = pendingCheck;

      // 貯金履歴とトータルを再取得
      utils.savings.getHistory.invalidate();
      utils.savings.getTotalSavings.invalidate();

      // 詳細な通知を表示
      const savingsList = newSavings
        .map((s) => `${s.condition}: ${formatCurrency(s.amount)}`)
        .join('\n');

      toast.success(`🎉 新しい貯金が追加されました！`, {
        description: `${processed}試合を処理し、合計${formatCurrency(totalAmount)}の貯金です！\n${savingsList}`,
        duration: 5000,
      });
    }
  }, [pendingCheck, utils]);
  
  // データ取得
  const { data: rulesData, isLoading: rulesLoading } = trpc.savings.listRules.useQuery();
  const { data: historyData, isLoading: historyLoading } = trpc.savings.getHistory.useQuery({ limit: 50 });
  const { data: totalData, isLoading: totalLoading } = trpc.savings.getTotalSavings.useQuery();
  
  // ミューテーション
  const addRuleMutation = trpc.savings.addRule.useMutation({
    onSuccess: () => {
      utils.savings.listRules.invalidate();
      setNewCondition('');
      setNewAmount('');
      setIsAdding(false);
      toast.success('ルールを追加しました');
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  const deleteRuleMutation = trpc.savings.deleteRule.useMutation({
    onSuccess: () => {
      utils.savings.listRules.invalidate();
      toast.success('ルールを削除しました');
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  const toggleRuleMutation = trpc.savings.toggleRule.useMutation({
    onSuccess: (data) => {
      utils.savings.listRules.invalidate();
      toast.success(data.enabled ? 'ルールを有効にしました' : 'ルールを無効にしました');
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });

  const handleAddRule = () => {
    const amount = parseInt(newAmount, 10);
    
    if (!newCondition.trim()) {
      toast.error('条件を入力してください');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('正しい金額を入力してください');
      return;
    }
    
    addRuleMutation.mutate({
      condition: newCondition.trim(),
      amount,
    });
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('このルールを削除しますか？')) {
      deleteRuleMutation.mutate({ id });
    }
  };

  const handleToggleRule = (id: number) => {
    toggleRuleMutation.mutate({ id });
  };

  const rules = rulesData?.rules || [];
  const history = historyData?.history || [];
  const total = totalData?.total || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <PiggyBank className="h-8 w-8" />
            マリノス貯金
          </h1>
          <p className="text-muted-foreground">
            試合結果に応じて自動で貯金ルールをトリガー
          </p>
        </div>

        {/* 累計貯金額 */}
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">累計貯金額</p>
                <p className="text-4xl font-bold text-blue-600">
                  {totalLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    formatCurrency(total)
                  )}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 貯金ルール */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>貯金ルール</span>
                <Button
                  size="sm"
                  onClick={() => setIsAdding(!isAdding)}
                  variant={isAdding ? 'outline' : 'default'}
                >
                  {isAdding ? 'キャンセル' : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* ルール追加フォーム */}
              {isAdding && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="condition">条件</Label>
                      <Input
                        id="condition"
                        placeholder="例: 勝利、エジガル得点"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">金額（円）</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="500"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddRule}
                      disabled={addRuleMutation.isPending}
                      className="w-full"
                    >
                      {addRuleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      追加
                    </Button>
                  </div>
                </div>
              )}

              {/* ルール一覧 */}
              {rulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : rules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ルールがありません。追加してください。
                </p>
              ) : (
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{rule.condition}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(rule.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                          disabled={toggleRuleMutation.isPending}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={deleteRuleMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 貯金履歴 */}
          <Card>
            <CardHeader>
              <CardTitle>貯金履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  履歴がありません
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.condition}</p>
                        {item.match && (
                          <p className="text-xs text-muted-foreground">
                            {item.match.date} vs {item.match.opponent}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.triggeredAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          +{formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 使い方ガイド */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使い方</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. 貯金ルールを追加します（例: 「勝利」で500円）</p>
              <p>2. 試合結果が確定すると、自動的にルールがトリガーされます</p>
              <p>3. 貯金履歴で累計額を確認できます</p>
              <p className="mt-4 text-xs">
                ※ 現在はMVP版のため、手動でトリガーする必要があります。将来的には試合結果確定時に自動でトリガーされます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
