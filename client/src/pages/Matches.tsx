import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, RefreshCw, MapPin, Calendar, Clock, Trophy, Minus, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { MatchFilter, type FilterState } from '@/components/MatchFilter';
import { toast } from 'sonner';

interface Match {
  id: number;
  sourceKey: string;
  date: string;
  kickoff?: string;
  competition?: string;
  homeTeam: string;
  awayTeam: string;
  opponent: string;
  stadium?: string;
  marinosSide?: 'home' | 'away';
  homeScore?: number;
  awayScore?: number;
  isResult: number;
  matchUrl: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 0] as const; // 0 = all

export default function Matches() {
  const [, setLocation] = useLocation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [displayedMatches, setDisplayedMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(20);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    opponent: '',
    marinosSide: 'all',
  });

  // tRPC クエリ・ミューテーション
  const { data: matchesData, isLoading: isLoadingMatches, refetch } = trpc.matches.listOfficial.useQuery({});
  const fetchOfficialMutation = trpc.matches.fetchOfficial.useMutation();

  // ページアクセス時はキャッシュデータを表示（スクレイピングは手動）
  useEffect(() => {
    if (!isLoadingMatches) {
      setIsLoading(false);
    }
  }, [isLoadingMatches]);
  
  // 手動で最新データを取得
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await fetchOfficialMutation.mutateAsync({ force: true });
      await refetch();
      if (result.success) {
        toast.success(`試合情報を更新しました（${result.matches}件）`);
      } else {
        toast.error('試合情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast.error('試合情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (matchesData?.matches) {
      // Sort: upcoming matches first (by date asc), then finished (by date desc)
      const sorted = [...matchesData.matches].sort((a, b) => {
        // Upcoming matches first
        if (a.isResult !== b.isResult) {
          return a.isResult - b.isResult; // 0 (upcoming) before 1 (finished)
        }
        // Within same category, sort by date
        if (a.isResult === 0) {
          // Upcoming: earliest first
          return a.date.localeCompare(b.date);
        } else {
          // Finished: newest first
          return b.date.localeCompare(a.date);
        }
      });
      setMatches(sorted);
      applyFilters(sorted, filters);
    }
  }, [matchesData]);

  useEffect(() => {
    applyFilters(matches, filters);
  }, [filters]);

  // Apply page size limit
  useEffect(() => {
    if (pageSize === 0) {
      setDisplayedMatches(filteredMatches);
    } else {
      setDisplayedMatches(filteredMatches.slice(0, pageSize));
    }
  }, [filteredMatches, pageSize]);

  const applyFilters = (matchList: Match[], filterState: FilterState) => {
    let result = matchList;

    // Date range filter
    if (filterState.dateFrom) {
      result = result.filter((m) => m.date >= filterState.dateFrom);
    }
    if (filterState.dateTo) {
      result = result.filter((m) => m.date <= filterState.dateTo);
    }

    // Opponent filter
    if (filterState.opponent) {
      const searchTerm = filterState.opponent.toLowerCase();
      result = result.filter((m) =>
        m.opponent.toLowerCase().includes(searchTerm)
      );
    }

    // Home/Away filter
    if (filterState.marinosSide !== 'all') {
      result = result.filter((m) => m.marinosSide === filterState.marinosSide);
    }

    setFilteredMatches(result);
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      opponent: '',
      marinosSide: 'all',
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatScore = (match: Match) => {
    if (match.homeScore !== undefined && match.homeScore !== null && 
        match.awayScore !== undefined && match.awayScore !== null) {
      return `${match.homeScore}-${match.awayScore}`;
    }
    return 'vs';
  };

  const getVenueInfo = (marinosSide?: string) => {
    if (marinosSide === 'home') return { label: 'HOME', color: 'bg-blue-600 text-white' };
    if (marinosSide === 'away') return { label: 'AWAY', color: 'bg-red-600 text-white' };
    return { label: 'OTHER', color: 'bg-gray-500 text-white' };
  };

  const getGoogleMapsUrl = (stadium?: string) => {
    if (!stadium) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stadium)}`;
  };

  // Determine match result from Marinos perspective
  const getMatchResult = (match: Match): { result: 'win' | 'lose' | 'draw' | null; label: string; bgColor: string; textColor: string; borderColor: string } => {
    if (!match.isResult || match.homeScore === undefined || match.awayScore === undefined) {
      return { result: null, label: '', bgColor: '', textColor: '', borderColor: 'border-l-gray-400' };
    }

    const marinosScore = match.marinosSide === 'home' ? match.homeScore : match.awayScore;
    const opponentScore = match.marinosSide === 'home' ? match.awayScore : match.homeScore;

    if (marinosScore > opponentScore) {
      return { 
        result: 'win', 
        label: '勝', 
        bgColor: 'bg-blue-600', 
        textColor: 'text-white',
        borderColor: 'border-l-blue-500'
      };
    } else if (marinosScore < opponentScore) {
      return { 
        result: 'lose', 
        label: '負', 
        bgColor: 'bg-red-600', 
        textColor: 'text-white',
        borderColor: 'border-l-red-500'
      };
    } else {
      return { 
        result: 'draw', 
        label: '分', 
        bgColor: 'bg-gray-500', 
        textColor: 'text-white',
        borderColor: 'border-l-gray-500'
      };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">マッチログ</h1>
          <p className="text-muted-foreground">
            横浜F・マリノスの試合情報を管理します
          </p>
        </div>

        {/* フィルター */}
        <MatchFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* コントロール */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">表示件数:</span>
              <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size === 0 ? '全件' : `${size}件`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoading && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                読み込み中...
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              公式から取得
            </Button>
            <Button
              onClick={() => {}}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </div>
        </div>

        {/* 試合リスト - 2カラムレイアウト */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filteredMatches.length === 0 && matches.length > 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                フィルター条件に合致する試合がありません。
              </p>
            </CardContent>
          </Card>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                試合情報が見つかりません。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 左カラム: 予定試合 */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                今後の予定
                <span className="text-sm font-normal text-muted-foreground">
                  ({displayedMatches.filter(m => m.isResult !== 1).length}件)
                </span>
              </h2>
              <div className="space-y-2">
                {displayedMatches.filter(m => m.isResult !== 1).map((match) => {
                  const venueInfo = getVenueInfo(match.marinosSide);
                  const mapsUrl = getGoogleMapsUrl(match.stadium);
                  
                  return (
                    <Card 
                      key={match.id || match.sourceKey} 
                      className="hover:shadow-md transition-shadow border-l-4 border-l-green-500"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${venueInfo.color}`}>
                                {venueInfo.label}
                              </span>
                              {match.competition && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded dark:bg-slate-800 dark:text-slate-300">
                                  {match.competition}
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-sm">
                              vs {match.opponent}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(match.date)}
                              </span>
                              {match.kickoff && (
                                <span className="flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" />
                                  {match.kickoff}
                                </span>
                              )}
                              {match.stadium && mapsUrl && (
                                <a 
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  <MapPin className="h-3 w-3" />
                                  {match.stadium}
                                </a>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 h-7 px-2 text-xs"
                            onClick={() => setLocation(`/matches/${match.id}`)}
                          >
                            詳細
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {displayedMatches.filter(m => m.isResult !== 1).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">予定試合がありません</p>
                )}
              </div>
            </div>

            {/* 右カラム: 過去試合 */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                過去の試合
                <span className="text-sm font-normal text-muted-foreground">
                  ({displayedMatches.filter(m => m.isResult === 1).length}件)
                </span>
              </h2>
              <div className="space-y-2">
                {displayedMatches.filter(m => m.isResult === 1).map((match) => {
                  const venueInfo = getVenueInfo(match.marinosSide);
                  const mapsUrl = getGoogleMapsUrl(match.stadium);
                  const matchResult = getMatchResult(match);
                  
                  return (
                    <Card 
                      key={match.id || match.sourceKey} 
                      className={`hover:shadow-md transition-shadow border-l-4 ${matchResult.borderColor}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${venueInfo.color}`}>
                                {venueInfo.label}
                              </span>
                              {match.competition && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded dark:bg-slate-800 dark:text-slate-300">
                                  {match.competition}
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-sm">
                              vs {match.opponent}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(match.date)}
                              </span>
                              {match.stadium && mapsUrl && (
                                <a 
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  <MapPin className="h-3 w-3" />
                                  {match.stadium}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {matchResult.result && (
                              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${matchResult.bgColor} ${matchResult.textColor}`}>
                                {matchResult.label}
                              </span>
                            )}
                            <div className="text-lg font-bold w-12 text-center">
                              {formatScore(match)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setLocation(`/matches/${match.id}`)}
                            >
                              詳細
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {displayedMatches.filter(m => m.isResult === 1).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">過去の試合がありません</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* More indicator */}
        {pageSize > 0 && filteredMatches.length > pageSize && (
          <div className="text-center py-3 text-sm text-muted-foreground">
            {filteredMatches.length - pageSize}件の試合が非表示です
          </div>
        )}

        {/* 統計情報 */}
        {filteredMatches.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  全試合
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{filteredMatches.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  予定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {filteredMatches.filter(m => m.isResult !== 1).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  終了
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {filteredMatches.filter(m => m.isResult === 1).length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  勝ち
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {filteredMatches.filter(m => getMatchResult(m).result === 'win').length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  引き分け
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-600">
                  {filteredMatches.filter(m => getMatchResult(m).result === 'draw').length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  負け
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  {filteredMatches.filter(m => getMatchResult(m).result === 'lose').length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
