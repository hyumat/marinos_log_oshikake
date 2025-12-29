/**
 * tRPC router for match-related operations
 */

import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { upsertMatches, getMatches } from '../db';
import { getSampleMatches } from '../test-data';
import { scrapeAllMatches } from '../unified-scraper';



export const matchesRouter = router({
  /**
   * Fetch official matches from multiple sources and save to database
   */
  fetchOfficial: protectedProcedure
    .input(
      z.object({
        force: z.boolean().default(false).optional(),
        year: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log('[Matches Router] Starting official match fetch...');
        
        // Fetch from unified scraper (Jリーグ公式 + Phew)
        const { fixtures, results, upcoming, counts } = await scrapeAllMatches();
        
        console.log(`[Matches Router] Got ${fixtures.length} total matches`);
        
        if (fixtures.length > 0) {
          // Convert to database format
          const dbMatches = fixtures.map(f => ({
            sourceKey: `${f.date}-${f.opponent || f.away}`,
            date: f.date,
            kickoff: f.kickoff,
            competition: f.competition,
            homeTeam: f.home,
            awayTeam: f.away,
            opponent: f.opponent || (f.marinosSide === 'home' ? f.away : f.home),
            stadium: f.stadium,
            marinosSide: f.marinosSide,
            homeScore: f.homeScore,
            awayScore: f.awayScore,
            isResult: f.isResult ? 1 : 0,
            matchUrl: f.matchUrl,
          }));
          
          // Save to database
          await upsertMatches(dbMatches);
          console.log(`[Matches Router] Saved ${dbMatches.length} matches to database`);
        }
        
        return {
          success: true,
          matches: fixtures.length,
          results: results.length,
          upcoming: upcoming.length,
          stats: counts,
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
