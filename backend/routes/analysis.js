const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');

// Save analysis result
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { filename, rowsProcessed, columnsProcessed, results } = req.body;
        
        // Fix for MongoDB 16MB limit: Save large results to disk and keep the path
        const resultId = new mongoose.Types.ObjectId();
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        
        const resultsPath = path.join(uploadsDir, `results_${resultId}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(results));

        const analysis = await Analysis.create({
            _id: resultId,
            userId: req.userId,
            filename,
            rowsProcessed,
            columnsProcessed,
            results: resultsPath // Store path instead of massive JSON
        });
        res.status(201).json({ id: analysis._id, message: 'Analysis saved.' });
    } catch (err) {
        console.error('Save Analysis Error:', err);
        res.status(500).json({ error: 'Failed to save analysis.' });
    }
});

// List user's analyses
router.get('/', authMiddleware, async (req, res) => {
    try {
        const analyses = await Analysis.find({ userId: req.userId })
            .select('filename rowsProcessed columnsProcessed createdAt')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ analyses });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch analyses.' });
    }
});

// Get single analysis
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
        if (!analysis) return res.status(404).json({ error: 'Analysis not found.' });

        let resultsData = analysis.results;
        if (typeof analysis.results === 'string' && analysis.results.endsWith('.json')) {
            try {
                const fileContent = fs.readFileSync(analysis.results, 'utf8');
                resultsData = JSON.parse(fileContent);
            } catch (fsErr) {
                console.error("Failed to read results file:", fsErr);
            }
        }

        const responseObj = analysis.toObject();
        responseObj.results = resultsData;

        res.json({ analysis: responseObj });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch analysis.' });
    }
});

// Delete analysis
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Analysis deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete analysis.' });
    }
});

module.exports = router;
