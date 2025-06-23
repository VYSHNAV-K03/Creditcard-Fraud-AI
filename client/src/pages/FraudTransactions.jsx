import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const FraudTransactions = () => {
  const [fraudData, setFraudData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7000/api/admin/store-fraud"
        );
        setFraudData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch fraud transactions.");
        setLoading(false);
      }
    };

    fetchFraudData();
  }, []);

  return (
    <div className="container mt-5">
      <motion.h2
        className="text-center text-danger mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🚨 All Fraud Transactions
      </motion.h2>

      {loading ? (
        <div className="text-center">⏳ Loading...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : fraudData.length === 0 ? (
        <div className="alert alert-warning text-center">
          No fraud transactions found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>Cardholder Name</th>
                <th>Card Number</th>
                <th>Prediction</th>
                <th>Stored At</th>
              </tr>
            </thead>
            <tbody>
              {fraudData.map((txn, index) => (
                <tr key={txn._id}>
                  <td>{index + 1}</td>
                  <td>{txn.Transaction_ID}</td>
                  <td>{txn.Date}</td>
                  <td>{txn.Time}</td>
                  <td>${txn.Amount.toFixed(2)}</td>
                  <td>{txn.Merchant}</td>
                  <td>{txn.Cardholder_Name}</td>
                  <td>{txn.Card_Number}</td>
                  <td className="text-uppercase fw-bold text-danger">
                    {txn.predictedLabel}
                  </td>
                  <td>{new Date(txn.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FraudTransactions;
