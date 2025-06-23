import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const PredictForm = () => {
  const [formData, setFormData] = useState({
    Transaction_ID: "",
    Date: "",
    Time: "",
    Amount: "",
    Merchant: "",
    Cardholder_Name: "",
    Card_Number: "",
  });

  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");
  const [isFraud, setIsFraud] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction("");
    setError("");
    setIsFraud(false);
    setIsUploaded(false);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData
      );
      const predictedLabel = response.data.prediction;
      setPrediction(predictedLabel);
      setIsFraud(predictedLabel.toLowerCase() === "fraudulent");
    } catch (err) {
      setError("Prediction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      await axios.post("http://localhost:7000/api/admin/store-fraud", {
        ...formData,
        predictedLabel: prediction,
        timestamp: new Date().toISOString(),
      });
      setIsUploaded(true);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-5">
      <motion.h1
        className="text-center text-primary mb-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        🔎 Credit Card Fraud Detection
      </motion.h1>

      <div className="row shadow p-4 rounded bg-white">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            {[
              { label: "Transaction ID", name: "Transaction_ID", type: "text" },
              { label: "Date", name: "Date", type: "date" },
              { label: "Time", name: "Time", type: "time", step: "1" },
              {
                label: "Amount ($)",
                name: "Amount",
                type: "number",
                step: "0.01",
              },
              { label: "Merchant", name: "Merchant", type: "text" },
              {
                label: "Cardholder Name",
                name: "Cardholder_Name",
                type: "text",
              },
              {
                label: "Card Number",
                name: "Card_Number",
                type: "Number",
                maxLength: 16,
              },
            ].map((field, idx) => (
              <div className="mb-3" key={idx}>
                <label className="form-label">{field.label}</label>
                <input
                  type={field.type}
                  className="form-control"
                  name={field.name}
                  step={field.step || undefined}
                  maxLength={field.maxLength || undefined}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Predicting..." : "Predict Fraud"}
            </button>
          </form>

          {prediction && (
            <motion.div
              className={`alert mt-4 text-center ${
                isFraud ? "alert-danger" : "alert-success"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h5>
                🔍 Prediction: <strong>{prediction}</strong>
              </h5>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="alert alert-danger mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              ❗ {error}
            </motion.div>
          )}

          {isFraud && !isUploaded && (
            <motion.button
              onClick={handleUpload}
              className="btn btn-danger w-100 mt-3"
              disabled={uploading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {uploading ? "Uploading..." : "🚨 Upload Fraud Transaction"}
            </motion.button>
          )}

          {isUploaded && (
            <motion.div
              className="alert alert-info mt-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              ✅ Fraud transaction uploaded successfully!
            </motion.div>
          )}
        </div>

        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <img
            src="/fraud.svg"
            alt="Fraud Detection"
            className="img-fluid"
            style={{ maxHeight: "400px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictForm;
