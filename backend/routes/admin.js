import express from 'express';
import Club from '../models/Club.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import Player from '../models/Player.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { 
  generateRoundRobinPairings, 
  generateKnockoutBracket, 
  generateGroupsPlusKnockout, 
  scheduleRounds 
} from '../utils/fixtures.js';
import { syncTournamentAndMatches } from '../utils/statusSync.js';

const router = express.Router();

// Get all club registrations for admin review
router.get('/clubs', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const clubs = await Club.find(filter)
      .populate('manager', 'name email')
      .sort({ submittedAt: -1 });

    // Transform data for frontend
    const transformedClubs = clubs.map(club => {
      let logoBase64 = null;
      
      // Convert logo binary data to base64 for direct display
      if (club.logo && club.logo.data) {
        try {
          const base64Data = club.logo.data.toString('base64');
          logoBase64 = `data:${club.logo.contentType || 'image/png'};base64,${base64Data}`;
        } catch (error) {
          console.error('Error converting logo to base64 for club:', club._id, error);
        }
      }

      return {
        id: club._id,
        clubName: club.clubName || club.name, // Support both new and legacy format
        district: club.district,
        city: club.city,
        foundedYear: club.foundedYear,
        managerName: club.managerName || club.manager?.name,
        phone: club.phone,
        email: club.email || club.manager?.email,
        description: club.description,
        groundName: club.groundName,
        memberCount: club.memberCount,
        website: club.website,
        achievements: club.achievements,
        status: club.status,
        submittedAt: club.submittedAt || club.createdAt,
        processedAt: club.processedAt,
        rejectionReason: club.rejectionReason,
        // Include base64 logo data for direct display
        logoBase64: logoBase64,
        // Keep URL fallback for compatibility
        logoUrl: club.logoUrl || `/api/clubs/${club._id}/logo`,
        proofUrl: club.proofUrl || `/api/clubs/${club._id}/proof`
      };
    });

    res.json({ clubs: transformedClubs });
  } catch (error) {
    console.error('Error fetching clubs for admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin dashboard statistics
router.get('/stats', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      Club.countDocuments({ status: 'pending' }),
      Club.countDocuments({ status: 'approved' }),
      Club.countDocuments({ status: 'rejected' }),
      Club.countDocuments({})
    ]);

    res.json({
      stats: {
        pending,
        approved,
        rejected,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve club registration
router.put('/clubs/:id/approve', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        processedAt: new Date(),
        processedBy: req.user._id
      },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json({ 
      message: 'Club approved successfully', 
      club: {
        id: club._id,
        status: club.status,
        processedAt: club.processedAt
      }
    });
  } catch (error) {
    console.error('Error approving club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject club registration
router.put('/clubs/:id/reject', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const club = await Club.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason || 'No reason provided',
        processedAt: new Date(),
        processedBy: req.user._id
      },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json({ 
      message: 'Club rejected successfully', 
      club: {
        id: club._id,
        status: club.status,
        processedAt: club.processedAt,
        rejectionReason: club.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== Tournament Management (Admin) =====
// Create tournament
router.post('/tournaments', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};

    // Normalize incoming fields to match model
    const normalizeFormat = (v) => {
      if (!v) return 'league';
      const s = String(v).toLowerCase();
      if (s === 'knockout') return 'knockout';
      if (s === 'league') return 'league';
      if (s === 'league+playoff' || s === 'leagueplusplayoff' || s === 'league_playoff') return 'league+playoff';
      if (s === 'round-robin' || s === 'roundrobin') return 'round-robin';
      return 'league';
    };
    const normalizeStatus = (v) => {
      if (!v) return 'open';
      const map = { open: 'open', ongoing: 'ongoing', completed: 'completed', cancelled: 'cancelled' };
      const s = String(v).toLowerCase();
      return map[s] || 'open';
    };

    // Allow legacy keys: type -> format, banner -> bannerUrl
    const format = normalizeFormat(body.format || body.type);
    const status = normalizeStatus(body.status);
    const bannerUrl = body.bannerUrl || body.banner || '';

    // Basic required validation
    if (!body.name) return res.status(400).json({ message: 'Name is required' });
    if (!body.startDate || !body.endDate) return res.status(400).json({ message: 'Start and End dates are required' });
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (end < start) return res.status(400).json({ message: 'End date cannot be before start date' });
    
    // Validate that dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return res.status(400).json({ message: 'Start date cannot be in the past' });
    if (end < today) return res.status(400).json({ message: 'End date cannot be in the past' });
    
    const maxTeams = Number.isFinite(Number(body.maxTeams)) ? Number(body.maxTeams) : 16;
    if (maxTeams < 2 || maxTeams > 128) return res.status(400).json({ message: 'Max teams must be between 2 and 128' });
    if (body.registrationDeadline) {
      const reg = new Date(body.registrationDeadline);
      if (isNaN(reg.getTime())) return res.status(400).json({ message: 'Invalid registration deadline' });
      if (reg > start) return res.status(400).json({ message: 'Registration deadline must be on or before the start date' });
      // Validate that registration deadline is not in the past
      if (reg < today) return res.status(400).json({ message: 'Registration deadline cannot be in the past' });
    }

    // Additional validation
    if (!body.rules || String(body.rules).trim() === '') return res.status(400).json({ message: 'Rules are required' });
    const entryFee = Number.isFinite(Number(body.entryFee)) ? Number(body.entryFee) : 0;
    if (entryFee < 0) return res.status(400).json({ message: 'Entry fee cannot be negative' });
    
    // Validate prize pool
    const prizePool = Number.isFinite(Number(body.prizePool)) ? Number(body.prizePool) : 0;
    if (prizePool < 0) return res.status(400).json({ message: 'Prize pool cannot be negative' });
    
    // Validate rest days
    const restDaysMin = Number.isFinite(Number(body.restDaysMin)) ? Number(body.restDaysMin) : 1;
    if (restDaysMin < 0) return res.status(400).json({ message: 'Minimum rest days cannot be negative' });
    
    // Validate match format
    const validMatchFormats = ['T20', 'ODI', 'Test', 'T10', 'Custom'];
    const matchFormat = validMatchFormats.includes(body.matchFormat) ? body.matchFormat : 'T20';
    
    // Set overs limit based on match format
    let oversLimit = 20; // default for T20
    if (body.oversLimit && Number.isFinite(Number(body.oversLimit)) && Number(body.oversLimit) > 0) {
      oversLimit = Number(body.oversLimit);
    } else {
      switch (matchFormat) {
        case 'T20': oversLimit = 20; break;
        case 'ODI': oversLimit = 50; break;
        case 'Test': oversLimit = 90; break;
        case 'T10': oversLimit = 10; break;
        default: oversLimit = body.oversLimit || 20;
      }
    }

    const t = await Tournament.create({
      name: body.name,
      description: body.description || '',
      rules: body.rules || '',
      district: body.district || '',
      location: body.location || body.district || '',
      venues: Array.isArray(body.venues) ? body.venues : [],
      bannerUrl,
      format,
      matchFormat,
      oversLimit,
      startDate: start,
      endDate: end,
      status,
      maxTeams,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
      entryFee,
      prizePool,
      sponsorInfo: body.sponsorInfo || '',
      restDaysMin,
      organizer: req.user._id,
      // Handle venue slots if provided
      venueSlots: Array.isArray(body.venueSlots) ? body.venueSlots : [],
      reserveDays: Array.isArray(body.reserveDays) ? body.reserveDays.map(d => new Date(d)) : []
    });
    res.json(t);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Failed to create tournament' });
  }
});

// List tournaments with optional status filter
router.get('/tournaments', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const list = await Tournament.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Error listing tournaments:', error);
    res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
});

// Update tournament
router.put('/tournaments/:id', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const updates = req.body || {};
    const t = await Tournament.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ message: 'Failed to update tournament' });
  }
});

