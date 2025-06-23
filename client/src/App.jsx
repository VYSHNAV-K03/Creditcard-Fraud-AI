import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import DoctorRegisterPage from "./pages/DoctorRegisterPage";
import AdminPanel from "./pages/Admin";
import Profile from "./pages/Profile";
import PredictForm from "./pages/CreditCard";
import FraudTransactions from "./pages/FraudTransactions";

const App = () => {
  return (
    <Router>
      <div className="bg-custom vh-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-doctor" element={<DoctorRegisterPage />} />
          <Route path="/dashboard" element={<PredictForm />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/frauds" element={<FraudTransactions />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
