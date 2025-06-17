const mongoose = require('mongoose');


module.exports = mongoose.model('User', new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    createdAt: {
    type: Date,
    default: Date.now
  },
    bio: String,
    about: {
        address: String,
        extra1: String,
        extra2: String
    },

    friends: [{
      name: String
    }]

}));