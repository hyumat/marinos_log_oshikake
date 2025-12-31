/**
 * Shared Query State Components
 * Issue #38: tRPC呼び出しのerror/loading/emptyを共通化
 */

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QueryLoadingProps {
  message?: string;
  className?: string;
}

export function QueryLoading({ message = '読み込み中...', className = '' }: QueryLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function QueryError({ 
  message = 'データの取得に失敗しました', 
  onRetry,
  className = '' 
}: QueryErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">エラーが発生しました</h2>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      )}
    </div>
  );
}

interface QueryEmptyProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function QueryEmpty({
  icon,
  title = 'データがありません',
  message,
  action,
  className = '',
}: QueryEmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && (
        <div className="rounded-full bg-muted p-6 mb-4">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {message && (
        <p className="text-muted-foreground max-w-md mb-4">{message}</p>
      )}
      {action}
    </div>
  );
}

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  loadingMessage,
  errorMessage,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  children,
  className = '',
}: QueryStateProps) {
  if (isLoading) {
    return <QueryLoading message={loadingMessage} className={className} />;
  }

  if (isError) {
    return <QueryError message={errorMessage} onRetry={onRetry} className={className} />;
  }

  if (isEmpty) {
    return (
      <QueryEmpty
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
}

export function QueryStateCard({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  loadingMessage,
  errorMessage,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  children,
}: QueryStateProps) {
  if (isLoading || isError || isEmpty) {
    return (
      <Card>
        <CardContent className="py-8">
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            onRetry={onRetry}
            loadingMessage={loadingMessage}
            errorMessage={errorMessage}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
            emptyAction={emptyAction}
          >
            {null}
          </QueryState>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