// Cancel tournament
router.put('/tournaments/:id/cancel', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t);
  } catch (error) {
    console.error('Error cancelling tournament:', error);
    res.status(500).json({ message: 'Failed to cancel tournament' });
  }
});

// View registrations
router.get('/tournaments/:id/registrations', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
      .populate('registrations.club', 'clubName name logoUrl district managerName');
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t.registrations || []);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

// Approve/Reject registration
router.put('/tournaments/:id/registrations/:regId/:action', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { action } = req.params; // 'approve' or 'reject'
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    const reg = t.registrations.id(req.params.regId);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

  // When approving, if entryFee > 0, set paymentStatus to pending and do not add to participants yet
  if (action === 'approve') {
    reg.status = 'approved';
    reg.decisionAt = new Date();
    if ((Number(t.entryFee) || 0) > 0) {
      reg.paymentStatus = 'pending';
      reg.paymentAmount = Number(t.entryFee) || 0;
    } else {
      reg.paymentStatus = 'not_required';
      reg.paymentAmount = 0;
      // Free tournaments: immediately add to participants
      const exists = (t.participants || []).some(id => String(id) === String(reg.club));
      if (!exists) t.participants.push(reg.club);
    }
    await t.save();
    return res.json(reg);
  }

  // Reject action
  reg.status = 'rejected';
    reg.decisionAt = new Date();
  await t.save();

    res.json(reg);
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ message: 'Failed to update registration' });
  }
});

// ===== Registration open/close controls (until fixtures are generated) =====
router.put('/tournaments/:id/open-registrations', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    if (t.fixturesGenerated) return res.status(400).json({ message: 'Cannot reopen registrations after fixtures are generated' });
    if (['cancelled', 'completed'].includes(t.status)) return res.status(400).json({ message: 'Cannot open registrations for cancelled or completed tournament' });
    t.status = 'open';
    await t.save();
    res.json(t);
  } catch (error) {
    console.error('Error opening registrations:', error);
    res.status(500).json({ message: 'Failed to open registrations' });
  }
});

router.put('/tournaments/:id/close-registrations', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    if (t.fixturesGenerated) return res.status(400).json({ message: 'Registrations are locked after fixtures are generated' });
    if (['cancelled', 'completed'].includes(t.status)) return res.status(400).json({ message: 'Cannot close registrations for cancelled or completed tournament' });
    t.status = 'upcoming';
    await t.save();
    res.json(t);
  } catch (error) {
    console.error('Error closing registrations:', error);
    res.status(500).json({ message: 'Failed to close registrations' });
  }
});

// ===== Generate fixtures =====

// Generate fixtures endpoint
router.post('/tournaments/:id/fixtures/generate', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const options = req.body || {};
    
    // Get tournament with participants
    const tournament = await Tournament.findById(tournamentId)
      .populate('participants', 'clubName name district city');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if fixtures already generated
    if (tournament.fixturesGenerated) {
      return res.status(400).json({ message: 'Fixtures already generated for this tournament' });
    }

    // Check if tournament has participants
    const participants = tournament.participants || [];
    if (participants.length < 2) {
      return res.status(400).json({ message: 'At least 2 teams required to generate fixtures' });
    }

    // Delete existing fixtures if any
    await Match.deleteMany({ tournament: tournamentId });

    let rounds = [];
    let groups = [];

    // Generate fixtures based on tournament format
    switch (tournament.format) {
      case 'league':
      case 'round-robin':
        rounds = generateRoundRobinPairings(
          participants.map(p => p._id), 
          { doubleRoundRobin: options.doubleRoundRobin || false }
        );
        break;

      case 'knockout':
        rounds = generateKnockoutBracket(participants.map(p => p._id));
        break;

      case 'league+playoff':
      case 'groups+knockouts':
        const groupCount = options.groups || 2;
        const qualifyPerGroup = options.qualifyPerGroup || 2;
        
        // Split teams into groups
        const teamIds = participants.map(p => p._id);
        const groupSize = Math.ceil(teamIds.length / groupCount);
        
        for (let i = 0; i < groupCount; i++) {
          const startIdx = i * groupSize;
          const endIdx = Math.min(startIdx + groupSize, teamIds.length);
          const groupTeams = teamIds.slice(startIdx, endIdx);
          
          groups.push({
            name: `Group ${String.fromCharCode(65 + i)}`,
            clubs: groupTeams
          });
          
          // Generate round robin for this group
          const groupRounds = generateRoundRobinPairings(
            groupTeams, 
            { doubleRoundRobin: options.doubleRoundRobin || false }
          );
          
          groupRounds.forEach(round => {
            rounds.push({
              ...round,
              roundLabel: `Group ${String.fromCharCode(65 + i)} - Round ${round.round}`,
              stage: 'Group',
              group: `Group ${String.fromCharCode(65 + i)}`
            });
          });
        }
        break;

      default:
        return res.status(400).json({ message: 'Unsupported tournament format' });
    }

    // Schedule the rounds
    const venueSlots = tournament.venues && tournament.venues.length > 0 
      ? tournament.venues.map(venue => ({
          name: venue,
          slotTimes: ['09:00', '14:00'] // Default time slots
        }))
      : [{ name: 'Main Ground', slotTimes: ['09:00', '14:00'] }];

    const scheduleOptions = {
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      venueSlots,
      restDaysMin: 1,
      respectRoundOrder: options.respectRoundOrder !== false
    };

    const scheduleResult = scheduleRounds(rounds, scheduleOptions);

    if (!scheduleResult.ok) {
      return res.status(400).json({ 
        message: scheduleResult.message,
        diagnostics: {
          capacity: scheduleResult.capacity,
          required: scheduleResult.required,
          scheduled: scheduleResult.scheduled?.length || 0
        }
      });
    }

    // Create match records
    const matches = [];
    for (const matchData of scheduleResult.matches) {
      const match = new Match({
        tournament: tournamentId,
        homeClub: matchData.home,
        awayClub: matchData.away,
        date: matchData.date,
        time: matchData.time,
        venue: matchData.venue,
        round: matchData.round,
        stage: matchData.stage || 'Group',
        group: matchData.group || '',
        status: 'Scheduled',
        matchCode: `M${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      });
      
      matches.push(match);
    }

    // Save all matches
    await Match.insertMany(matches);

    // Update tournament
    tournament.fixturesGenerated = true;
    tournament.groups = groups;
    tournament.status = 'upcoming';
    await tournament.save();

    res.json({ 
      message: 'Fixtures generated successfully',
      matchesCount: matches.length,
      groups: groups.length
    });

  } catch (error) {
    console.error('Error generating fixtures:', error);
    res.status(500).json({ message: 'Failed to generate fixtures' });
  }
});

// Seed knockout bracket from group standings
router.post('/tournaments/:id/fixtures/seed-knockout', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const { qualifyPerGroup = 2 } = req.body || {};
    
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.format !== 'league+playoff' && tournament.format !== 'groups+knockouts') {
      return res.status(400).json({ message: 'Tournament format does not support knockout seeding' });
    }

    // Get group standings and determine qualifiers
    const groups = tournament.groups || [];
    const qualifiers = [];
    
    for (const group of groups) {
      const groupStandings = tournament.standings
        .filter(s => s.group === group.name)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.nrr - a.nrr;
        });
      
      const groupQualifiers = groupStandings
        .slice(0, qualifyPerGroup)
        .map(s => s.club);
      
      qualifiers.push(...groupQualifiers);
    }

    if (qualifiers.length < 2) {
      return res.status(400).json({ message: 'Not enough qualifiers for knockout stage' });
    }

    // Generate knockout bracket
    const knockoutRounds = generateKnockoutBracket(qualifiers);
    
    // Schedule knockout matches
    const venueSlots = tournament.venues && tournament.venues.length > 0 
      ? tournament.venues.map(venue => ({
          name: venue,
          slotTimes: ['09:00', '14:00']
        }))
      : [{ name: 'Main Ground', slotTimes: ['09:00', '14:00'] }];

    const scheduleOptions = {
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      venueSlots,
      restDaysMin: 1,
      respectRoundOrder: true
    };

    const scheduleResult = scheduleRounds(knockoutRounds, scheduleOptions);

    if (!scheduleResult.ok) {
      return res.status(400).json({ 
        message: scheduleResult.message,
        diagnostics: {
          capacity: scheduleResult.capacity,
          required: scheduleResult.required,
          scheduled: scheduleResult.scheduled?.length || 0
        }
      });
    }

    // Create knockout match records
    const matches = [];
    for (const matchData of scheduleResult.matches) {
      const match = new Match({
        tournament: tournamentId,
        homeClub: matchData.home,
        awayClub: matchData.away,
        date: matchData.date,
        time: matchData.time,
        venue: matchData.venue,
        round: matchData.round,
        stage: 'Knockout',
        status: 'Scheduled',
        matchCode: `K${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      });
      
      matches.push(match);
    }

    // Save knockout matches
    await Match.insertMany(matches);

    res.json({ 
      message: 'Knockout bracket seeded successfully',
      matchesCount: matches.length,
      qualifiers: qualifiers.length
    });

  } catch (error) {
    console.error('Error seeding knockout:', error);
    res.status(500).json({ message: 'Failed to seed knockout bracket' });
  }
});

