import { Router } from 'express';
import multer from 'multer';
import GalleryItem from '../models/GalleryItem.js';
import Club from '../models/Club.js';
import { verifyFirebaseToken, optionalAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// ─── Upload a gallery photo ────────────────────────────────────────
// Club managers: auto-approved
// Players/Coaches: set to pending for moderation
router.post('/upload', verifyFirebaseToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const { caption, category, clubId } = req.body;
        if (!clubId) {
            return res.status(400).json({ message: 'Club ID is required' });
        }

        // Verify the club exists
        const club = await Club.findById(clubId);
        if (!club || club.status !== 'approved') {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Determine uploader role and status
        const userRole = req.user.role;
        let uploaderRole = 'clubManager';
        let status = 'approved'; // default for club managers

        if (userRole === 'clubManager') {
            // Verify this manager owns this club
            if (String(club.manager) !== String(req.user._id)) {
                return res.status(403).json({ message: 'You can only upload to your own club gallery' });
            }
            uploaderRole = 'clubManager';
            status = 'approved';
        } else if (userRole === 'player') {
            // Verify player belongs to this club
            const Player = (await import('../models/Player.js')).default;
            const player = await Player.findOne({ user: req.user._id, currentClub: clubId });
            if (!player) {
                return res.status(403).json({ message: 'You must be a member of this club to upload photos' });
            }
            uploaderRole = 'player';
            status = 'pending';
        } else if (userRole === 'coach') {
            // Verify coach belongs to this club
            const Coach = (await import('../models/Coach.js')).default;
            const coach = await Coach.findOne({ user: req.user._id, currentClub: clubId });
            if (!coach) {
                return res.status(403).json({ message: 'You must be a coach of this club to upload photos' });
            }
            uploaderRole = 'coach';
            status = 'pending';
        } else {
            return res.status(403).json({ message: 'Only club managers, players, and coaches can upload gallery photos' });
        }

        const galleryItem = await GalleryItem.create({
            club: clubId,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            caption: caption?.trim() || '',
            category: category || 'other',
            uploadedBy: req.user._id,
            uploaderRole,
            status
        });

        res.status(201).json({
            message: status === 'approved'
                ? 'Photo uploaded successfully'
                : 'Photo submitted for approval',
            item: {
                id: galleryItem._id,
                caption: galleryItem.caption,
                category: galleryItem.category,
                status: galleryItem.status,
                uploaderRole: galleryItem.uploaderRole,
                createdAt: galleryItem.createdAt
            }
        });
    } catch (error) {
        console.error('Gallery upload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Get approved gallery items for a club (public) ────────────────
router.get('/club/:clubId', async (req, res) => {
    try {
        const { clubId } = req.params;
        const { category, page = 1, limit = 20 } = req.query;

        const filter = { club: clubId, status: 'approved' };
        if (category && category !== 'all') {
            filter.category = category;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await GalleryItem.countDocuments(filter);

        const items = await GalleryItem.find(filter)
            .select('-image') // Don't send binary data in list
            .populate('uploadedBy', 'name')
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const formattedItems = items.map(item => ({
            id: item._id,
            caption: item.caption,
            category: item.category,
            uploaderRole: item.uploaderRole,
            uploadedBy: item.uploadedBy?.name || 'Unknown',
            isFeatured: item.isFeatured,
            imageUrl: `/api/gallery/${item._id}/image`,
            createdAt: item.createdAt
        }));

        res.json({
            items: formattedItems,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Gallery fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Get pending gallery items for moderation (club manager) ───────
router.get('/club/:clubId/pending', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubId } = req.params;

        // Verify the user manages this club
        const club = await Club.findById(clubId);
        if (!club || String(club.manager) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const items = await GalleryItem.find({ club: clubId, status: 'pending' })
            .select('-image')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        const formattedItems = items.map(item => ({
            id: item._id,
            caption: item.caption,
            category: item.category,
            uploaderRole: item.uploaderRole,
            uploadedBy: item.uploadedBy?.name || 'Unknown',
            uploaderEmail: item.uploadedBy?.email,
            imageUrl: `/api/gallery/${item._id}/image`,
            createdAt: item.createdAt
        }));

        res.json({ items: formattedItems });
    } catch (error) {
        console.error('Pending gallery fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Moderate a gallery item (approve/reject) ──────────────────────
router.put('/:id/moderate', verifyFirebaseToken, async (req, res) => {
    try {
        const { action, reason } = req.body; // action: 'approve' or 'reject'
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be "approve" or "reject"' });
        }

        const item = await GalleryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });

        // Verify the user manages this club
        const club = await Club.findById(item.club);
        if (!club || String(club.manager) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        item.status = action === 'approve' ? 'approved' : 'rejected';
        item.moderatedBy = req.user._id;
        item.moderatedAt = new Date();
        if (action === 'reject' && reason) {
            item.rejectionReason = reason;
        }

        await item.save();

        res.json({
            message: `Photo ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            item: {
                id: item._id,
                status: item.status,
                moderatedAt: item.moderatedAt
            }
        });
    } catch (error) {
        console.error('Gallery moderation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Delete a gallery item ─────────────────────────────────────────
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });

        // Verify the user manages this club
        const club = await Club.findById(item.club);
        if (!club || String(club.manager) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await GalleryItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Gallery delete error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Toggle featured status ────────────────────────────────────────
router.put('/:id/feature', verifyFirebaseToken, async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });

        // Verify the user manages this club
        const club = await Club.findById(item.club);
        if (!club || String(club.manager) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        item.isFeatured = !item.isFeatured;
        await item.save();

        res.json({
            message: item.isFeatured ? 'Photo featured' : 'Photo unfeatured',
            isFeatured: item.isFeatured
        });
    } catch (error) {
        console.error('Gallery feature toggle error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Serve gallery image binary ────────────────────────────────────
router.get('/:id/image', async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id).select('image status');
        if (!item || !item.image || !item.image.data) {
            return res.status(404).end();
        }

        // Ensure we have a proper Buffer (Atlas may return BSON Binary)
        let imgData = item.image.data;
        if (imgData.buffer) {
            // BSON Binary object – extract the underlying buffer
            imgData = Buffer.from(imgData.buffer);
        } else if (!(imgData instanceof Buffer)) {
            imgData = Buffer.from(imgData);
        }

        const contentType = item.image.contentType || 'image/jpeg';
        res.set('Content-Type', contentType);
        res.set('Content-Length', imgData.length);
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(imgData);
    } catch (error) {
        console.error('Gallery image serve error:', error);
        return res.status(404).end();
    }
});

export default router;
