const express = require("express");
const User = require("../models/userModel");
const { authMiddleware } = require("../middleware/authMiddleware");
const FraudTransaction = require("../models/FraudTransaction");

const router = express.Router();

// Route to get all unverified event organizers
router.get("/organisers", authMiddleware, async (req, res) => {
  console.log("getAllOrganisers");

  try {
    // Fetch all users who are not admins
    const organisers = await User.find();
    res.json(organisers);
  } catch (err) {
    console.error("Error fetching organisers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to verify an event organizer by ID
router.patch("/organisers/:id/verify", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const organiser = await User.findById(id);
    if (!organiser) {
      return res.status(404).json({ error: "Organiser not found" });
    }

    // Toggle the isVerified field
    organiser.isVerified = !organiser.isVerified;
    await organiser.save();

    res.json({
      message: `Organiser ${
        organiser.isVerified ? "verified" : "unverified"
      } successfully`,
    });
  } catch (err) {
    console.error("Error verifying organiser:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST route to save fraud transaction
router.post("/store-fraud", async (req, res) => {
  try {
    const transaction = new FraudTransaction(req.body);
    await transaction.save();
    res.status(201).json({ message: "Fraud transaction stored successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to store transaction", details: err.message });
  }
});

// Get all fraud transactions
router.get("/store-fraud", async (req, res) => {
  try {
    const frauds = await FraudTransaction.find().sort({ timestamp: -1 });
    res.status(200).json(frauds);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve fraud transactions" });
  }
});

module.exports = router;
