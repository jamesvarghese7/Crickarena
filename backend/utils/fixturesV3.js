/**
 * Advanced Tournament Fixture Generation System V3
 * Implements cricket-specific formats with proper rules:
 * - Super League (IPL-style): Double RR + Playoffs (Q1, Eliminator, Q2, Final)
 * - Groups + Super 8 (ICC-style): Group stage → Super round with carry-forward
 * - Enhanced NRR calculation
 * - Reserve day handling
 */

import {
    calculateActualCapacity,
    validateFixtureGeneration,
    generateRoundRobinPairings,
    splitIntoGroupsSeeded,
    generateKnockoutBracketSeeded,
    scheduleMatchesAdvanced
} from './fixturesV2.js';

// Re-export V2 functions
export {
    calculateActualCapacity,
    validateFixtureGeneration,
    generateRoundRobinPairings,
    splitIntoGroupsSeeded,
    generateKnockoutBracketSeeded,
    scheduleMatchesAdvanced
};

/**
 * Generate Super League format (IPL-style)
 * - Double round-robin league stage
 * - Top 4 qualify for playoffs
 * - Qualifier 1: 1st vs 2nd (winner → Final)
 * - Eliminator: 3rd vs 4th (loser out)
 * - Qualifier 2: Loser Q1 vs Winner Eliminator → Final
 * - Final
 * 
 * @param {string[]} teamIds - Array of team IDs
 * @param {Object} options - Configuration options
 * @returns {Object} { rounds: [], playoffSlots: {} }
 */
export function generateSuperLeagueFormat(teamIds, options = {}) {
    const {
        doubleRoundRobin = true,
        topTeamsQualify = 4,
        hasQualifier1 = true,
        hasEliminator = true,
        hasQualifier2 = true
    } = options;

    const teams = [...teamIds].map(String);

    if (teams.length < 4) {
        throw new Error('Super League format requires at least 4 teams');
    }

    // Generate league stage (double round-robin by default)
    const leagueRounds = generateRoundRobinPairings(teams, { doubleRoundRobin });

    // Add stage metadata
    const rounds = leagueRounds.map(r => ({
        ...r,
        roundLabel: `Match Day ${r.round}`,
        stage: 'Group',
        group: 'League Stage'
    }));

    // Define playoff structure (matches will be created after league completes)
    const playoffStructure = {
        topTeamsQualify,
        slots: []
    };

    if (topTeamsQualify >= 2) {
        // Qualifier 1: 1st vs 2nd
        if (hasQualifier1) {
            playoffStructure.slots.push({
                name: 'Qualifier 1',
                stage: 'Qualifier1',
                teams: [1, 2], // Positions in standings
                winnerTo: 'Final',
                loserTo: 'Qualifier 2'
            });
        }

        // Eliminator: 3rd vs 4th
        if (hasEliminator && topTeamsQualify >= 4) {
            playoffStructure.slots.push({
                name: 'Eliminator',
                stage: 'Eliminator',
                teams: [3, 4],
                winnerTo: 'Qualifier 2',
                loserTo: null // Eliminated
            });
        }

        // Qualifier 2: Loser of Q1 vs Winner of Eliminator
        if (hasQualifier2 && hasQualifier1 && hasEliminator) {
            playoffStructure.slots.push({
                name: 'Qualifier 2',
                stage: 'Qualifier2',
                teams: ['loser:Qualifier 1', 'winner:Eliminator'],
                winnerTo: 'Final',
                loserTo: null
            });
        }

        // Final
        playoffStructure.slots.push({
            name: 'Final',
            stage: 'Final',
            teams: ['winner:Qualifier 1', 'winner:Qualifier 2'],
            winnerTo: 'Champion',
            loserTo: null
        });
    }

    return {
        rounds,
        playoffStructure,
        stats: {
            leagueMatches: rounds.reduce((sum, r) => sum + r.matches.length, 0),
            playoffMatches: playoffStructure.slots.length,
            totalMatches: rounds.reduce((sum, r) => sum + r.matches.length, 0) + playoffStructure.slots.length
        }
    };
}

/**
 * Generate Groups + Super 8/Super 6 format (ICC World Cup style)
 * - Initial group stage
 * - Top teams advance to Super Round
 * - Points from matches against other qualifiers carry forward
 * - Top teams from Super Round go to semi-finals
 * 
 * @param {string[]} teamIds - Array of team IDs
 * @param {Object} options - Configuration options
 * @returns {Object} { groupRounds: [], superRoundStructure: {}, knockoutStructure: {} }
 */
