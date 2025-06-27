require("dotenv").config();
const express = require("express");
const PubNub = require("pubnub");
const cors = require("cors");
const mongoose = require('mongoose');

const app = express();
const allowedOrigins = [
  'https://guiaworks.netlify.app',
  'http://192.168.5.188:5173',
  'https://localhost:5173'
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

const Feedback = require('./models/Feedback');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const newFeedback = new Feedback({
      name: req.body.name,
      company: req.body.company,
      email: req.body.email,
      stars: req.body.stars,
      feedback: req.body.feedback
    });

    await newFeedback.save();
    res.json(newFeedback);
  } catch (err) {
    console.error('Error creating feedback:', err);
   res.status(500).json({ message: 'Failed to create feedback', error: err.message });

  }
});

// PubNub setup
const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUB,
  subscribeKey: process.env.PUBNUB_SUB,
  uuid: "backend-watcher",
  storeInHistory: true
});

pubnub.subscribe({ channels: ["chat-Alex-05252007"] });

pubnub.addListener({
  message: async (event) => {
    const { message, channel } = event;

    if (message.user !== "Alex-05252007") return;

    const targetClient = message?.target;
    if (!targetClient) return;

    const clientChannel = `chat-${targetClient}`;

    try {
      await pubnub.publish({
        channel: clientChannel,
        message: {
          user: "Alex-05252007",
          text: message.text,
        },
        storeInHistory: true
      });
      console.log(`✅ Relayed to ${clientChannel}: ${message.text}`);
    } catch (err) {
      console.error("❌ Relay failed:", err);
    }
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ PubNub backend is running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});
