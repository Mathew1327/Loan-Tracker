import React, { useEffect, useState } from "react";
import LoanApplicants from "./LoanApplicants";
import ApprovedLoans from "./ApprovedLoans";
import { Pie } from "react-chartjs-2";
import { supabase } from "../supabase";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./NBFCAdminDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const NBFCAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("loanApplicants");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchLoanStats();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile(data);
      }
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        username: profile.username,
        phone: profile.phone,
        age: profile.age,
      })
      .eq("id", profile.id);

    if (!error) {
      alert("Profile updated");
      setEditMode(false);
    } else {
      alert("Error updating profile");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const fetchLoanStats = async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("loan_purpose");

    if (error || !data) return;

    const purposeCount = {};
    data.forEach((loan) => {
      const type = loan.loan_purpose || "Other";
      purposeCount[type] = (purposeCount[type] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(purposeCount),
      datasets: [
        {
          label: "Loan Distribution",
          data: Object.values(purposeCount),
          backgroundColor: [
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    });
  };

  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h2>NBFC Admin</h2>
        <ul>
          <li
            className={activeTab === "loanApplicants" ? "active" : ""}
            onClick={() => setActiveTab("loanApplicants")}
          >
            Loan Applicants
          </li>
          <li
            className={activeTab === "approvedLoans" ? "active" : ""}
            onClick={() => setActiveTab("approvedLoans")}
          >
            Approved Loans
          </li>
          <li
            className={activeTab === "loanInsights" ? "active" : ""}
            onClick={() => setActiveTab("loanInsights")}
          >
            Loan Insights
          </li>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {activeTab === "loanApplicants" && <LoanApplicants />}
        {activeTab === "approvedLoans" && <ApprovedLoans />}

        {activeTab === "loanInsights" && (
          <div className="chart-container">
            <h3>Loan Type Distribution</h3>
            {chartData ? (
              <Pie data={chartData} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
        )}

        {activeTab === "profile" && profile && (
          <div className="profile-form">
            <h3>My Profile</h3>
            <div className="profile-field">
              <label>Username</label>
              <input
                name="username"
                value={profile.username}
                disabled={!editMode}
                onChange={handleProfileChange}
              />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input value={profile.email} disabled />
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input
                name="phone"
                value={profile.phone}
                disabled={!editMode}
                onChange={handleProfileChange}
              />
            </div>
            <div className="profile-field">
              <label>Age</label>
              <input
                name="age"
                value={profile.age}
                type="number"
                disabled={!editMode}
                onChange={handleProfileChange}
              />
            </div>

            {editMode ? (
              <button onClick={saveProfile}>Save</button>
            ) : (
              <button onClick={() => setEditMode(true)}>Edit</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NBFCAdminDashboard;
