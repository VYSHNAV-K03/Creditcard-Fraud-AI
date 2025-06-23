import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
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
    const { username, email, password, phone } = formData;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;

    if (!username || !email || !password || !phone) return false;
    if (!emailRegex.test(email)) return false;
    if (!phoneRegex.test(phone)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (!validateForm()) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      const response = await axiosInstance.post("/register/user", formData);
      setMessage(response.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row align-items-center shadow p-4 rounded-4 bg-white">
        <div className="col-md-6 mb-4 mb-md-0 text-center">
          <img
            src="/register.svg"
            alt="Register Illustration"
            className="img-fluid rounded"
            style={{ maxHeight: "400px" }}
          />
        </div>
        <div className="col-md-6">
          <h2 className="text-center mb-4">Create Your Account</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className={`form-control ${
                  validated && !formData.username ? "is-invalid" : ""
                }`}
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Username is required.</div>
            </div>
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
              <div className="invalid-feedback">Enter a valid email.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={`form-control ${
                  validated && !formData.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Password is required.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                className={`form-control ${
                  validated && !/^\d{10}$/.test(formData.phone)
                    ? "is-invalid"
                    : ""
                }`}
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Enter a 10-digit phone number.
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
