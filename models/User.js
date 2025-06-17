const mongoose = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  about: {
    address: String,
    extra1: String,
    extra2: String
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}));
