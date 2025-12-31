/**
 * Match Detail View Component
 * Issue #39: 観戦記録フォームをコンポーネント化（ViewとFormの責務分離）
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDateTime } from '@shared/formatters';
import type { MatchDTO } from '@shared/dto';

interface MatchDetailViewProps {
  match: MatchDTO;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const marinosGoals = match.marinosSide === 'home' ? match.homeScore : match.awayScore;
  const opponentGoals = match.marinosSide === 'home' ? match.awayScore : match.homeScore;
  const hasScore = marinosGoals !== null && opponentGoals !== null && match.isResult === 1;

  const getResultInfo = () => {
    if (!hasScore || marinosGoals === null || opponentGoals === null) return null;
    if (marinosGoals > opponentGoals) {
      return { label: '勝', color: 'bg-green-100 text-green-800 border-green-300' };
    }
    if (marinosGoals < opponentGoals) {
      return { label: '負', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    return { label: '分', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  const resultInfo = getResultInfo();
  const venueLabel = match.marinosSide === 'home' ? 'HOME' : 'AWAY';
  const venueColor = match.marinosSide === 'home' 
    ? 'bg-blue-600 text-white' 
    : 'bg-red-600 text-white';

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-xs font-bold rounded ${venueColor}`}>
            {venueLabel}
          </span>
          {match.competition && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded dark:bg-slate-800 dark:text-slate-300">
              {match.competition}
            </span>
          )}
        </div>
        <CardTitle className="text-2xl">
          vs {match.opponent}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formatDateTime(match.date, 'withWeekday')}</span>
          </div>
          {match.kickoff && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{match.kickoff}</span>
            </div>
          )}
          {match.stadium && (
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.stadium)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {match.stadium}
              </a>
            </div>
          )}
        </div>

        {hasScore && (
          <div className="flex items-center justify-center gap-4 py-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">マリノス</p>
              <p className="text-4xl font-bold">{marinosGoals}</p>
            </div>
            <div className="text-2xl text-muted-foreground">-</div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{match.opponent}</p>
              <p className="text-4xl font-bold">{opponentGoals}</p>
            </div>
            {resultInfo && (
              <span className={`ml-4 px-3 py-1 text-lg font-bold rounded-full border ${resultInfo.color}`}>
                {resultInfo.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
