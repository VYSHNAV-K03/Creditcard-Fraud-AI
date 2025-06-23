const { Deepgram } = require("@deepgram/sdk");
require("dotenv").config();

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY, {
  apiUrl: "https://api.deepgram.com"
});

console.log("Deepgram initialized successfully!");
