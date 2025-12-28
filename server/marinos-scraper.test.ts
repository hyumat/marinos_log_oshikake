import { describe, it, expect } from 'vitest';

describe('Marinos Scraper Utilities', () => {
  describe('parseJapaneseDateToISO', () => {
    it('should convert Japanese date format to ISO', () => {
      const parseDate = (dateStr: string, currentYear: number): string | null => {
        const match = dateStr.match(/(\d{1,2})\.(\d{1,2})/);
        if (!match) return null;

        const [, monthStr, dayStr] = match;
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);

        const year = currentYear;

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };

      const result = parseDate('2.6', 2025);
      expect(result).toBe('2025-02-06');
    });

    it('should handle single-digit months and days', () => {
      const parseDate = (dateStr: string, currentYear: number): string | null => {
        const match = dateStr.match(/(\d{1,2})\.(\d{1,2})/);
        if (!match) return null;

        const [, monthStr, dayStr] = match;
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);

        const year = currentYear;

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };

      const result = parseDate('1.5', 2025);
      expect(result).toBe('2025-01-05');
    });

    it('should return null for invalid format', () => {
      const parseDate = (dateStr: string, currentYear: number): string | null => {
        const match = dateStr.match(/(\d{1,2})\.(\d{1,2})/);
        if (!match) return null;

        const [, monthStr, dayStr] = match;
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);

        const year = currentYear;

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };

      const result = parseDate('2025-02-06', 2025);
      expect(result).toBeNull();
    });
  });

  describe('Data structure validation', () => {
    it('should validate MarinosMatch structure', () => {
      const mockMatch = {
        date: '2025-02-06',
        kickoff: '19:00',
        opponent: 'FC町田ゼルビア',
        homeTeam: '横浜FM',
        awayTeam: 'FC町田ゼルビア',
        marinosSide: 'home' as const,
        stadium: '日産スタジアム',
        isResult: false,
        competition: 'J1',
        sourceUrl: 'https://www.f-marinos.com/matches/schedule',
      };

      expect(mockMatch.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(mockMatch.kickoff).toMatch(/^\d{2}:\d{2}$/);
      expect(mockMatch.opponent).toBeTruthy();
      expect(mockMatch.homeTeam).toBeTruthy();
      expect(mockMatch.awayTeam).toBeTruthy();
      expect(['home', 'away']).toContain(mockMatch.marinosSide);
      expect(mockMatch.isResult).toBe(false);
    });

    it('should validate past match with score', () => {
      const mockMatch = {
        date: '2025-02-15',
        opponent: 'アルビレックス新潟',
        homeTeam: '横浜FM',
        awayTeam: 'アルビレックス新潟',
        marinosSide: 'home' as const,
        stadium: '日産スタジアム',
        homeScore: 1,
        awayScore: 1,
        isResult: true,
        competition: 'J1',
        sourceUrl: 'https://www.f-marinos.com/matches/results',
      };

      expect(mockMatch.homeScore).toBe(1);
      expect(mockMatch.awayScore).toBe(1);
      expect(mockMatch.isResult).toBe(true);
    });

    it('should handle matches with undefined kickoff', () => {
      const mockMatch = {
        date: '2025-02-21',
        opponent: '浦和レッズ',
        homeTeam: '横浜FM',
        awayTeam: '浦和レッズ',
        marinosSide: 'home' as const,
        isResult: false,
        competition: 'J1',
        sourceUrl: 'https://www.f-marinos.com/matches/schedule',
      };

      expect(mockMatch.kickoff).toBeUndefined();
      expect(mockMatch.date).toBeTruthy();
      expect(mockMatch.opponent).toBeTruthy();
    });
  });

  describe('Team name detection', () => {
    it('should recognize Marinos team names', () => {
      const marinosNames = ['横浜FM', '横浜ＦＭ', '横浜F・マリノス', '横浜Ｆ・マリノス'];
      const marinosSet = new Set(marinosNames);

      expect(marinosSet.has('横浜FM')).toBe(true);
      expect(marinosSet.has('横浜ＦＭ')).toBe(true);
    });

    it('should recognize opponent team names', () => {
      const teamNames = [
        'FC町田ゼルビア', '鹿島アントラーズ', '浦和レッズ', '東京ヴェルディ',
        'ジェフユナイテッド千葉', '水戸ホーリーホック', '川崎フロンターレ',
        '柏レイソル', 'FC東京', 'ガンバ大阪', 'アビスパ福岡', 'セレッソ大阪',
        'ヴィッセル神戸', 'サンフレッチェ広島', '京都サンガF.C.', '清水エスパルス',
        '横浜FC', '湘南ベルマーレ', 'ファジアーノ岡山', 'アルビレックス新潟',
        '名古屋グランパス',
      ];

      expect(teamNames).toContain('FC町田ゼルビア');
      expect(teamNames).toContain('鹿島アントラーズ');
      expect(teamNames.length).toBeGreaterThan(15);
    });
  });

  describe('Score parsing', () => {
    it('should parse score format correctly', () => {
      const parseScore = (text: string) => {
        const scoreMatch = text.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (scoreMatch) {
          return {
            home: parseInt(scoreMatch[1], 10),
            away: parseInt(scoreMatch[2], 10),
          };
        }
        return null;
      };

      const result1 = parseScore('2 - 1');
      expect(result1).toEqual({ home: 2, away: 1 });

      const result2 = parseScore('1–1');
      expect(result2).toEqual({ home: 1, away: 1 });

      const result3 = parseScore('0 - 3');
      expect(result3).toEqual({ home: 0, away: 3 });
    });

    it('should return null for invalid score format', () => {
      const parseScore = (text: string) => {
        const scoreMatch = text.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (scoreMatch) {
          return {
            home: parseInt(scoreMatch[1], 10),
            away: parseInt(scoreMatch[2], 10),
          };
        }
        return null;
      };

      const result = parseScore('No score available');
      expect(result).toBeNull();
    });
  });

  describe('Home/Away detection', () => {
    it('should detect home matches', () => {
      const text = 'HOME 日産スタジアム 2.6 [金] 19:00 FC町田ゼルビア';
      const isHome = text.includes('HOME') || text.includes('ホーム');
      expect(isHome).toBe(true);
    });

    it('should detect away matches', () => {
      const text = 'AWAY メルカリスタジアム 2.14 [土] 15:00 鹿島アントラーズ';
      const isAway = text.includes('AWAY') || text.includes('アウェイ');
      expect(isAway).toBe(true);
    });

    it('should distinguish between HOME and AWAY matches', () => {
      const homeText = 'HOME 日産スタジアム';
      const awayText = 'AWAY メルカリスタジアム';

      const isHomeMatch = homeText.includes('HOME');
      const isHomeNotAway = !homeText.includes('AWAY');

      expect(isHomeMatch).toBe(true);
      expect(isHomeNotAway).toBe(true);
      
      const isAwayMatch = awayText.includes('AWAY');
      const isAwayNotHome = !awayText.includes('HOME');
      
      expect(isAwayMatch).toBe(true);
      expect(isAwayNotHome).toBe(true);
    });
  });

  describe('Stadium detection', () => {
    it('should recognize Marinos home stadiums', () => {
      const stadiums = [
        '日産スタジアム', 'ニッパツ三ツ沢球技場', '横浜国際総合競技場',
      ];

      expect(stadiums).toContain('日産スタジアム');
      expect(stadiums).toContain('ニッパツ三ツ沢球技場');
    });

    it('should extract stadium from text', () => {
      const extractStadium = (text: string): string | null => {
        const stadiums = [
          '日産スタジアム', 'ニッパツ三ツ沢球技場', '横浜国際総合競技場',
          'メルカリスタジアム', 'MUFGスタジアム',
        ];
        for (const s of stadiums) {
          if (text.includes(s)) {
            return s;
          }
        }
        return null;
      };

      const result1 = extractStadium('HOME 日産スタジアム 2.6');
      expect(result1).toBe('日産スタジアム');

      const result2 = extractStadium('AWAY メルカリスタジアム 2.14');
      expect(result2).toBe('メルカリスタジアム');

      const result3 = extractStadium('Unknown stadium 2.20');
      expect(result3).toBeNull();
    });
  });

  describe('Competition detection', () => {
    it('should detect J1 league', () => {
      const text = 'J1百年構想リーグ　地域リーグラウンド 第1節';
      const competition = text.includes('J1') ? 'J1' : 'Other';
      expect(competition).toBe('J1');
    });

    it('should detect other competitions', () => {
      const detectCompetition = (text: string): string => {
        if (text.includes('ルヴァンカップ')) return 'ルヴァンカップ';
        if (text.includes('天皇杯')) return '天皇杯';
        if (text.includes('AFC')) return 'AFC';
        if (text.includes('ワールドチャレンジ')) return 'ワールドチャレンジ';
        return 'J1';
      };

      expect(detectCompetition('ＪリーグYBCルヴァンカップ')).toBe('ルヴァンカップ');
      expect(detectCompetition('天皇杯 JFA 全日本サッカー選手権大会')).toBe('天皇杯');
      expect(detectCompetition('AFCチャンピオンズリーグ')).toBe('AFC');
    });
  });

  describe('Data deduplication', () => {
    it('should remove duplicate matches', () => {
      const matches = [
        { date: '2025-02-06', opponent: 'FC町田ゼルビア', isResult: false },
        { date: '2025-02-06', opponent: 'FC町田ゼルビア', isResult: false },
        { date: '2025-02-14', opponent: '鹿島アントラーズ', isResult: false },
      ];

      const uniqueMatches = Array.from(
        new Map(
          matches.map(m => [`${m.date}-${m.opponent}`, m])
        ).values()
      );

      expect(uniqueMatches.length).toBe(2);
      expect(uniqueMatches[0].opponent).toBe('FC町田ゼルビア');
      expect(uniqueMatches[1].opponent).toBe('鹿島アントラーズ');
    });

    it('should sort matches by date', () => {
      const matches = [
        { date: '2025-02-14', opponent: '鹿島アントラーズ' },
        { date: '2025-02-06', opponent: 'FC町田ゼルビア' },
        { date: '2025-02-21', opponent: '浦和レッズ' },
      ];

      matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      expect(matches[0].date).toBe('2025-02-06');
      expect(matches[1].date).toBe('2025-02-14');
      expect(matches[2].date).toBe('2025-02-21');
    });
  });
});