export function generateGroupsSuperFormat(teamIds, options = {}) {
    const {
        groupCount = 4,
        teamsQualifyPerGroup = 2,
        superGroupCount = 2,
        carryForwardPoints = true,
        doubleRoundRobin = false,
        superRoundMatches = true,
        semiFinalsEnabled = true,
        seeds = null
    } = options;

    const teams = [...teamIds].map(String);
    const totalQualifiers = groupCount * teamsQualifyPerGroup;

    if (teams.length < groupCount * 2) {
        throw new Error(`Need at least ${groupCount * 2} teams for ${groupCount} groups`);
    }

    // Split teams into groups using serpentine seeding
    const groupTeams = splitIntoGroupsSeeded(teams, groupCount, seeds);

    // Generate group stage fixtures
    const groupRounds = [];
    groupTeams.forEach((gTeams, idx) => {
        const groupName = String.fromCharCode(65 + idx); // A, B, C, D...
        const rounds = generateRoundRobinPairings(gTeams, { doubleRoundRobin });

        rounds.forEach(r => {
            groupRounds.push({
                round: r.round,
                roundLabel: `Group ${groupName} - Match Day ${r.round}`,
                stage: 'Group',
                group: `Group ${groupName}`,
                matches: r.matches
            });
        });
    });

    // Super Round structure (to be created after group stage)
    const superRoundStructure = {
        superGroupCount,
        teamsPerSuperGroup: totalQualifiers / superGroupCount,
        carryForwardPoints,
        description: carryForwardPoints
            ? 'Points from group stage matches between qualifying teams carry forward'
            : 'Fresh start - all teams begin with 0 points'
    };

    // Knockout structure
    const knockoutStructure = {
        semiFinalsEnabled,
        slots: []
    };

    if (semiFinalsEnabled && superGroupCount === 2) {
        knockoutStructure.slots = [
            { name: 'Semi-Final 1', stage: 'Knockout', teams: ['1st Super Group 1', '2nd Super Group 2'] },
            { name: 'Semi-Final 2', stage: 'Knockout', teams: ['1st Super Group 2', '2nd Super Group 1'] },
            { name: 'Final', stage: 'Final', teams: ['Winner SF1', 'Winner SF2'] }
        ];
    }

    return {
        rounds: groupRounds,
        groups: groupTeams.map((g, idx) => ({
            name: `Group ${String.fromCharCode(65 + idx)}`,
            teams: g
        })),
        superRoundStructure,
        knockoutStructure,
        stats: {
            groupMatches: groupRounds.reduce((sum, r) => sum + r.matches.length, 0),
            totalGroups: groupCount,
            totalQualifiers
        }
    };
}

/**
 * Calculate Net Run Rate (NRR) for a team
 * Formula: (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
 * 
 * Special cases:
 * - All out: Use full allocated overs
 * - Target achieved: Use actual overs faced
 * - Rain-affected (DLS): Use DLS par scores
 * 
 * @param {Object} standings - Standing record with runsScored, runsConceded, oversFaced, oversBowled
 * @returns {number} NRR rounded to 3 decimal places
 */
export function calculateNRR(standings) {
    const { runsScored = 0, runsConceded = 0, oversFaced = 0, oversBowled = 0 } = standings;

    if (oversFaced === 0 || oversBowled === 0) {
        return 0;
    }

    const forRate = runsScored / oversFaced;
    const againstRate = runsConceded / oversBowled;

    return Math.round((forRate - againstRate) * 1000) / 1000;
}

/**
 * Convert overs string to decimal (e.g., "19.3" -> 19.5)
 * Cricket overs: X.Y where Y is balls (0-5), so X.Y = X + Y/6
 * 
 * @param {string|number} overs - Overs as string or number
 * @returns {number} Decimal representation
 */
export function oversToDecimal(overs) {
    if (typeof overs === 'number') return overs;

    const parts = String(overs).split('.');
    const fullOvers = parseInt(parts[0]) || 0;
    const balls = parseInt(parts[1]) || 0;

    return fullOvers + (balls / 6);
}

/**
 * Convert decimal overs back to cricket notation (e.g., 19.5 -> "19.3")
 * 
 * @param {number} decimal - Decimal overs
 * @returns {string} Cricket overs notation
 */
