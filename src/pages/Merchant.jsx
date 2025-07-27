import React, { useState } from "react";
import Products from "../Merchant/Products";
import LoanStatus from "../Merchant/LoanStatus";
import ReferLoan from "../Merchant/ReferLoan";
import Profile from "../Merchant/Profile"; // ✅ Make sure file exists here
import { supabase } from "../supabase";
import "../pages/Dashboard.css";

const Merchant = () => {
  const [activeSection, setActiveSection] = useState("loanStatus");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Failed to logout");
    } else {
      window.location.href = "/"; // redirect to login/home
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "products":
        return <Products />;
      case "referLoan":
        return <ReferLoan />;
      case "profile":
        return <Profile />;
      case "loanStatus":
      default:
        return <LoanStatus />;
    }
  };

  return (
    <div className="merchant-dashboard" style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        className="sidebar"
        style={{ width: "250px", background: "#1e293b", color: "#fff", padding: "1rem" }}
      >
        <h2 style={{ marginBottom: "2rem" }}>Merchant</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li
            onClick={() => setActiveSection("products")}
            style={{
              padding: "10px",
              background: activeSection === "products" ? "#334155" : "transparent",
              cursor: "pointer",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            Products
          </li>
          <li
            onClick={() => setActiveSection("loanStatus")}
            style={{
              padding: "10px",
              background: activeSection === "loanStatus" ? "#334155" : "transparent",
              cursor: "pointer",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            Loan Status
          </li>
          <li
            onClick={() => setActiveSection("referLoan")}
            style={{
              padding: "10px",
              background: activeSection === "referLoan" ? "#334155" : "transparent",
              cursor: "pointer",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            Refer Loan
          </li>
          <li
            onClick={() => setActiveSection("profile")}
            style={{
              padding: "10px",
              background: activeSection === "profile" ? "#334155" : "transparent",
              cursor: "pointer",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            Profile
          </li>
          <li
            onClick={handleLogout}
            style={{
              padding: "10px",
              background: "#dc2626",
              color: "#fff",
              cursor: "pointer",
              marginTop: "20px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main Section */}
      <div
        className="content-area"
        style={{ flex: 1, padding: "2rem", background: "#f1f5f9" }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default Merchant;