// ===== Delete all fixtures for a tournament (admin) =====
router.delete('/tournaments/:id/fixtures', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });

    const del = await Match.deleteMany({ tournament: t._id });

    // Reset tournament fixture state
    t.fixturesGenerated = false;
    t.groups = [];
    t.standings = [];
    // If tournament had no matches and was ongoing, move back to upcoming
    if (t.status === 'ongoing') t.status = 'upcoming';
    await t.save();

    res.json({ message: 'Fixtures deleted', matchesDeleted: del.deletedCount || 0 });
  } catch (error) {
    console.error('Error deleting fixtures:', error);
    res.status(500).json({ message: 'Failed to delete fixtures' });
  }
});

// ===== Enter/Update match result (admin) =====
router.put('/tournaments/:id/matches/:matchId/result', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { winnerId, tie = false, noResult = false, nrr = {} } = req.body || {};
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.tournament) !== String(req.params.id)) return res.status(400).json({ message: 'Match does not belong to this tournament' });
    if (match.finalized) return res.status(400).json({ message: 'Match is finalized and cannot be edited' });

    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });

    // Validate winner belongs to match when provided
    if (winnerId) {
      const home = String(match.homeClub), away = String(match.awayClub);
      if (![home, away].includes(String(winnerId))) return res.status(400).json({ message: 'Winner must be one of the match teams' });
    }

    // Update match result
    match.status = 'Completed';
    match.result = {
      winner: tie || noResult ? undefined : winnerId,
      isTie: !!tie,
      isNoResult: !!noResult,
      summary: req.body.summary || match.result?.summary || ''
    };
    await match.save();

    // Ensure tournament status
    if (t.status === 'upcoming') {
      t.status = 'ongoing';
    }

    // Update standings for league/group stages (2 points win, 1 tie/NR)
    const isLeagueish = t.format === 'league' || t.format === 'round-robin' || (t.format === 'league+playoff' && match.stage === 'Group');
    if (isLeagueish) {
      const ensureStanding = (clubId) => {
        let st = t.standings.find(s => String(s.club) === String(clubId));
        if (!st) {
          st = { club: clubId, group: match.group || '', played: 0, won: 0, lost: 0, drawn: 0, points: 0, nrr: 0 };
          t.standings.push(st);
        }
        return st;
      };
      const home = ensureStanding(match.homeClub);
      const away = ensureStanding(match.awayClub);
      home.played += 1; away.played += 1;
      if (tie || noResult) {
        home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1;
      } else if (winnerId) {
        if (String(winnerId) === String(match.homeClub)) {
          home.won += 1; home.points += 2; away.lost += 1;
        } else if (String(winnerId) === String(match.awayClub)) {
          away.won += 1; away.points += 2; home.lost += 1;
        }
      }
      // Optional NRR adjustments
      if (typeof nrr.home === 'number') home.nrr += nrr.home;
      if (typeof nrr.away === 'number') away.nrr += nrr.away;
    }

    // Knockout progression
    if ((t.format === 'knockout') || (t.format === 'league+playoff' && match.stage === 'Knockout')) {
      const currentRound = match.bracketRound || 0;
      if (currentRound >= 1 && winnerId) {
        const pairSlot = Math.ceil(match.bracketSlot / 2);
        const feederSlots = [2 * pairSlot - 1, 2 * pairSlot];
        // Check if both feeder winners are known
        const feeders = await Match.find({
          tournament: t._id,
          bracketRound: currentRound,
          bracketSlot: { $in: feederSlots },
          status: 'Completed'
        }).lean();
        if (feeders.length >= 1) {
          // Determine opponents when both available
          const wMap = new Map();
          feeders.forEach(m => { if (m.result?.winner) wMap.set(m.bracketSlot, m.result.winner); });
          const w1 = wMap.get(feederSlots[0]);
          const w2 = wMap.get(feederSlots[1]);
          if (w1 && w2) {
            // Create next-round match if not exists
            const nextRound = currentRound + 1;
            const exists = await Match.findOne({ tournament: t._id, bracketRound: nextRound, bracketSlot: pairSlot });
            if (!exists) {
              // Name round based on remaining teams
              const prevMatches = await Match.find({ tournament: t._id, bracketRound: currentRound }).lean();
              const remaining = Math.max(2, prevMatches.length);
              let label = 'Final';
              if (remaining === 2) label = 'Final';
              else if (remaining === 4) label = 'Semifinal';
              else if (remaining === 8) label = 'Quarterfinal';
              else label = `Round ${nextRound}`;

              const nextMatch = new Match({
                tournament: t._id,
                homeClub: w1,
                awayClub: w2,
                stage: 'Knockout',
                round: label,
                bracketRound: nextRound,
                bracketSlot: pairSlot,
                matchCode: `M${Date.now().toString().slice(-6)}`
              });
              // Schedule: pick the next available slot after latest scheduled date
              const last = await Match.find({ tournament: t._id }).sort({ date: -1, time: -1 }).limit(1).lean();
              let base = last[0]?.date ? new Date(last[0].date) : new Date(t.startDate);
              base = new Date(base.getTime() + 24 * 60 * 60 * 1000);
              nextMatch.date = base;
              nextMatch.time = (Array.isArray(timeSlots) && timeSlots[0]) || '09:00';
              nextMatch.venue = (Array.isArray(t.venues) && t.venues[0]) || '';
              await nextMatch.save();
            }
          }
        }
      }
    }

    // If all matches are completed and it's not league+playoff group stage, mark tournament completed
    const totalMatches = await Match.countDocuments({ tournament: t._id });
    const completedMatches = await Match.countDocuments({ tournament: t._id, status: 'Completed' });
    if (totalMatches > 0 && completedMatches === totalMatches && t.format !== 'league+playoff') {
      t.status = 'completed';
    }

    await t.save();

    res.json({ message: 'Result saved' });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ message: 'Failed to save result' });
  }
});

