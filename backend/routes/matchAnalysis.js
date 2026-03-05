import express from 'express';
import Match from '../models/Match.js';
import Player from '../models/Player.js';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseToken);

/**
 * GET /api/match-analysis/my-matches
 * Get all matches where the logged-in player participated
 */
router.get('/my-matches', async (req, res) => {
    try {
        // Get player profile
        const player = await Player.findOne({ user: req.user._id }).populate('currentClub');
        if (!player) {
            return res.status(404).json({ message: 'Player profile not found' });
        }

        const playerName = player.fullName;

        // Find matches where player appears in batting or bowling card
        const matches = await Match.find({
            $or: [
                { 'innings.battingCard.playerName': playerName },
                { 'innings.bowlingCard.bowlerName': playerName },
                { 'homeClubRoster.players.playerId': player._id },
                { 'awayClubRoster.players.playerId': player._id }
            ],
            status: { $in: ['Completed', 'Live'] }
        })
            .populate('homeClub', 'clubName name district')
            .populate('awayClub', 'clubName name district')
            .populate('tournament', 'name')
            .sort({ date: -1 })
            .limit(50);

        // Extract player's performance from each match
        const matchesWithStats = matches.map(match => {
            const matchObj = match.toObject();

            // Find player's batting performance
            let battingPerformance = null;
            let bowlingPerformance = null;

            for (const innings of matchObj.innings || []) {
                // Check batting card
                const battingEntry = innings.battingCard?.find(
                    entry => entry.playerName?.toLowerCase() === playerName.toLowerCase()
                );
                if (battingEntry) {
                    battingPerformance = {
                        runs: battingEntry.runs || 0,
                        balls: battingEntry.balls || 0,
                        fours: battingEntry.fours || 0,
                        sixes: battingEntry.sixes || 0,
                        strikeRate: battingEntry.strikeRate || 0,
                        dismissal: battingEntry.dismissal?.how || 'not out'
                    };
                }

                // Check bowling card
                const bowlingEntry = innings.bowlingCard?.find(
                    entry => entry.bowlerName?.toLowerCase() === playerName.toLowerCase()
                );
                if (bowlingEntry) {
                    bowlingPerformance = {
                        overs: Math.floor(bowlingEntry.balls / 6) + '.' + (bowlingEntry.balls % 6),
                        balls: bowlingEntry.balls || 0,
                        maidens: bowlingEntry.maidens || 0,
                        runs: bowlingEntry.runs || 0,
                        wickets: bowlingEntry.wickets || 0,
                        economy: bowlingEntry.economy || 0
                    };
                }
            }

            return {
                _id: matchObj._id,
                date: matchObj.date,
                venue: matchObj.venue,
                tournament: matchObj.tournament,
                homeClub: matchObj.homeClub,
                awayClub: matchObj.awayClub,
                result: matchObj.result,
                status: matchObj.status,
                matchFormat: matchObj.matchFormat,
                stage: matchObj.stage,
                round: matchObj.round,
                batting: battingPerformance,
                bowling: bowlingPerformance,
                isManOfMatch: matchObj.summary?.playerOfTheMatch?.toLowerCase() === playerName.toLowerCase()
            };
        });

        res.json({
            matches: matchesWithStats,
            total: matchesWithStats.length,
            playerName
        });
    } catch (error) {
        console.error('Error fetching player matches:', error);
        res.status(500).json({ message: 'Error fetching matches', error: error.message });
    }
});

/**
 * GET /api/match-analysis/match/:matchId
 * Get detailed analysis for a specific match
 */
