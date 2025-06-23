import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(formData.email) && formData.password.length >= 4;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (!validateForm()) {
      setError("Please enter a valid email and password (min 4 characters).");
      return;
    }

    try {
      const response = await axiosInstance.post("/login", formData);
      setMessage(response.data.message);
      setError("");

      const user = response.data.user;

      if (user.isVerified === false) {
        setMessage("Please verify your account before logging in.");
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row align-items-center shadow p-4 rounded-4 bg-white">
        <div className="col-md-6 text-center mb-4 mb-md-0">
          <img
            src="/login.svg"
            alt="Login Illustration"
            className="img-fluid rounded"
            style={{ maxHeight: "400px" }}
          />
        </div>
        <div className="col-md-6">
          <h2 className="text-center mb-4">Login to Your Account</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${
                  validated && !/^\S+@\S+\.\S+$/.test(formData.email)
                    ? "is-invalid"
                    : ""
                }`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Enter a valid email address.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={`form-control ${
                  validated && formData.password.length < 4 ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Password must be at least 4 characters long.
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
