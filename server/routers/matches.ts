/**
 * tRPC router for match-related operations
 */

import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { upsertMatches, getMatches } from '../db';
import { getSampleMatches } from '../test-data';
import { scrapeAllMarinosMatches } from '../marinos-scraper';
import { scrapeAllMarinosMatchesPuppeteer } from '../marinos-scraper-puppeteer';
import { scrapeJLeagueMatches } from '../jleague-scraper';

/**
 * Merge and deduplicate matches from multiple sources
 */
function mergeMatches(
  marinosMatches: any[] = [],
  jleagueMatches: any[] = [],
  testMatches: any[] = []
) {
  const allMatches = [...marinosMatches, ...jleagueMatches, ...testMatches];
  
  // Create a map to deduplicate by date + opponent
  const matchMap = new Map<string, any>();
  
  for (const match of allMatches) {
    const key = `${match.date}-${match.opponent}`;
    
    // If we already have this match, prefer the one with more data
    if (matchMap.has(key)) {
      const existing = matchMap.get(key);
      const newMatch = {
        ...existing,
        ...match,
        // Prefer non-undefined values
        homeScore: match.homeScore !== undefined ? match.homeScore : existing.homeScore,
        awayScore: match.awayScore !== undefined ? match.awayScore : existing.awayScore,
        stadium: match.stadium || existing.stadium,
        kickoff: match.kickoff || existing.kickoff,
      };
      matchMap.set(key, newMatch);
    } else {
      matchMap.set(key, match);
    }
  }
  
  // Convert back to array and sort by date
  const merged = Array.from(matchMap.values());
  merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return merged;
}

export const matchesRouter = router({
  /**
   * Fetch official matches from multiple sources and save to database
   */
  fetchOfficial: protectedProcedure
    .input(
      z.object({
        force: z.boolean().default(false).optional(),
        year: z.number().optional(),
        source: z.enum(['marinos', 'jleague', 'all']).default('all').optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log('[Matches Router] Starting official match fetch...');
        
        const results = {
          marinosMatches: [] as any[],
          jleagueMatches: [] as any[],
          testMatches: [] as any[],
          errors: [] as any[],
          stats: { total: 0, success: 0, failed: 0 },
        };
        
        // Fetch from Marinos official site (try Puppeteer first, fallback to Cheerio)
        if (input.source === 'all' || input.source === 'marinos') {
          try {
            console.log('[Matches Router] Fetching from Marinos official site (Puppeteer)...');
            const marinosResult = await scrapeAllMarinosMatchesPuppeteer();
            results.marinosMatches = marinosResult.matches;
            results.errors.push(...marinosResult.errors);
            console.log(`[Matches Router] Got ${marinosResult.matches.length} matches from Marinos (Puppeteer)`);
            
            // If Puppeteer fails, try Cheerio
            if (marinosResult.matches.length === 0 && marinosResult.errors.length > 0) {
              console.log('[Matches Router] Puppeteer failed, trying Cheerio fallback...');
              const cheerioResult = await scrapeAllMarinosMatches();
              results.marinosMatches = cheerioResult.matches;
              results.errors = results.errors.filter(e => e.source !== 'marinos');
              results.errors.push(...cheerioResult.errors);
              console.log(`[Matches Router] Got ${cheerioResult.matches.length} matches from Marinos (Cheerio fallback)`);
            }
          } catch (error) {
            console.error('[Matches Router] Error fetching from Marinos:', error);
            results.errors.push({
              source: 'marinos',
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
            });
          }
        }
        
        // Fetch from J-League official site
        if (input.source === 'all' || input.source === 'jleague') {
          try {
            console.log('[Matches Router] Fetching from J-League official site...');
            const jleagueResult = await scrapeJLeagueMatches();
            results.jleagueMatches = jleagueResult.matches;
            results.errors.push(...jleagueResult.errors);
            console.log(`[Matches Router] Got ${jleagueResult.matches.length} matches from J-League`);
          } catch (error) {
            console.error('[Matches Router] Error fetching from J-League:', error);
            results.errors.push({
              source: 'jleague',
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
            });
          }
        }
        
        // Use test data as fallback
        const testMatches = getSampleMatches();
        results.testMatches = testMatches;
        console.log(`[Matches Router] Using ${testMatches.length} test matches as fallback`);
        
        // Merge all matches
        const mergedMatches = mergeMatches(
          results.marinosMatches,
          results.jleagueMatches,
          results.testMatches
        );
        
        console.log(`[Matches Router] Merged to ${mergedMatches.length} unique matches`);
        
        if (mergedMatches.length > 0) {
          // Convert to database format
          const dbMatches = mergedMatches.map(m => ({
            sourceKey: `${m.date}-${m.opponent}`,
            date: m.date,
            kickoff: m.kickoff,
            competition: m.competition,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            opponent: m.opponent,
            stadium: m.stadium,
            marinosSide: m.marinosSide,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            isResult: m.isResult ? 1 : 0,
            matchUrl: m.sourceUrl,
          }));
          
          // Save to database
          await upsertMatches(dbMatches);
          console.log(`[Matches Router] Saved ${dbMatches.length} matches to database`);
        }
        
        results.stats = {
          total: mergedMatches.length,
          success: mergedMatches.length,
          failed: results.errors.length,
        };
        
        return {
          success: true,
          matches: mergedMatches.length,
          sources: {
            marinos: results.marinosMatches.length,
            jleague: results.jleagueMatches.length,
            test: results.testMatches.length,
          },
          errors: results.errors.length,
          stats: results.stats,
        };
        
      } catch (error) {
        console.error('[Matches Router] Error fetching official matches:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to fetch official matches'
        );
      }
    }),

  /**
   * Get all official matches from database
   */
  listOfficial: publicProcedure
    .input(
      z.object({
        year: z.number().optional(),
        competition: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // First try to get from database
        const dbMatches = await getMatches({
          year: input.year,
          competition: input.competition,
        });
        
        // If no matches in database, use test data
        if (dbMatches.length === 0) {
          console.log('[Matches Router] No matches in database, using test data');
          const testMatches = getSampleMatches();
          return {
            success: true,
            matches: testMatches as any,
            count: testMatches.length,
          };
        }
        
        return {
          success: true,
          matches: dbMatches,
          count: dbMatches.length,
        };
        
      } catch (error) {
        console.error('[Matches Router] Error listing matches:', error);
        // Return test data as fallback
        const testMatches = getSampleMatches();
        return {
          success: true,
          matches: testMatches as any,
          count: testMatches.length,
        };
      }
    }),

  /**
   * Get a single match by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        // TODO: Implement when we have the database query
        return {
          success: false,
          message: 'Not implemented yet',
        };
      } catch (error) {
        throw new Error('Failed to get match');
      }
    }),
});
