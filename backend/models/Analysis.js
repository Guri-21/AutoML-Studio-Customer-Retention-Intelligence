const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    filename: { type: String, required: true },
    rowsProcessed: { type: Number },
    columnsProcessed: { type: Number },
    results: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