router.get('/match/:matchId', async (req, res) => {
    try {
        const player = await Player.findOne({ user: req.user._id });
        if (!player) {
            return res.status(404).json({ message: 'Player profile not found' });
        }

        const match = await Match.findById(req.params.matchId)
            .populate('homeClub', 'clubName name district city')
            .populate('awayClub', 'clubName name district city')
            .populate('tournament', 'name format')
            .populate('result.winner', 'clubName name');

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const playerName = player.fullName;
        const matchObj = match.toObject();

        // Extract detailed performance
        let battingAnalysis = null;
        let bowlingAnalysis = null;
        let fieldingAnalysis = { catches: 0, runOuts: 0, stumpings: 0 };

        for (const innings of matchObj.innings || []) {
            // Batting analysis
            const battingEntry = innings.battingCard?.find(
                entry => entry.playerName?.toLowerCase() === playerName.toLowerCase()
            );

            if (battingEntry) {
                const runs = battingEntry.runs || 0;
                const balls = battingEntry.balls || 0;
                const fours = battingEntry.fours || 0;
                const sixes = battingEntry.sixes || 0;

                // Calculate additional metrics
                const boundaryRuns = (fours * 4) + (sixes * 6);
                const runningRuns = runs - boundaryRuns;
                const dotBalls = balls - Math.ceil(runs / 1.5); // Approximate

                battingAnalysis = {
                    runs,
                    balls,
                    fours,
                    sixes,
                    strikeRate: balls > 0 ? ((runs / balls) * 100).toFixed(2) : 0,
                    dismissal: battingEntry.dismissal || { how: 'not out' },
                    boundaryRuns,
                    runningRuns: Math.max(0, runningRuns),
                    dotBalls: Math.max(0, dotBalls),
                    boundaryPercentage: runs > 0 ? ((boundaryRuns / runs) * 100).toFixed(1) : 0,
                    // Scoring breakdown for chart
                    scoringBreakdown: {
                        ones: Math.max(0, runningRuns - (runs % 4 === 2 ? 2 : runs % 4 === 3 ? 3 : 0)),
                        twos: 0, // Would need ball-by-ball data
                        threes: 0,
                        fours: fours * 4,
                        sixes: sixes * 6
                    }
                };
            }

            // Bowling analysis
            const bowlingEntry = innings.bowlingCard?.find(
                entry => entry.bowlerName?.toLowerCase() === playerName.toLowerCase()
            );

            if (bowlingEntry) {
                const bowlingBalls = bowlingEntry.balls || 0;
                const overs = Math.floor(bowlingBalls / 6);
                const remainingBalls = bowlingBalls % 6;

                bowlingAnalysis = {
                    overs: `${overs}.${remainingBalls}`,
                    balls: bowlingBalls,
                    maidens: bowlingEntry.maidens || 0,
                    runs: bowlingEntry.runs || 0,
                    wickets: bowlingEntry.wickets || 0,
                    economy: bowlingEntry.economy || (overs > 0 ? (bowlingEntry.runs / overs).toFixed(2) : 0),
                    dotBalls: Math.floor(bowlingBalls * 0.4), // Approximate 40% dots
                    dotBallPercentage: 40 // Approximate
                };
            }

            // Check for fielding contributions in dismissals
            for (const batEntry of innings.battingCard || []) {
                const dismissal = batEntry.dismissal;
                if (!dismissal) continue;

                // Check if player is involved in fielding
                if (dismissal.fielder?.toLowerCase().includes(playerName.toLowerCase())) {
                    if (dismissal.how === 'c' || dismissal.how === 'caught') {
                        fieldingAnalysis.catches++;
                    } else if (dismissal.how === 'run out') {
                        fieldingAnalysis.runOuts++;
                    } else if (dismissal.how === 'st' || dismissal.how === 'stumped') {
                        fieldingAnalysis.stumpings++;
                    }
                }
            }
        }

        // Calculate performance rating (1-10)
        let performanceRating = 5; // Base rating
        if (battingAnalysis) {
            if (battingAnalysis.runs >= 100) performanceRating += 3;
            else if (battingAnalysis.runs >= 50) performanceRating += 2;
            else if (battingAnalysis.runs >= 30) performanceRating += 1;
            if (battingAnalysis.strikeRate > 150) performanceRating += 0.5;
        }
        if (bowlingAnalysis) {
            if (bowlingAnalysis.wickets >= 5) performanceRating += 3;
            else if (bowlingAnalysis.wickets >= 3) performanceRating += 2;
            else if (bowlingAnalysis.wickets >= 2) performanceRating += 1;
            if (bowlingAnalysis.economy < 6) performanceRating += 0.5;
        }
        performanceRating = Math.min(10, performanceRating);

        res.json({
            match: {
                _id: matchObj._id,
                date: matchObj.date,
                time: matchObj.time,
                venue: matchObj.venue,
                tournament: matchObj.tournament,
                homeClub: matchObj.homeClub,
                awayClub: matchObj.awayClub,
                result: matchObj.result,
                status: matchObj.status,
                matchFormat: matchObj.matchFormat,
                stage: matchObj.stage,
                round: matchObj.round,
                toss: matchObj.toss,
                innings: matchObj.innings?.map(inn => ({
                    battingClub: inn.battingClub,
                    runs: inn.runs,
                    wickets: inn.wickets,
                    oversString: inn.oversString
                }))
            },
            playerName,
            batting: battingAnalysis,
            bowling: bowlingAnalysis,
            fielding: fieldingAnalysis,
            performanceRating: performanceRating.toFixed(1),
            isManOfMatch: matchObj.summary?.playerOfTheMatch?.toLowerCase() === playerName.toLowerCase()
        });
    } catch (error) {
        console.error('Error fetching match analysis:', error);
        res.status(500).json({ message: 'Error fetching match analysis', error: error.message });
    }
});

