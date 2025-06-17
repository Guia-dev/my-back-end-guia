require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'https://runningtypegame.netlify.app',
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

// Mongoose model
const Notes = require('./models/Notes');

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// ✅ API Routes
app.get('/api/my-back-end/notes', async (req, res) => {
  try {
    const notes = await Notes.find().sort({ createdAt: 1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/my-back-end/notes', async (req, res) => {
 const {content, user} = req.body;
 try{
  const newNote = new Notes({content, user});
  await newNote.save();
  res.json(newNote);
 }catch(error) {
  console.error('Error saving note:', error);
  res.status(500).json({ message: 'Internal server error' });
 }
});


// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
