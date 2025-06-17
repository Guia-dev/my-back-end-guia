const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  content: String,
  user: String, // or use user ID if you want to relate via _id
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', NoteSchema);