// ===== Edit fixture (admin) =====
router.put('/tournaments/:id/matches/:matchId', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { homeClub, awayClub, date, time, venue, override = false, teamBlackouts = {}, venueBlackouts = {}, allowedTimeSlots = [], maxPerVenuePerDay, avoidBackToBackVenue = false, homeAwayTolerance = 1, doubleRoundRobin = false } = req.body || {};
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });

    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.tournament) !== String(t._id)) return res.status(400).json({ message: 'Match does not belong to this tournament' });

    // Parse date safely (YYYY-MM-DD -> UTC midnight)
    const parseDateSafe = (val) => {
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y,m,d] = val.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1, d));
      }
      return new Date(val);
    };

    // Inputs
    const newHome = homeClub ? String(homeClub) : String(match.homeClub);
    const newAway = awayClub ? String(awayClub) : String(match.awayClub);
    const newDate = date ? parseDateSafe(date) : (match.date ? new Date(match.date) : new Date(t.startDate));
    const newTime = time || match.time;
    const newVenue = venue || match.venue;

    if (newHome === newAway) return res.status(400).json({ message: 'Home and away cannot be the same' });

    // Tournament date window and past-date validation intentionally disabled per requirements
    // (Allow scheduling outside start/end and in the past).

    // Validate sources
    const participants = (t.participants || []).map(String);
    if (!participants.includes(newHome) || !participants.includes(newAway)) {
      if (!override) return res.status(400).json({ message: 'Selected teams must be registered for this tournament' });
    }
    const venues = Array.isArray(t.venues) ? t.venues.map(String) : [];
    if (newVenue && !venues.includes(String(newVenue))) {
      if (!override) return res.status(400).json({ message: 'Selected venue must be assigned to this tournament' });
    }
    if (Array.isArray(allowedTimeSlots) && allowedTimeSlots.length > 0 && newTime && !allowedTimeSlots.includes(newTime)) {
      if (!override) return res.status(400).json({ message: 'Selected time slot is not allowed for this tournament' });
    }

    // Validation helpers
    const isoDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
    const dateKey = isoDate(newDate);
    const prevDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()); prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()); nextDate.setDate(nextDate.getDate() + 1);
    const prevKey = isoDate(prevDate);
    const nextKey = isoDate(nextDate);

    // Fetch matches on same tournament excluding this match
    const others = await Match.find({ tournament: t._id, _id: { $ne: match._id } }).lean();

    // Check if date is being changed
    const originalDate = match.date ? isoDate(new Date(match.date)) : null;
    const isDateChanged = originalDate !== dateKey;

    // One match per day per team - only apply if date is being changed
    if (isDateChanged) {
      const conflictSameDay = others.find(m => m.date && isoDate(new Date(m.date)) === dateKey && (String(m.homeClub) === newHome || String(m.awayClub) === newHome || String(m.homeClub) === newAway || String(m.awayClub) === newAway));
      if (conflictSameDay && !override) return res.status(400).json({ message: 'A team cannot play more than one match on the same day' });
    }

    // Rest day rule (no consecutive days) - only apply if date is being changed
    
    if (isDateChanged) {
      const conflictPrevNext = others.find(m => m.date && ([prevKey, nextKey].includes(isoDate(new Date(m.date)))) && (String(m.homeClub) === newHome || String(m.awayClub) === newHome || String(m.homeClub) === newAway || String(m.awayClub) === newAway));
      if (conflictPrevNext && !override) return res.status(400).json({ message: 'Rest day required: teams cannot play on consecutive days' });
    }

    // Blackouts
    const teamBlack = teamBlackouts || {};
    const venueBlack = venueBlackouts || {};
    const blockedTeam = (teamId) => Array.isArray(teamBlack[String(teamId)]) && teamBlack[String(teamId)].includes(dateKey);
    const blockedVenue = (venueId) => Array.isArray(venueBlack[String(venueId)]) && venueBlack[String(venueId)].includes(dateKey);
    if ((blockedTeam(newHome) || blockedTeam(newAway)) && !override) return res.status(400).json({ message: 'Team blackout date violation' });
    if (newVenue && blockedVenue(newVenue) && !override) return res.status(400).json({ message: 'Venue blackout date violation' });

    // Prevent double-booking: same venue+date+timeslot
    const conflictSlot = others.find(m => m.date && isoDate(new Date(m.date)) === dateKey && String(m.venue||'') === String(newVenue||'') && String(m.time||'') === String(newTime||''));
    if (conflictSlot && !override) return res.status(400).json({ message: 'Time slot already booked at this venue' });

    // Max matches per venue per day
    const perVenueCap = Number(maxPerVenuePerDay);
    if (Number.isFinite(perVenueCap) && perVenueCap > 0) {
      const countVenueDay = others.filter(m => m.date && isoDate(new Date(m.date)) === dateKey && String(m.venue||'') === String(newVenue||'')).length;
      if (countVenueDay >= perVenueCap && !override) return res.status(400).json({ message: 'Venue-day capacity reached' });
    }

    // Balance: prevent one team from exceeding others by more than 1
    const counts = new Map();
    const homeCounts = new Map(); const awayCounts = new Map();
    others.forEach(m => {
      const th = String(m.homeClub), ta = String(m.awayClub);
      counts.set(th, (counts.get(th) || 0) + 1);
      counts.set(ta, (counts.get(ta) || 0) + 1);
      homeCounts.set(th, (homeCounts.get(th) || 0) + 1);
      awayCounts.set(ta, (awayCounts.get(ta) || 0) + 1);
    });
    const maxCount = Math.max(0, ...Array.from(counts.values()));
    const newHomeCount = (counts.get(newHome) || 0) + 1;
    const newAwayCount = (counts.get(newAway) || 0) + 1;
    if ((!override) && (newHomeCount > maxCount + 1 || newAwayCount > maxCount + 1)) {
      return res.status(400).json({ message: 'Balance violation: one team would have too many matches compared to others' });
    }

    // Format-based frequency integrity (league/group RR)
    const format = t.format || 'league';
    const groups = Array.isArray(t.groups) ? t.groups : [];
    const groupName = match.group || '';
    const participantsByGroup = new Map();
    groups.forEach(g => participantsByGroup.set(g.name || g.group || g.label || '', (g.clubs || g.members || [] ).map(String)));

    function expectedPerTeam(teamId){
      // Determine RR scope
      let pool = (participants || []).map(String);
      if ((format === 'league' || format === 'round-robin' || format === 'league+playoff') && groupName) {
        const clubs = participantsByGroup.get(groupName);
        if (clubs && clubs.length) pool = clubs;
      }
      if (format === 'groups+knockouts' && groupName && participantsByGroup.has(groupName)) pool = participantsByGroup.get(groupName);
      const n = pool.length || participants.length || 0;
      if (n <= 1) return Infinity;
      // Infer if double RR by observing duplicate pair occurrence
      const pairSeen = new Set();
      let duplicate = false;
      others.forEach(m => {
        if (!m.date) return; // ignore placeholders
        const a = String(m.homeClub), b = String(m.awayClub);
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (pairSeen.has(key)) duplicate = true; else pairSeen.add(key);
      });
      const factor = doubleRoundRobin || duplicate ? 2 : 1;
      return (n - 1) * factor;
    }

    const expHome = expectedPerTeam(newHome);
    const expAway = expectedPerTeam(newAway);
    if (!override && (newHomeCount > expHome || newAwayCount > expAway)) {
      return res.status(400).json({ message: 'Format limit: team would exceed allowed number of matches' });
    }

    // Group integrity (non cross-group)
    const isCross = (groupName && groupName.includes('-')) || (match.round || '').toLowerCase().includes('cross');
    if (!isCross && groupName && participantsByGroup.has(groupName)) {
      const clubs = participantsByGroup.get(groupName) || [];
      if ((!clubs.includes(newHome)) || (!clubs.includes(newAway))) {
        if (!override) return res.status(400).json({ message: 'Group integrity violation: team not in this group' });
      }
    }

    // Home/away balance tolerance (league-ish)
    const isLeagueish = ['league','round-robin','league+playoff','groups+knockouts'].includes(format) && match.stage !== 'Knockout';
    if (isLeagueish) {
      const newHomeHome = (homeCounts.get(newHome) || 0) + 1;
      const newHomeAway = (awayCounts.get(newHome) || 0);
      const newAwayHome = (homeCounts.get(newAway) || 0);
      const newAwayAway = (awayCounts.get(newAway) || 0) + 1;
      const homeImbalance = Math.abs(newHomeHome - newHomeAway);
      const awayImbalance = Math.abs(newAwayHome - newAwayAway);
      const tol = Math.max(0, Number(homeAwayTolerance) || 1);
      if ((homeImbalance > tol || awayImbalance > tol) && !override) {
        return res.status(400).json({ message: 'Warning: home/away balance becoming uneven. Enable override to proceed.' });
      }
    }

    // Avoid back-to-back same venue for teams (warning)
    if (avoidBackToBackVenue && !override) {
      const dayKey = dateKey;
      const prevDay = prevKey; const nextDay = nextKey;
      const teamPrevSameVenue = others.find(m => m.venue && String(m.venue) === String(newVenue) && m.date && [prevDay,nextDay].includes(isoDate(new Date(m.date))) && (String(m.homeClub)===newHome || String(m.awayClub)===newHome || String(m.homeClub)===newAway || String(m.awayClub)===newAway));
      if (teamPrevSameVenue) {
        return res.status(400).json({ message: 'Warning: back-to-back at same venue. Enable override to proceed.' });
      }
    }

    // Dense schedule warning: 3 matches within 4 days for either team
    if (!override) {
      const withinWindow = (teamId) => {
        let count = 1; // include the edited match day
        const start = new Date(newDate); start.setDate(start.getDate()-3);
        const end = new Date(newDate); end.setDate(end.getDate()+0);
        for (const m of others) {
          if (!m.date) continue;
          const d = new Date(m.date);
          if (d >= start && d <= end && (String(m.homeClub)===teamId || String(m.awayClub)===teamId)) count++;
        }
        return count >= 3;
      };
      if (withinWindow(newHome) || withinWindow(newAway)) {
        return res.status(400).json({ message: 'Warning: dense schedule (>=3 matches in 4 days). Enable override to proceed.' });
      }
    }

    // Keep consistency: for knockout with bracket slots, do not allow editing to same team already scheduled in same bracket round/slot
    if ((t.format === 'knockout' || (t.format === 'league+playoff' && match.stage === 'Knockout')) && match.bracketRound >= 1) {
      const sibling = await Match.findOne({ tournament: t._id, bracketRound: match.bracketRound, bracketSlot: match.bracketSlot, _id: { $ne: match._id } });
      if (sibling && (String(sibling.homeClub) === newHome || String(sibling.awayClub) === newHome || String(sibling.homeClub) === newAway || String(sibling.awayClub) === newAway)) {
        if (!override) return res.status(400).json({ message: 'Knockout bracket conflict for selected team' });
      }
    }

    // Apply changes
    const before = { homeClub: String(match.homeClub), awayClub: String(match.awayClub), date: match.date, time: match.time, venue: match.venue };
    match.homeClub = newHome;
    match.awayClub = newAway;
    match.date = newDate;
    match.time = newTime;
    match.venue = newVenue;

    // Log edit history
    const userId = (req.user && (req.user.uid || req.user.id)) || 'admin';
    const historyEntry = { at: new Date(), by: userId, changes: { before, after: { homeClub: newHome, awayClub: newAway, date: newDate, time: newTime, venue: newVenue } } };
    const prevHistory = Array.isArray(match.editHistory) ? match.editHistory : [];
    match.editHistory = [...prevHistory, historyEntry];

    await match.save();

    // Recalculate standings if this was a league/group stage and completed matches exist
    try {
      await recalcStandings(String(t._id));
    } catch (e) {
      // non-fatal
    }

    res.json({ message: 'Fixture updated' });
  } catch (error) {
    console.error('Error updating fixture:', error);
    res.status(500).json({ message: 'Failed to update fixture' });
  }
});

