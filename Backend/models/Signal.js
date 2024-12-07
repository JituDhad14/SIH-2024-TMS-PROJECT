// models/Signal.js
const mongoose = require('mongoose');

// Define the Schema
const signalSchema = new mongoose.Schema({
    direction: { type: String, required: true },
    green: { type: Number, required: true },
    red: { type: Number, required: true },
    orange: { type: Number, required: true },
});

// Export the Model
module.exports = mongoose.model('Signal', signalSchema);
