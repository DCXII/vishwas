const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { faceSearchLookup, getSearchHistory } = require('../controllers/faceSearchController');

// Multer config for face search image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `face_search_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
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

// @route   POST /api/face-search/lookup
// @desc    Upload image to search for related cases and tickets
// @access  Private (Police/Authority/Admin)
router.post('/lookup', auth, authorizeRoles('Police', 'Authority', 'Admin'), upload.single('image'), faceSearchLookup);

// @route   GET /api/face-search/history
// @desc    Get face search history
// @access  Private (Police/Authority/Admin)
router.get('/history', auth, authorizeRoles('Police', 'Authority', 'Admin'), getSearchHistory);

module.exports = router;
