const express = require('express');
const router = express.Router();
const shorturlController = require('../controllers/shorturlController');

// API Endpoints Specification

// Create Short URL
router.post('/shorturls', shorturlController.createShortUrl);

// Retrieve Short URL Statistics
router.get('/shorturls/:shortcode', shorturlController.getShortUrlStatistics);

module.exports = router;