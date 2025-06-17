require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'https://runningtypegame.netlify.app',
  'https://note-app-guia.netlify.app',
  'http://192.168.5.188:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
}));

app.use(express.json());

// ✅ Mongoose model
const User = require('./models/User');

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Create new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      bio: req.body.bio,
      about: req.body.about,
      friends: req.body.friends,
    });

    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// ✅ Send Friend Request
app.post('/api/users/:targetId/send-request', async (req, res) => {
  const { senderId } = req.body;
  const { targetId } = req.params;

  try {
    const sender = await User.findById(senderId);
    const target = await User.findById(targetId);

    if (!sender || !target)
      return res.status(404).json({ message: 'User not found' });

    if (
      target.friendRequests.includes(senderId) ||
      target.friends.includes(senderId)
    )
      return res.status(400).json({ message: 'Already sent or already friends' });

    target.friendRequests.push(senderId);
    sender.sentRequests.push(targetId);

    await target.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Accept Friend Request
app.post('/api/users/:targetId/accept-request', async (req, res) => {
  const { senderId } = req.body;
  const { targetId } = req.params;

  try {
    const target = await User.findById(targetId); // current user
    const sender = await User.findById(senderId); // who sent request

    if (!target.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    target.friends.push(senderId);
    sender.friends.push(targetId);

    target.friendRequests = target.friendRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== targetId);

    await target.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Decline Friend Request
app.post('/api/users/:targetId/decline-request', async (req, res) => {
  const { senderId } = req.body;
  const { targetId } = req.params;

  try {
    const target = await User.findById(targetId);
    const sender = await User.findById(senderId);

    target.friendRequests = target.friendRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== targetId);

    await target.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request declined' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Single User by ID with populated friends
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends', 'name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Profile (email, bio, about)
app.put('/api/users/:id/update-profile', async (req, res) => {
  const { email, bio, address, extra1, extra2 } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        email,
        bio,
        about: {
          address,
          extra1,
          extra2
        }
      },
      { new: true } // return updated document
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