// Playoff generation endpoint removed - to be replaced with new logic

// ===== Helpers for Match Details and Standings =====
function toOvers(balls) {
  const b = Math.max(0, Number(balls) || 0);
  return b / 6; // decimal overs for rate calculations
}

function calcStrikeRate(runs, balls) {
  const r = Number(runs) || 0; const b = Number(balls) || 0;
  return b > 0 ? Number(((r / b) * 100).toFixed(2)) : 0;
}

function calcEconomy(runs, balls) {
  const r = Number(runs) || 0; const b = Number(balls) || 0;
  const overs = toOvers(b);
  return overs > 0 ? Number((r / overs).toFixed(2)) : 0;
}

async function recalcStandings(tournamentId) {
  const t = await Tournament.findById(tournamentId).lean();
  if (!t) return;
  const isLeagueish = t.format === 'league' || t.format === 'round-robin' || t.format === 'league+playoff';
  if (!isLeagueish) return; // standings only for league-style

  const groupOf = (clubId) => {
    const g = (t.groups || []).find(g => (g.clubs || []).map(String).includes(String(clubId)));
    return g ? g.name : '';
  };

  const completed = await Match.find({ tournament: tournamentId, status: 'Completed' }).lean();
  const map = new Map(); // clubId -> row
  const ensure = (cid) => {
    const key = String(cid);
    if (!map.has(key)) map.set(key, { club: cid, group: groupOf(cid), played: 0, won: 0, lost: 0, drawn: 0, points: 0, nrr: 0, _rf: 0, _bf: 0, _ra: 0, _bb: 0 });
    return map.get(key);
  };

  for (const m of completed) {
    const homeId = String(m.homeClub), awayId = String(m.awayClub);
    const homeRow = ensure(homeId), awayRow = ensure(awayId);
    homeRow.played += 1; awayRow.played += 1;
    // Award points regardless of innings presence
    if (m.result?.isTie || m.result?.isNoResult || (!m.result?.winner && !m.result?.isTie && !m.result?.isNoResult)) {
      homeRow.drawn += 1; awayRow.drawn += 1; homeRow.points += 1; awayRow.points += 1;
    } else if (m.result?.winner) {
      if (String(m.result.winner) === homeId) { homeRow.won += 1; homeRow.points += 2; awayRow.lost += 1; }
      else if (String(m.result.winner) === awayId) { awayRow.won += 1; awayRow.points += 2; homeRow.lost += 1; }
    }

    // If no innings (e.g., no result without play), skip NRR aggregation
    const inns = Array.isArray(m.innings) ? m.innings : [];
    if (inns.length < 1) continue;

    // Aggregate by club perspective for NRR
    const perClub = new Map(); // clubId -> { runsFor, ballsFaced, runsAgainst, ballsBowled }
    for (const inn of inns) {
      const batId = String(inn.battingClub);
      const bowlId = String(inn.bowlingClub);
      const rf = Number(inn.runs) || 0;
      const bf = Number(inn.balls) || 0;
      const ra = rf; // opponent runs equals batting runs
      const bb = bf; // assume symmetry
      const curBat = perClub.get(batId) || { rf: 0, bf: 0, ra: 0, bb: 0 };
      curBat.rf += rf; curBat.bf += bf; perClub.set(batId, curBat);
      const curBowl = perClub.get(bowlId) || { rf: 0, bf: 0, ra: 0, bb: 0 };
      curBowl.ra += ra; curBowl.bb += bb; perClub.set(bowlId, curBowl);
    }
    const hAgg = perClub.get(homeId) || { rf: 0, bf: 0, ra: 0, bb: 0 };
    const aAgg = perClub.get(awayId) || { rf: 0, bf: 0, ra: 0, bb: 0 };
    homeRow._rf += hAgg.rf; homeRow._bf += hAgg.bf; homeRow._ra += hAgg.ra; homeRow._bb += hAgg.bb;
    awayRow._rf += aAgg.rf; awayRow._bf += aAgg.bf; awayRow._ra += aAgg.ra; awayRow._bb += aAgg.bb;
  }

  // Compute NRR
  const rows = Array.from(map.values()).map(r => {
    const forRate = r._bf > 0 ? (r._rf / toOvers(r._bf)) : 0;
    const againstRate = r._bb > 0 ? (r._ra / toOvers(r._bb)) : 0;
    return { club: r.club, group: r.group, played: r.played, won: r.won, lost: r.lost, drawn: r.drawn, points: r.points, nrr: Number((forRate - againstRate).toFixed(3)) };
  });

  // Persist standings back in tournament
  const tu = await Tournament.findById(tournamentId);
  tu.standings = rows;
  await tu.save();
}

