const mongoose = require('mongoose');

module.exports = mongoose.model('Feedback', new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  email: { type: String, required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String }
}, { timestamps: true }));
