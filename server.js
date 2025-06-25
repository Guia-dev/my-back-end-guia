require("dotenv").config();
const express = require("express");
const PubNub = require("pubnub");
const cors = require("cors");

const app = express();
const allowedOrigins = [
  'https://guiaworks.netlify.app',
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

// PubNub setup
const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUB,
  subscribeKey: process.env.PUBNUB_SUB,
  uuid: "backend-watcher",
  storeInHistory: true
});

// Subscribing to the admin channel
pubnub.subscribe({ channels: ["chat-Alex-05252007"] });

pubnub.addListener({
  message: async (event) => {
    const { message, channel } = event;

    // If it's not from admin, ignore it
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