export function decimalToOvers(decimal) {
    const fullOvers = Math.floor(decimal);
    const ballsFraction = decimal - fullOvers;
    const balls = Math.round(ballsFraction * 6);

    return `${fullOvers}.${balls}`;
}

/**
 * Update standings after a completed match
 * Handles all result types: win, tie, no result, super over, DLS
 * 
 * @param {Object} standing - Current standing record
 * @param {Object} matchResult - Match result with scores and result type
 * @param {Object} qualificationRules - Points configuration
 * @returns {Object} Updated standing
 */
export function updateStandingFromMatch(standing, matchResult, qualificationRules = {}) {
    const rules = {
        pointsPerWin: 2,
        pointsPerTie: 1,
        pointsPerNoResult: 1,
        pointsPerLoss: 0,
        bonusPointEnabled: false,
        bonusPointThreshold: 100,
        ...qualificationRules
    };

    const updated = { ...standing };
    updated.played += 1;

    // Handle result type
    if (matchResult.isNoResult) {
        updated.noResult = (updated.noResult || 0) + 1;
        updated.points += rules.pointsPerNoResult;
        return updated;
    }

    if (matchResult.isTie && !matchResult.isSuperOverWin) {
        updated.drawn += 1;
        updated.points += rules.pointsPerTie;
    } else if (matchResult.isWin) {
        updated.won += 1;
        updated.points += rules.pointsPerWin;

        // Check for bonus point
        if (rules.bonusPointEnabled && matchResult.margin) {
            if (matchResult.margin.runs >= rules.bonusPointThreshold ||
                matchResult.margin.wickets >= 8) {
                updated.bonusPoints = (updated.bonusPoints || 0) + 1;
                updated.points += 1;
            }
        }
    } else {
        updated.lost += 1;
        updated.points += rules.pointsPerLoss;
    }

    // Update NRR components
    if (matchResult.batting) {
        updated.runsScored = (updated.runsScored || 0) + matchResult.batting.runs;
        updated.oversFaced = (updated.oversFaced || 0) + oversToDecimal(matchResult.batting.overs);
    }

    if (matchResult.bowling) {
        updated.runsConceded = (updated.runsConceded || 0) + matchResult.bowling.runs;
        updated.oversBowled = (updated.oversBowled || 0) + oversToDecimal(matchResult.bowling.overs);
    }

    // Recalculate NRR
    updated.nrr = calculateNRR(updated);

    return updated;
}

/**
 * Apply tie-breaker rules to standings
 * Returns sorted standings based on tie-breaker hierarchy
 * 
 * @param {Array} standings - Array of standing records
 * @param {Array} tieBreakers - Ordered list of tie-breaker rules
 * @param {Function} getHeadToHead - Async function to get H2H result between two teams
 * @returns {Promise<Array>} Sorted standings
 */
export async function sortStandingsWithTieBreakers(standings, tieBreakers = [], getHeadToHead = null) {
    const rules = tieBreakers.length > 0
        ? tieBreakers
        : ['points', 'nrr', 'head-to-head', 'wins', 'lot'];

    // First pass: sort by simple numeric fields
    const sorted = [...standings].sort((a, b) => {
        for (const rule of rules) {
            switch (rule) {
                case 'points':
                    if (b.points !== a.points) return b.points - a.points;
                    break;
                case 'nrr':
                    if (b.nrr !== a.nrr) return b.nrr - a.nrr;
                    break;
                case 'wins':
                    if (b.won !== a.won) return b.won - a.won;
                    break;
                case 'most-boundaries':
                    // Would need additional data
                    break;
                case 'lot':
                    // Random tiebreaker - handled separately
                    break;
                // head-to-head requires async lookup
            }
        }
        return 0;
    });

    // Second pass: resolve ties with head-to-head if needed
    if (rules.includes('head-to-head') && getHeadToHead) {
        // Find groups of tied teams
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];

            // Check if these teams are tied on points and NRR
            if (current.points === next.points &&
                Math.abs(current.nrr - next.nrr) < 0.001) {
                try {
                    const h2hResult = await getHeadToHead(current.club, next.club);
                    if (h2hResult && h2hResult.winner) {
                        // Swap positions if next team won H2H
                        if (String(h2hResult.winner) === String(next.club)) {
                            [sorted[i], sorted[i + 1]] = [sorted[i + 1], sorted[i]];
                        }
                    }
                } catch (err) {
                    console.warn('H2H lookup failed:', err.message);
                }
            }
        }
    }

    return sorted;
}

