const mongoose = require("mongoose");

const FraudTransactionSchema = new mongoose.Schema({
  Transaction_ID: String,
  Date: String,
  Time: String,
  Amount: Number,
  Merchant: String,
  Cardholder_Name: String,
  Card_Number: String,
  predictedLabel: String,
  timestamp: String,
});

module.exports = mongoose.model("FraudTransaction", FraudTransactionSchema);