function computeDerivedInnings(inn) {
  if (!inn) return inn;
  // Sum batting runs and balls
  const bats = Array.isArray(inn.battingCard) ? inn.battingCard : [];
  const bowls = Array.isArray(inn.bowlingCard) ? inn.bowlingCard : [];
  const extras = inn.extras || {};

  let batRuns = 0; let batBalls = 0; let wickets = 0;
  for (const e of bats) {
    const r = Number(e.runs) || 0; const b = Number(e.balls) || 0;
    e.strikeRate = calcStrikeRate(r, b);
    batRuns += r; batBalls += b;
    const how = (e.dismissal?.how || '').toLowerCase();
    if (how && how !== 'not out' && how !== 'retired hurt') wickets += 1;
  }

  // Bowling economy
  for (const bw of bowls) {
    bw.economy = calcEconomy(Number(bw.runs) || 0, Number(bw.balls) || 0);
  }

  // Extras total
  const ext = {
    wides: Number(extras.wides) || 0,
    noBalls: Number(extras.noBalls) || 0,
    byes: Number(extras.byes) || 0,
    legByes: Number(extras.legByes) || 0,
    penalty: Number(extras.penalty) || 0,
  };
  ext.total = ext.wides + ext.noBalls + ext.byes + ext.legByes + ext.penalty;

  // Prefer bowling balls sum if present
  const bowlBalls = bowls.reduce((s, x) => s + (Number(x.balls) || 0), 0);
  const balls = bowlBalls > 0 ? bowlBalls : (Number(inn.balls) || 0);

  return {
    ...inn,
    runs: Number(inn.runs) || (batRuns + ext.total),
    balls,
    wickets: Number(inn.wickets) || wickets,
    extras: ext,
    battingCard: bats,
    bowlingCard: bowls,
  };
}

