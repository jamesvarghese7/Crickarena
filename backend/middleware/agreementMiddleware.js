import User from '../models/User.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import SponsorshipAgreement from '../models/SponsorshipAgreement.js';

/**
 * Middleware to load user from firebaseUid (query or body)
 * Attaches user to req.agreementUser
 */
export async function loadUserFromFirebaseUid(req, res, next) {
    try {
        const firebaseUid = req.body.firebaseUid || req.query.firebaseUid;

        if (!firebaseUid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.agreementUser = user;
        next();
    } catch (error) {
        console.error('Load user middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

/**
 * Middleware to load agreement by ID from params
 * Attaches agreement to req.agreement
 * Requires loadUserFromFirebaseUid to run first
 */
export async function loadAgreement(req, res, next) {
    try {
        const agreementId = req.params.id;

        if (!agreementId) {
            return res.status(400).json({ error: 'Agreement ID required' });
        }

        const agreement = await SponsorshipAgreement.findById(agreementId)
            .populate('sponsor.sponsorRef', 'companyName contactPerson contactEmail logoUrl user')
            .populate('club.clubRef', 'name district logo homeGround manager')
            .populate('deal');

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        req.agreement = agreement;
        next();
    } catch (error) {
        console.error('Load agreement middleware error:', error);
        res.status(500).json({ error: 'Failed to load agreement' });
    }
}

/**
 * Middleware to verify user has access to the agreement
 * Determines if user is sponsor, club manager, or admin
 * Attaches access info to req.agreementAccess
 * Requires loadUserFromFirebaseUid and loadAgreement to run first
 */
export async function verifyAgreementAccess(req, res, next) {
    try {
        const user = req.agreementUser;
        const agreement = req.agreement;

        if (!user || !agreement) {
            return res.status(500).json({ error: 'Missing user or agreement context' });
        }

        // Check if user is sponsor
        const sponsor = await Sponsor.findOne({ user: user._id });
        const isSponsor = sponsor &&
            agreement.sponsor.sponsorRef._id.toString() === sponsor._id.toString();

        // Check if user is club manager
        const club = await Club.findOne({ manager: user._id });
        const isClubManager = club &&
            agreement.club.clubRef._id.toString() === club._id.toString();

        // Check if admin
        const isAdmin = user.role === 'admin';

        if (!isSponsor && !isClubManager && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        req.agreementAccess = {
            isSponsor,
            isClubManager,
            isAdmin,
            sponsor,
            club
        };

        next();
    } catch (error) {
        console.error('Verify access middleware error:', error);
        res.status(500).json({ error: 'Access verification failed' });
    }
}

/**
 * Middleware to require club manager role for the agreement
 * Requires loadUserFromFirebaseUid to run first
 */
export async function requireClubManager(req, res, next) {
    try {
        const user = req.agreementUser;

        const club = await Club.findOne({ manager: user._id });
        if (!club) {
            return res.status(403).json({ error: 'Only club managers can perform this action' });
        }

        req.agreementAccess = {
            ...req.agreementAccess,
            isClubManager: true,
            club
        };

        next();
    } catch (error) {
        console.error('Require club manager error:', error);
        res.status(500).json({ error: 'Authorization failed' });
    }
}

/**
 * Middleware to require sponsor role for the agreement
 * Requires loadUserFromFirebaseUid to run first
 */
export async function requireSponsor(req, res, next) {
    try {
        const user = req.agreementUser;

        const sponsor = await Sponsor.findOne({ user: user._id });
        if (!sponsor) {
            return res.status(403).json({ error: 'Only sponsors can perform this action' });
        }

        req.agreementAccess = {
            ...req.agreementAccess,
            isSponsor: true,
            sponsor
        };

        next();
    } catch (error) {
        console.error('Require sponsor error:', error);
        res.status(500).json({ error: 'Authorization failed' });
    }
}

/**
 * Helper to verify sponsor owns the agreement
 * Use after requireSponsor and loadAgreement
 */
export function verifySponsorOwnsAgreement(req, res, next) {
    const sponsor = req.agreementAccess?.sponsor;
    const agreement = req.agreement;

    if (!sponsor || agreement.sponsor.sponsorRef._id.toString() !== sponsor._id.toString()) {
        return res.status(403).json({ error: 'Access denied - not your agreement' });
    }

    next();
}

/**
 * Helper to verify club manager owns the agreement
 * Use after requireClubManager and loadAgreement
 */
export function verifyClubOwnsAgreement(req, res, next) {
    const club = req.agreementAccess?.club;
    const agreement = req.agreement;

    if (!club || agreement.club.clubRef._id.toString() !== club._id.toString()) {
        return res.status(403).json({ error: 'Access denied - not your agreement' });
    }

    next();
}
