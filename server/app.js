const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const user = require("./models/userModel");
const path = require("path");
const upload = require("./config/multerConfig");
const app = express();
const axios = require("axios");
const fs = require("fs");
const { Deepgram } = require("@deepgram/sdk");
const { OpenAI } = require("openai");

dotenv.config();

connectDB();

// Middleware for parsing JSON

// Enable CORS for cross-origin requests
app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
// Hardcoded admin registration

const createAdmin = async () => {
  try {
    const existingAdmin = await user.findOne({
      username: "admin",
      role: "admin",
    });
    if (!existingAdmin) {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10); // Generate a salt
      const hashedPassword = await bcrypt.hash("1234", salt); // Hash the password

      const admin = new user({
        username: "admin",
        email: "admin@gmail.com",
        password: hashedPassword, // Save the hashed password
        phone: "1234567890",
        isVerified: true,
        isAdmin: true,
        role: "admin",
      });
      await admin.save();
      console.log("Hardcoded admin created.");
    } else {
      console.log("Admin already exists.");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

createAdmin();

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running on port 6000");
});

app.use("/", require("./routes/aiRoutes"));
app.use("/api", require("./routes/auth"));
// app.use('/api/reports', require('./routes/reportUpload'));
app.use("/api/admin", require("./routes/adminRoutes"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  const audioPath = req.file.path;
  const apiKey =
    "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";

  const formData = new FormData();
  formData.append("file", fs.createReadStream(audioPath));
  formData.append("model", "whisper-1");
  formData.append("language", "en"); // Change for different language

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    res.json({ transcript: response.data.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(audioPath); // Clean up the uploaded file
  }
});
// // Hugging Face API details
// const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-xlsr-53";
// const HF_API_KEY = process.env.HF_API_KEY;

// console.log(HF_API_KEY);

// // Endpoint to process lip reading
// app.post("/lip-read", upload.single("video"), async (req, res) => {
//     try {
//         const videoPath = req.file.path;
//         const videoData = fs.readFileSync(videoPath);

//         // Send request to Hugging Face API
//         const response = await axios.post(HF_API_URL, videoData, {
//             headers: {
//                 "Authorization": `Bearer ${HF_API_KEY}`,
//                 "Content-Type": "video/mp4",
//             },
//         });

//         // Delete uploaded video after processing
//         fs.unlinkSync(videoPath);

//         res.json({ predictedText: response.data });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error processing video" });
//     }
// });

// // Deepgram API
// const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

// // MongoDB Model for Lip Sync Analysis
// const LipSyncData = mongoose.model("LipSyncData", new mongoose.Schema({
//   lipData: Array,
//   speechText: String,
//   syncScore: Number,
//   createdAt: { type: Date, default: Date.now }
// }));

// // 🟢 API: Upload & Transcribe Audio
// app.post("/api/upload-audio", upload.single("audio"), async (req, res) => {
//   const filePath = req.file.path;
//   const audioBuffer = require("fs").readFileSync(filePath);

//   try {
//       const response = await deepgram.transcription.preRecorded(
//           { buffer: audioBuffer, mimetype: "audio/wav" },
//           { punctuate: true }
//       );
//       const transcript = response.results.channels[0].alternatives[0].transcript;
//       res.json({ transcript });
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// });

// // 🟢 API: Analyze Lip Sync
// app.post("/api/lip-sync", async (req, res) => {
//   const { lipData } = req.body;

//   // Get the latest transcribed text
//   const latestTranscription = await LipSyncData.findOne().sort({ createdAt: -1 });

//   // Simple Lip Sync Analysis: (TODO: Replace with AI-based comparison)
//   let syncScore = 0;
//   if (latestTranscription) {
//       const words = latestTranscription.speechText.split(" ");
//       syncScore = (lipData.length / words.length) * 100; // Rough percentage match
//   }

//   const newLipSync = new LipSyncData({ lipData, speechText: latestTranscription?.speechText || "", syncScore });
//   await newLipSync.save();

//   res.json({ syncScore });
// });

// Listen on port 6000
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