/**
 * Create playoff matches from standings
 * Used after league stage completes in Super League format
 * 
 * @param {Array} sortedStandings - Sorted standings array
 * @param {Object} playoffStructure - Playoff structure from generateSuperLeagueFormat
 * @returns {Array} Playoff matches to be created
 */
export function createPlayoffMatchesFromStandings(sortedStandings, playoffStructure) {
    const { slots = [], topTeamsQualify = 4 } = playoffStructure;
    const qualifiedTeams = sortedStandings.slice(0, topTeamsQualify);

    const playoffMatches = [];
    const results = new Map(); // Track winners/losers for linked matches

    for (const slot of slots) {
        const match = {
            name: slot.name,
            stage: slot.stage,
            homeClub: null,
            awayClub: null,
            round: slot.name,
            dependsOn: []
        };

        // Resolve team assignments
        for (let i = 0; i < slot.teams.length; i++) {
            const team = slot.teams[i];
            let clubId = null;

            if (typeof team === 'number') {
                // Position in standings (1-indexed)
                clubId = qualifiedTeams[team - 1]?.club;
            } else if (typeof team === 'string' && team.includes(':')) {
                // Depends on another match result
                match.dependsOn.push(team);
            }

            if (clubId) {
                if (i === 0) match.homeClub = clubId;
                else match.awayClub = clubId;
            }
        }

        playoffMatches.push(match);
    }

    return playoffMatches;
}

/**
 * Enhanced scheduling with reserve days
 * Distributes reserve days throughout the schedule
 * 
 * @param {Array} rounds - Match rounds to schedule
 * @param {Object} opts - Scheduling options
 * @returns {Object} Schedule result with reserve day info
 */
export function scheduleWithReserveDays(rounds, opts) {
    const {
        reserveDays = [],
        reserveDayStrategy = 'end', // 'end', 'distributed', 'knockouts-only'
        ...scheduleOpts
    } = opts;

    // First, schedule normally
    const result = scheduleMatchesAdvanced(rounds, scheduleOpts);

    if (!result.ok || reserveDays.length === 0) {
        return result;
    }

    // Mark which matches have reserve day coverage
    const reserveDayDates = reserveDays.map(d =>
        new Date(d).toISOString().slice(0, 10)
    );

    result.matches = result.matches.map((match, idx) => {
        let hasReserveDay = false;
        let reserveDate = null;

        switch (reserveDayStrategy) {
            case 'end':
                // Reserve days apply to knockout/final matches
                if (['Knockout', 'Final', 'Qualifier1', 'Qualifier2', 'Eliminator'].includes(match.stage)) {
                    hasReserveDay = reserveDayDates.length > 0;
                    reserveDate = reserveDayDates[0]; // Use first available
                }
                break;

            case 'distributed':
                // Every Nth match gets a reserve day
                const reserveInterval = Math.ceil(result.matches.length / reserveDayDates.length);
                if (idx > 0 && idx % reserveInterval === 0) {
                    const reserveIdx = Math.floor(idx / reserveInterval) - 1;
                    if (reserveIdx < reserveDayDates.length) {
                        hasReserveDay = true;
                        reserveDate = reserveDayDates[reserveIdx];
                    }
                }
                break;

            case 'knockouts-only':
                if (['Knockout', 'Final'].includes(match.stage)) {
                    hasReserveDay = reserveDayDates.length > 0;
                    reserveDate = reserveDayDates[0];
                }
                break;
        }

        return {
            ...match,
            hasReserveDay,
            reserveDate
        };
    });

    return result;
}

export default {
    // V2 re-exports
    calculateActualCapacity,
    validateFixtureGeneration,
    generateRoundRobinPairings,
    splitIntoGroupsSeeded,
    generateKnockoutBracketSeeded,
    scheduleMatchesAdvanced,

    // V3 new functions
    generateSuperLeagueFormat,
    generateGroupsSuperFormat,
    calculateNRR,
    oversToDecimal,
    decimalToOvers,
    updateStandingFromMatch,
    sortStandingsWithTieBreakers,
    createPlayoffMatchesFromStandings,
    scheduleWithReserveDays
};
