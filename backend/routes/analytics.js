import express from 'express';
import Tournament from '../models/Tournament.js';
import Club from '../models/Club.js';
import Player from '../models/Player.js';
import Coach from '../models/Coach.js';
import Match from '../models/Match.js';
import Sponsor from '../models/Sponsor.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Overview stats - platform summary
router.get('/overview', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const [
            totalPlayers,
            totalClubs,
            approvedClubs,
            pendingClubs,
            totalTournaments,
            activeTournaments,
            completedTournaments,
            totalMatches,
            liveMatches,
            totalCoaches,
            totalSponsors,
            verifiedSponsors
        ] = await Promise.all([
            Player.countDocuments(),
            Club.countDocuments(),
            Club.countDocuments({ status: 'approved' }),
            Club.countDocuments({ status: 'pending' }),
            Tournament.countDocuments(),
            Tournament.countDocuments({ status: { $in: ['ongoing', 'active'] } }),
            Tournament.countDocuments({ status: 'completed' }),
            Match.countDocuments(),
            Match.countDocuments({ status: 'live' }),
            Coach.countDocuments(),
            Sponsor.countDocuments(),
            Sponsor.countDocuments({ status: 'verified' })
        ]);

        res.json({
            players: { total: totalPlayers },
            clubs: { total: totalClubs, approved: approvedClubs, pending: pendingClubs },
            tournaments: { total: totalTournaments, active: activeTournaments, completed: completedTournaments },
            matches: { total: totalMatches, live: liveMatches },
            coaches: { total: totalCoaches },
            sponsors: { total: totalSponsors, verified: verifiedSponsors }
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics overview' });
    }
});

// User growth over time (last 6 months)
router.get('/growth', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Aggregate players by month
        const playerGrowth = await Player.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Aggregate clubs by month
        const clubGrowth = await Club.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Aggregate coaches by month
        const coachGrowth = await Coach.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Generate labels for last 6 months
        const labels = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(d.toISOString().slice(0, 7)); // YYYY-MM
        }

        // Map data to labels
        const mapToLabels = (data) => labels.map(label => {
            const found = data.find(d => d._id === label);
            return found ? found.count : 0;
        });

        res.json({
            labels: labels.map(l => {
                const [year, month] = l.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }),
            datasets: {
                players: mapToLabels(playerGrowth),
                clubs: mapToLabels(clubGrowth),
                coaches: mapToLabels(coachGrowth)
            }
        });
    } catch (error) {
        console.error('Analytics growth error:', error);
        res.status(500).json({ message: 'Failed to fetch growth data' });
    }
});

// Tournament statistics
router.get('/tournaments', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const statusCounts = await Tournament.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formatCounts = await Tournament.aggregate([
            {
                $group: {
                    _id: '$matchFormat',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Map to readable format
        const statusData = {};
        statusCounts.forEach(s => {
            statusData[s._id || 'unknown'] = s.count;
        });

        const formatData = {};
        formatCounts.forEach(f => {
            formatData[f._id || 'unknown'] = f.count;
        });

        res.json({
            byStatus: statusData,
            byFormat: formatData
        });
    } catch (error) {
        console.error('Analytics tournaments error:', error);
        res.status(500).json({ message: 'Failed to fetch tournament analytics' });
    }
});

// Geographic distribution (users by district)
router.get('/geographic', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const clubsByDistrict = await Club.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$district',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const playersByDistrict = await Player.aggregate([
            {
                $group: {
                    _id: '$district',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            clubs: clubsByDistrict.map(d => ({ district: d._id || 'Unknown', count: d.count })),
            players: playersByDistrict.map(d => ({ district: d._id || 'Unknown', count: d.count }))
        });
    } catch (error) {
        console.error('Analytics geographic error:', error);
        res.status(500).json({ message: 'Failed to fetch geographic data' });
    }
});

// Recent activity feed
router.get('/recent-activity', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        const [recentClubs, recentPlayers, recentTournaments] = await Promise.all([
            Club.find().sort({ createdAt: -1 }).limit(5).select('clubName status createdAt district'),
            Player.find().sort({ createdAt: -1 }).limit(5).select('name status createdAt'),
            Tournament.find().sort({ createdAt: -1 }).limit(5).select('name status createdAt')
        ]);

        const activities = [
            ...recentClubs.map(c => ({
                type: 'club',
                name: c.clubName,
                status: c.status,
                date: c.createdAt,
                detail: c.district
            })),
            ...recentPlayers.map(p => ({
                type: 'player',
                name: p.name,
                status: p.status,
                date: p.createdAt
            })),
            ...recentTournaments.map(t => ({
                type: 'tournament',
                name: t.name,
                status: t.status,
                date: t.createdAt
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        res.json(activities);
    } catch (error) {
        console.error('Analytics recent activity error:', error);
        res.status(500).json({ message: 'Failed to fetch recent activity' });
    }
});

// Tournament payment analytics - entry fee collection details
router.get('/tournament-payments', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
    try {
        // Get all tournaments with entry fees
        const tournaments = await Tournament.find({ entryFee: { $gt: 0 } })
            .select('name entryFee registrations participants status startDate')
            .populate('registrations.club', 'clubName')
            .sort({ startDate: -1 })
            .limit(20);

        const paymentData = tournaments.map(tournament => {
            const registrations = tournament.registrations || [];
            const approvedRegistrations = registrations.filter(r => r.status === 'approved');

            const totalExpected = approvedRegistrations.length * tournament.entryFee;
            const paidRegistrations = approvedRegistrations.filter(r => r.paymentStatus === 'paid');
            const totalCollected = paidRegistrations.reduce((sum, r) => sum + (r.paymentAmount || tournament.entryFee), 0);
            const pendingAmount = totalExpected - totalCollected;

            // Team-wise payment details
            const teamPayments = approvedRegistrations.map(reg => ({
                clubId: reg.club?._id,
                clubName: reg.club?.clubName || 'Unknown Club',
                paymentStatus: reg.paymentStatus,
                paymentAmount: reg.paymentAmount || tournament.entryFee,
                expectedAmount: tournament.entryFee,
                appliedAt: reg.appliedAt
            }));

            return {
                tournamentId: tournament._id,
                tournamentName: tournament.name,
                status: tournament.status,
                startDate: tournament.startDate,
                entryFee: tournament.entryFee,
                totalTeams: approvedRegistrations.length,
                totalExpected,
                totalCollected,
                pendingAmount,
                paidCount: paidRegistrations.length,
                pendingCount: approvedRegistrations.length - paidRegistrations.length,
                teamPayments
            };
        });

        res.json(paymentData);
    } catch (error) {
        console.error('Analytics tournament payments error:', error);
        res.status(500).json({ message: 'Failed to fetch tournament payment data' });
    }
});

export default router;
