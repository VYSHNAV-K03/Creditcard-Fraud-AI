import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Analytics from "../components/Analytics";
import axiosInstance from "../axiosInstance";
import { motion } from "framer-motion";

const AdminPanel = () => {
  const [organisers, setOrganisers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrganisers = async () => {
      try {
        const response = await axiosInstance.get("/admin/organisers");
        setOrganisers(response.data.reverse());
      } catch (err) {
        setError("❌ Failed to fetch users");
      }
    };
    fetchOrganisers();
  }, []);

  const handleToggleVerification = async (id, isVerified) => {
    try {
      await axiosInstance.patch(`/admin/organisers/${id}/verify`);
      setSuccess(
        `✅ User ${isVerified ? "unverified" : "verified"} successfully`
      );

      setOrganisers(
        organisers.map((org) =>
          org._id === id ? { ...org, isVerified: !org.isVerified } : org
        )
      );
    } catch (err) {
      setError(`❌ Failed to ${isVerified ? "unverify" : "verify"} user`);
    }
  };

  return (
    <div className="container mt-4">
      <motion.h2
        className="text-center text-primary mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🛠️ Admin Panel
      </motion.h2>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {success && (
        <div className="alert alert-success text-center">{success}</div>
      )}

      {/* Fraud Transaction Navigation */}
      <div className="text-end mb-4">
        <button
          className="btn btn-outline-danger"
          onClick={() => navigate("/frauds")}
        >
          🚨 View Fraud Transactions
        </button>
      </div>

      {/* Business Analytics */}
      <Analytics organisers={organisers} />

      {/* Organisers List */}
      <div className="row">
        {organisers.map((org) => (
          <div key={org._id} className="col-md-4 mb-4">
            <motion.div
              className="card shadow-sm h-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="card-body">
                <h5 className="card-title">{org.username}</h5>
                <p className="card-text">
                  <strong>Email:</strong> {org.email}
                </p>
                <p className="card-text">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${
                      org.isVerified ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {org.isVerified ? "Verified" : "Unverified"}
                  </span>
                </p>
                <button
                  className={`btn ${
                    org.isVerified ? "btn-danger" : "btn-success"
                  } mt-2`}
                  onClick={() =>
                    handleToggleVerification(org._id, org.isVerified)
                  }
                >
                  {org.isVerified ? "Unverify" : "Verify"}
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
