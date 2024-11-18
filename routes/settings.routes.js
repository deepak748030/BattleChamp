const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getSettings,
    updateSettings,
    deleteBannerImage,
} = require('../controllers/settings.controller');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique file naming
    },
});

const upload = multer({ storage });

// Serve uploaded images statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
router.get('/', getSettings); // Fetch settings
router.put('/', upload.single('image'), updateSettings); // Update settings
router.delete('/banner/:index', deleteBannerImage); // Delete a banner image by index


module.exports = router;