/**
 * GET /api/match-analysis/career-stats
 * Get aggregated career statistics
 */
router.get('/career-stats', async (req, res) => {
    try {
        const player = await Player.findOne({ user: req.user._id });
        if (!player) {
            return res.status(404).json({ message: 'Player profile not found' });
        }

        const playerName = player.fullName;

        // Find all completed matches
        const matches = await Match.find({
            $or: [
                { 'innings.battingCard.playerName': playerName },
                { 'innings.bowlingCard.bowlerName': playerName }
            ],
            status: 'Completed'
        });

        // Aggregate stats
        let totalMatches = matches.length;
        let batting = {
            innings: 0,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            highestScore: 0,
            fifties: 0,
            hundreds: 0,
            notOuts: 0
        };
        let bowling = {
            innings: 0,
            balls: 0,
            runs: 0,
            wickets: 0,
            maidens: 0,
            bestFigures: { wickets: 0, runs: 999 },
            fiveWickets: 0
        };

        for (const match of matches) {
            for (const innings of match.innings || []) {
                // Batting stats
                const battingEntry = innings.battingCard?.find(
                    entry => entry.playerName?.toLowerCase() === playerName.toLowerCase()
                );
                if (battingEntry) {
                    batting.innings++;
                    batting.runs += battingEntry.runs || 0;
                    batting.balls += battingEntry.balls || 0;
                    batting.fours += battingEntry.fours || 0;
                    batting.sixes += battingEntry.sixes || 0;

                    const runs = battingEntry.runs || 0;
                    if (runs > batting.highestScore) batting.highestScore = runs;
                    if (runs >= 100) batting.hundreds++;
                    else if (runs >= 50) batting.fifties++;

                    if (!battingEntry.dismissal?.how || battingEntry.dismissal.how === 'not out') {
                        batting.notOuts++;
                    }
                }

                // Bowling stats
                const bowlingEntry = innings.bowlingCard?.find(
                    entry => entry.bowlerName?.toLowerCase() === playerName.toLowerCase()
                );
                if (bowlingEntry) {
                    bowling.innings++;
                    bowling.balls += bowlingEntry.balls || 0;
                    bowling.runs += bowlingEntry.runs || 0;
                    bowling.wickets += bowlingEntry.wickets || 0;
                    bowling.maidens += bowlingEntry.maidens || 0;

                    const wickets = bowlingEntry.wickets || 0;
                    const runs = bowlingEntry.runs || 0;
                    if (wickets >= 5) bowling.fiveWickets++;
                    if (wickets > bowling.bestFigures.wickets ||
                        (wickets === bowling.bestFigures.wickets && runs < bowling.bestFigures.runs)) {
                        bowling.bestFigures = { wickets, runs };
                    }
                }
            }
        }

        // Calculate averages and rates
        const battingAverage = (batting.innings - batting.notOuts) > 0
            ? (batting.runs / (batting.innings - batting.notOuts)).toFixed(2)
            : batting.runs.toFixed(2);
        const strikeRate = batting.balls > 0
            ? ((batting.runs / batting.balls) * 100).toFixed(2)
            : 0;
        const bowlingAverage = bowling.wickets > 0
            ? (bowling.runs / bowling.wickets).toFixed(2)
            : '-';
        const economyRate = bowling.balls > 0
            ? ((bowling.runs / (bowling.balls / 6))).toFixed(2)
            : 0;

        res.json({
            playerName,
            totalMatches,
            batting: {
                ...batting,
                average: battingAverage,
                strikeRate
            },
            bowling: {
                ...bowling,
                overs: `${Math.floor(bowling.balls / 6)}.${bowling.balls % 6}`,
                average: bowlingAverage,
                economyRate,
                bestFigures: bowling.bestFigures.wickets > 0
                    ? `${bowling.bestFigures.wickets}/${bowling.bestFigures.runs}`
                    : '-'
            }
        });
    } catch (error) {
        console.error('Error fetching career stats:', error);
        res.status(500).json({ message: 'Error fetching career stats', error: error.message });
    }
});

export default router;
