const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    verifyFace,
    respondToTicket,
    updateTicketStatus,
    getTicketPhoto,
    assignTicket,
    reopenTicket,
    searchSuspect,
    getTicketsByStatus,
} = require('../controllers/ticketController');

// Multer config for suspect photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `suspect_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpg, png, webp) are allowed'));
    },
});

// Citizen routes — any authenticated user can create a ticket or view their own
router.post('/', auth, upload.single('suspectPhoto'), createTicket);
router.get('/my', auth, getMyTickets);

// Police/Admin routes — restricted by role middleware
router.get('/', auth, authorizeRoles('Police', 'Authority', 'Admin'), getAllTickets);

// Search and filter routes (MUST come before :ticketId routes)
router.get('/search/suspect', auth, authorizeRoles('Police', 'Authority', 'Admin'), searchSuspect);
router.get('/status/:status', auth, getTicketsByStatus);

// Routes with dynamic :ticketId — MUST come after static routes like /my
router.post('/:ticketId/verify-face', auth, authorizeRoles('Police', 'Admin'), verifyFace);
router.post('/:ticketId/respond', auth, authorizeRoles('Police', 'Admin'), respondToTicket);
router.post('/:ticketId/reopen', auth, authorizeRoles('Police', 'Authority', 'Admin'), reopenTicket);
router.put('/:ticketId/status', auth, authorizeRoles('Police', 'Authority', 'Admin'), updateTicketStatus);
router.put('/:ticketId/assign', auth, authorizeRoles('Police', 'Admin'), assignTicket);
router.get('/:ticketId/photo', auth, authorizeRoles('Police', 'Authority', 'Admin'), getTicketPhoto);
router.get('/:ticketId', auth, getTicketById);

module.exports = router;