function computeResultFromInnings(match, clubs) {
  const inns = Array.isArray(match.innings) ? match.innings : [];
  if (inns.length < 2) return { result: null, summary: 'Incomplete innings' };
  const first = inns[0], second = inns[1];
  const firstRuns = Number(first.runs) || 0; const secondRuns = Number(second.runs) || 0;
  const secondWkts = Number(second.wickets) || 0;
  const nameOf = (id) => clubs.find(c => String(c._id) === String(id))?.clubName || clubs.find(c => String(c._id) === String(id))?.name || 'Team';

  if (secondRuns > firstRuns) {
    const wicketsRemaining = Math.max(0, 10 - secondWkts);
    const winner = second.battingClub;
    const summary = `${nameOf(winner)} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
    return { result: { winner, isTie: false, isNoResult: false, margin: { runs: 0, wickets: wicketsRemaining }, summary }, summary };
  } else if (firstRuns > secondRuns) {
    const winner = first.battingClub;
    const marginRuns = firstRuns - secondRuns;
    const summary = `${nameOf(winner)} won by ${marginRuns} run${marginRuns === 1 ? '' : 's'}`;
    return { result: { winner, isTie: false, isNoResult: false, margin: { runs: marginRuns, wickets: 0 }, summary }, summary };
  } else {
    const summary = 'Match tied';
    return { result: { winner: undefined, isTie: true, isNoResult: false, margin: { runs: 0, wickets: 0 }, summary }, summary };
  }
}

// ===== Admin: Enter/Update full match details (metadata, toss, innings, summary) =====
router.put('/tournaments/:id/matches/:matchId/details', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.tournament) !== String(req.params.id)) return res.status(400).json({ message: 'Match does not belong to this tournament' });
    if (match.finalized) return res.status(400).json({ message: 'Match is finalized and cannot be edited' });
    if (match.finalized) return res.status(400).json({ message: 'Match is finalized and cannot be edited' });

    const body = req.body || {};

    // Update basic metadata
    if (body.date) match.date = new Date(body.date);
    if (body.time !== undefined) match.time = String(body.time);
    if (body.venue !== undefined) match.venue = String(body.venue);
    if (body.matchType) {
      match.matchType = body.matchType;
      // Keep stage/round aligned with match type for consistency
      if (body.matchType === 'Final') {
        match.stage = 'Final';
        match.round = 'Final';
      } else if (body.matchType === 'Knockout') {
        match.stage = match.stage || 'Knockout';
      } else if (body.matchType === 'League') {
        match.stage = match.stage || 'Group';
      }
    }

    // Toss (must be one of the two teams if provided)
    if (body.toss) {
      const home = String(match.homeClub);
      const away = String(match.awayClub);
      const wonBy = body.toss.wonBy ? String(body.toss.wonBy) : (match.toss?.wonBy ? String(match.toss.wonBy) : undefined);
      if (wonBy && wonBy !== home && wonBy !== away) {
        return res.status(400).json({ message: 'Toss winner must be the home or away club of this match' });
      }
      match.toss = {
        wonBy: wonBy,
        decision: body.toss.decision || match.toss?.decision || ''
      };
    }

    // Innings - must follow the selected match (clubs restricted to home/away)
    if (Array.isArray(body.innings)) {
      const home = String(match.homeClub);
      const away = String(match.awayClub);

      // Use at most 2 innings for limited-overs cricket
      const rawInns = body.innings.slice(0, 2);

      // Validate innings clubs
      for (const [idx, inn] of rawInns.entries()) {
        const bat = String(inn.battingClub || '');
        const bowl = String(inn.bowlingClub || '');
        if (!bat || !bowl) {
          return res.status(400).json({ message: `Innings ${idx + 1}: battingClub and bowlingClub are required` });
        }
        if ((bat !== home && bat !== away) || (bowl !== home && bowl !== away)) {
          return res.status(400).json({ message: `Innings ${idx + 1}: clubs must be one of the match teams` });
        }
        if (bat === bowl) {
          return res.status(400).json({ message: `Innings ${idx + 1}: battingClub and bowlingClub cannot be the same` });
        }
      }

      // If toss known, ensure the first innings follows the toss decision
      if (match.toss?.wonBy && match.toss?.decision && rawInns.length > 0) {
        const wonBy = String(match.toss.wonBy);
        const firstBat = String(rawInns[0].battingClub);
        const firstBowl = String(rawInns[0].bowlingClub);
        if (match.toss.decision === 'bat' && firstBat !== wonBy) {
          return res.status(400).json({ message: 'Innings 1 must have the toss winner batting first' });
        }
        if (match.toss.decision === 'bowl' && firstBowl !== wonBy) {
          return res.status(400).json({ message: 'Innings 1 must have the toss winner bowling first' });
        }
      }

      const inns = rawInns.map(computeDerivedInnings);
      match.innings = inns;
      // Set innings order based on batting order
      match.inningsOrder = inns.map(i => i.battingClub);

      // If any innings has balls, mark as Live
      if (inns.some(i => (Number(i.balls) || 0) > 0)) match.status = 'Live';
    }

    // Summary fields
    if (body.summary) {
      match.summary = {
        topScorer: body.summary.topScorer || match.summary?.topScorer || '',
        topWicketTaker: body.summary.topWicketTaker || match.summary?.topWicketTaker || '',
        bestContribution: body.summary.bestContribution || match.summary?.bestContribution || '',
        playerOfTheMatch: body.summary.playerOfTheMatch || match.summary?.playerOfTheMatch || ''
      };
    }

    await match.save();
    res.json({ message: 'Match details saved', match });
  } catch (error) {
    console.error('Error saving match details:', error);
    res.status(500).json({ message: 'Failed to save match details' });
  }
});

// ===== Admin: Finalize match, compute result, update standings (NRR) =====
router.put('/tournaments/:id/matches/:matchId/finalize', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId).populate('homeClub awayClub');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.tournament) !== String(req.params.id)) return res.status(400).json({ message: 'Match does not belong to this tournament' });
    if (match.finalized) return res.status(400).json({ message: 'Match already finalized' });

    // Allow admin to mark as no result/cancelled explicitly
    const { noResult = false, cancelled = false, reason = '' } = req.body || {};

    if (cancelled) {
      match.status = 'Cancelled';
      match.finalized = true;
      match.result = { winner: undefined, isTie: false, isNoResult: true, margin: { runs: 0, wickets: 0 }, summary: reason ? `Cancelled: ${reason}` : 'Cancelled' };
      await match.save();
      await recalcStandings(match.tournament);
      return res.json({ message: 'Match cancelled and finalized', match });
    }

    // Ensure derived fields are up-to-date
    match.innings = (Array.isArray(match.innings) ? match.innings : []).map(computeDerivedInnings);

    let resultBlock = null; let summaryText = '';
    if (noResult) {
      const summary = reason ? `No result: ${reason}` : 'No result';
      resultBlock = { winner: undefined, isTie: false, isNoResult: true, margin: { runs: 0, wickets: 0 }, summary };
      summaryText = summary;
    } else {
      // If winnerId explicitly provided, validate and use it
      const forcedWinner = req.body?.winnerId;
      if (forcedWinner) {
        const home = String(match.homeClub._id || match.homeClub);
        const away = String(match.awayClub._id || match.awayClub);
        if (![home, away].includes(String(forcedWinner))) {
          return res.status(400).json({ message: 'Winner must be one of the match teams' });
        }
      }
      const clubs = [match.homeClub, match.awayClub].filter(Boolean);
      const { result, summary } = computeResultFromInnings(match, clubs);
      if (forcedWinner) {
        resultBlock = { winner: forcedWinner, isTie: false, isNoResult: false, margin: { runs: 0, wickets: 0 }, summary: req.body?.summary || '' };
        summaryText = resultBlock.summary || 'Result recorded';
      } else {
        if (!result) return res.status(400).json({ message: 'Insufficient innings to finalize' });
        resultBlock = result; summaryText = summary;
      }
    }

    match.result = { ...resultBlock };
    match.status = 'Completed';
    match.finalized = true;

    // Carry player of the match if provided in finalize
    if (req.body?.playerOfTheMatch) {
      match.summary = match.summary || {};
      match.summary.playerOfTheMatch = req.body.playerOfTheMatch;
    }
    if (!match.result.summary) match.result.summary = summaryText;

    await match.save();

    // Auto-populate key performances if not provided
    try {
      const inns = Array.isArray(match.innings) ? match.innings : [];
      const allBats = inns.flatMap(i => Array.isArray(i.battingCard) ? i.battingCard : []);
      const allBowls = inns.flatMap(i => Array.isArray(i.bowlingCard) ? i.bowlingCard : []);
      const topBat = allBats.sort((a,b) => (b.runs||0) - (a.runs||0))[0];
      const topBowl = allBowls.sort((a,b) => (b.wickets||0) - (a.wickets||0) || (a.runs||0) - (b.runs||0))[0];
      match.summary = match.summary || {};
      if (!match.summary.topScorer && topBat) {
        match.summary.topScorer = `${topBat.playerName} ${topBat.runs} (${topBat.balls})`;
      }
      if (!match.summary.topWicketTaker && topBowl) {
        const ov = (Number(topBowl.balls)||0)/6;
        match.summary.topWicketTaker = `${topBowl.bowlerName} ${topBowl.wickets}/${topBowl.runs} (${ov.toFixed(1)} ov)`;
      }
      await match.save();
    } catch (_) {}

    // Recompute standings and NRR for league-style tournaments (points: win=2, tie/NR=1)
    const t = await Tournament.findById(req.params.id);
    if (t) {
      if (t.status === 'upcoming') t.status = 'ongoing';
      await t.save();
      if (t.format === 'league' || t.format === 'round-robin' || (t.format === 'league+playoff' && match.stage === 'Group')) {
        await recalcStandings(t._id);
      }
    }

    res.json({ message: 'Match finalized', match });
  } catch (error) {
    console.error('Error finalizing match:', error);
    res.status(500).json({ message: 'Failed to finalize match' });
  }
});

// ===== Admin: Unfinalize match (unlock for edits) =====
router.put('/tournaments/:id/matches/:matchId/unfinalize', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.tournament) !== String(req.params.id)) return res.status(400).json({ message: 'Match does not belong to this tournament' });
    if (!match.finalized) return res.status(400).json({ message: 'Match is not finalized' });

    // Remove finalized/result state and set status back based on innings
    match.finalized = false;
    const hadResult = !!match.result;
    match.result = undefined;
    if (Array.isArray(match.innings) && match.innings.some(i => (Number(i.balls)||0) > 0)) {
      match.status = 'Live';
    } else {
      match.status = 'Scheduled';
    }
    await match.save();

    // Recalculate standings to remove prior result effect
    try { await recalcStandings(String(match.tournament)); } catch {}

    res.json({ message: 'Match unlocked for editing', match, removedResult: hadResult });
  } catch (error) {
    console.error('Error unfinalizing match:', error);
    res.status(500).json({ message: 'Failed to unlock match' });
  }
});

// ===== Player Management (Admin) =====
// Get all players for admin review
router.get('/players', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { status, club, district, search, page = 1, limit = 20 } = req.query;
    
    let filter = { isActive: true }; // Only show active players by default
    
    // Apply filters
    if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'all') {
      delete filter.isActive; // Show both active and inactive
    }
    
    if (club) {
      if (club === 'none') {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { currentClub: { $exists: false } },
            { currentClub: null }
          ]
        });
      } else {
        filter.currentClub = club;
      }
    }
    
    if (district) {
      filter['address.district'] = new RegExp(district, 'i');
    }
    
    // Add text search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { 'address.city': searchRegex },
          { 'address.district': searchRegex }
        ]
      });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [players, total] = await Promise.all([
      Player.find(filter)
        .populate('user', 'name email')
        .populate('currentClub', 'name clubName district city')
        .populate('applications.club', 'name clubName')
        .select('-documents.data -profilePhoto.data') // Exclude binary data for performance
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Player.countDocuments(filter)
    ]);

    // Transform data for frontend
    const transformedPlayers = players.map(player => ({
      id: player._id,
      fullName: player.fullName,
      email: player.email,
      phone: player.phone,
      age: player.age,
      gender: player.gender,
      dateOfBirth: player.dateOfBirth,
      address: player.address,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      preferredPosition: player.preferredPosition,
      playingExperience: player.playingExperience,
      currentClub: player.currentClub ? {
        id: player.currentClub._id,
        name: player.currentClub.clubName || player.currentClub.name,
        district: player.currentClub.district,
        city: player.currentClub.city
      } : null,
      joinedClubAt: player.joinedClubAt,
      isActive: player.isActive,
      profileCompleted: player.profileCompleted,
      hasProfilePhoto: !!(player.profilePhoto && player.profilePhoto.data),
      statistics: player.statistics,
      applicationsCount: player.applications?.length || 0,
      pendingApplications: player.applications?.filter(app => app.status === 'pending')?.length || 0,
      registeredAt: player.createdAt,
      user: {
        name: player.user?.name,
        email: player.user?.email
      }
    }));

    res.json({ 
      players: transformedPlayers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching players for admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get player details for admin
router.get('/players/:id', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('user', 'name email')
      .populate('currentClub', 'name clubName district city managerName')
      .populate('applications.club', 'name clubName district city')
      .populate('applications.processedBy', 'name email');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Transform data for detailed view
    const playerData = {
      id: player._id,
      fullName: player.fullName,
      email: player.email,
      phone: player.phone,
      age: player.age,
      gender: player.gender,
      dateOfBirth: player.dateOfBirth,
      address: player.address,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      preferredPosition: player.preferredPosition,
      playingExperience: player.playingExperience,
      careerHistory: player.careerHistory,
      currentClub: player.currentClub ? {
        id: player.currentClub._id,
        name: player.currentClub.clubName || player.currentClub.name,
        district: player.currentClub.district,
        city: player.currentClub.city,
        managerName: player.currentClub.managerName
      } : null,
      joinedClubAt: player.joinedClubAt,
      isActive: player.isActive,
      profileCompleted: player.profileCompleted,
      hasProfilePhoto: !!(player.profilePhoto && player.profilePhoto.data),
      statistics: player.statistics,
      applications: player.applications?.map(app => ({
        id: app._id,
        club: {
          id: app.club._id,
          name: app.club.clubName || app.club.name,
          district: app.club.district,
          city: app.club.city
        },
        status: app.status,
        appliedAt: app.appliedAt,
        processedAt: app.processedAt,
        processedBy: app.processedBy ? {
          name: app.processedBy.name,
          email: app.processedBy.email
        } : null,
        rejectionReason: app.rejectionReason,
        approvalNotes: app.approvalNotes
      })) || [],
      documentsCount: player.documents?.length || 0,
      registeredAt: player.createdAt,
      updatedAt: player.updatedAt,
      user: {
        name: player.user?.name,
        email: player.user?.email
      }
    };

    res.json({ player: playerData });
  } catch (error) {
    console.error('Error fetching player details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get player profile photo for admin
router.get('/players/:id/photo', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    if (!player.profilePhoto || !player.profilePhoto.data) {
      return res.status(404).json({ message: 'Profile photo not found' });
    }
    
    // Set content type for image response
    res.set({
      'Content-Type': player.profilePhoto.contentType,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });

    res.send(player.profilePhoto.data);
  } catch (error) {
    console.error('Error fetching player photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deactivate/reactivate player account
router.put('/players/:id/status', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const { isActive, reason } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value' });
    }

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Log the status change
    console.log(`Admin ${req.user.email} ${isActive ? 'activated' : 'deactivated'} player ${player.fullName} (${player.user?.email}). Reason: ${reason || 'No reason provided'}`);

    res.json({ 
      message: `Player ${isActive ? 'activated' : 'deactivated'} successfully`,
      player: {
        id: player._id,
        fullName: player.fullName,
        isActive: player.isActive,
        updatedAt: player.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating player status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get player statistics summary for admin dashboard
router.get('/players/stats', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const [total, active, inactive, withClubs, withoutClubs, pendingApplications] = await Promise.all([
      Player.countDocuments({}),
      Player.countDocuments({ isActive: true }),
      Player.countDocuments({ isActive: false }),
      Player.countDocuments({ currentClub: { $exists: true, $ne: null } }),
      Player.countDocuments({ $or: [{ currentClub: { $exists: false } }, { currentClub: null }] }),
      Player.countDocuments({ 'applications.status': 'pending' })
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await Player.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      stats: {
        total,
        active,
        inactive,
        withClubs,
        withoutClubs,
        pendingApplications,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

// Admin utility: trigger status sync
router.post('/tournaments/status-sync', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await syncTournamentAndMatches(new Date());
    res.json({ message: 'Status sync completed', ...result });
  } catch (e) {
    console.error('Status sync failed', e);
    res.status(500).json({ message: 'Status sync failed' });
  }
});