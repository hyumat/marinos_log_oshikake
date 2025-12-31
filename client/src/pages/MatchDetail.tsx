/**
 * Match Detail Page
 * Issue #39: Refactored to use MatchDetailView and UserMatchForm components
 */

import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { MatchDetailView } from '@/components/MatchDetailView';
import { UserMatchForm, type ExpenseData } from '@/components/UserMatchForm';
import { QueryLoading, QueryError } from '@/components/QueryState';
import type { MatchDTO } from '@shared/dto';

const STORAGE_KEY = 'oshikake-expenses';

function loadExpenses(): Record<string, ExpenseData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveExpenses(expenses: Record<string, ExpenseData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export default function MatchDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const matchId = params.id || '';

  const [initialExpenses, setInitialExpenses] = useState<ExpenseData>({
    transportation: '',
    ticket: '',
    food: '',
    other: '',
    note: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, error, refetch } = trpc.matches.listOfficial.useQuery({});

  const match = data?.matches?.find((m: { id: number | string }) => String(m.id) === matchId) as MatchDTO | undefined;

  useEffect(() => {
    if (matchId) {
      const stored = loadExpenses();
      if (stored[matchId]) {
        setInitialExpenses(stored[matchId]);
      }
    }
  }, [matchId]);

  const handleSubmit = (expenses: ExpenseData) => {
    setIsSaving(true);
    try {
      const stored = loadExpenses();
      stored[matchId] = expenses;
      saveExpenses(stored);
      setInitialExpenses(expenses);
      toast.success('保存しました');
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    try {
      const stored = loadExpenses();
      delete stored[matchId];
      saveExpenses(stored);
      setInitialExpenses({
        transportation: '',
        ticket: '',
        food: '',
        other: '',
        note: '',
      });
      toast.success('削除しました');
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4"
      onClick={() => setLocation('/matches')}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      マッチログに戻る
    </Button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <BackButton />
          <QueryLoading message="読み込み中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <BackButton />
          <QueryError 
            message="試合情報の取得に失敗しました" 
            onRetry={() => refetch()} 
          />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">試合が見つかりません</p>
        <Button onClick={() => setLocation('/matches')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          マッチログに戻る
        </Button>
      </div>
    );
  }

  const hasExpenses = initialExpenses.transportation || initialExpenses.ticket || 
                       initialExpenses.food || initialExpenses.other || initialExpenses.note;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <BackButton />
        <MatchDetailView match={match} />
        <UserMatchForm
          initialValues={initialExpenses}
          onSubmit={handleSubmit}
          onDelete={hasExpenses ? handleDelete : undefined}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
