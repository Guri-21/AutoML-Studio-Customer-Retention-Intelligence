const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/csv', upload.single('dataset'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No CSV file uploaded." });
        }

        const filePath = req.file.path;
        
        const form = new FormData();
        // Read file directly into an explicit buffer to prevent Node.js Axios stream chunking socket hangups on large files
        const fileBuffer = fs.readFileSync(filePath);
        form.append('file', fileBuffer, { filename: req.file.originalname });
        
        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000/api/analyze-csv';
        
        const pythonResponse = await axios.post(pythonApiUrl, form, {
            headers: { ...form.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 120000 // Safely allow up to 2 minutes for the ML processing
        });

        fs.unlinkSync(filePath);

        res.json({
            message: "Successfully analyzed dataset!",
            results: pythonResponse.data
        });

    } catch (error) {
        console.error("Axios Error communicating with Python API:", error.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.status(500).json({ 
            error: "Failed to process the dataset via ML engine.",
            detail: error.response ? error.response.data : error.message 
        });
    }
});

module.exports = router;
