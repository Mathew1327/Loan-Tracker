import React, { useEffect, useState } from "react";
import LoanApplicants from "./LoanApplicants";
import ApprovedLoans from "./ApprovedLoans";
import { Pie, Line } from "react-chartjs-2";
import { supabase } from "../supabase";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from "chart.js";
import "./NBFCAdminDashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const NBFCAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("loanInsights");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [spending, setSpending] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [monthlyChange, setMonthlyChange] = useState({
    earnings: 12,
    spending: 8,
    wallet: 5,
  });

  useEffect(() => {
    fetchProfile();
    fetchLoanStats();
    fetchDashboardMetrics();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
  };

  const fetchLoanStats = async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("loan_purpose, created_at");

    if (error || !data) return;

    // Pie chart data (loan purpose distribution)
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
            "#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0", "#9966FF", "#FF9F40",
          ],
        },
      ],
    });

    // Line chart data (loans per month)
    const monthlyData = {};
    data.forEach((loan) => {
      const date = new Date(loan.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    setLineData({
      labels: sortedMonths,
      datasets: [
        {
          label: "Monthly Loan Growth",
          data: sortedMonths.map((key) => monthlyData[key]),
          fill: false,
          borderColor: "#36A2EB",
          tension: 0.3,
        },
      ],
    });
  };

  const fetchDashboardMetrics = async () => {
    // Placeholder values, replace with real Supabase logic later
    setEarnings(125000);
    setSpending(78000);
    setWalletBalance(47000);
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

  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h2>NBFC Admin</h2>
        <ul>
          <li className={activeTab === "loanInsights" ? "active" : ""} onClick={() => setActiveTab("loanInsights")}>Dashboard</li>
          <li className={activeTab === "loanApplicants" ? "active" : ""} onClick={() => setActiveTab("loanApplicants")}>Loan Applicants</li>
          <li className={activeTab === "approvedLoans" ? "active" : ""} onClick={() => setActiveTab("approvedLoans")}>Approved Loans</li>
          <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {activeTab === "loanApplicants" && <LoanApplicants />}
        {activeTab === "approvedLoans" && <ApprovedLoans />}

        {activeTab === "loanInsights" && (
          <>
            <div className="dashboard-cards">
              <div className="card">
                <h4>Total Loan Requested</h4>
                <p>₹{earnings.toLocaleString()}</p>
                <span className="positive">+{monthlyChange.earnings}% this month</span>
              </div>
              <div className="card">
                <h4>Total Amount Approved</h4>
                <p>₹{spending.toLocaleString()}</p>
                <span className="negative">+{monthlyChange.spending}% this month</span>
              </div>

            </div>

            <div className="chart-section">
              <div className="chart-box">
                <h3>Loan Purpose Distribution</h3>
                {chartData ? <Pie data={chartData} /> : <p>Loading chart...</p>}
              </div>
              <div className="chart-box">
                <h3>Monthly Loan Growth</h3>
                {lineData ? <Line data={lineData} /> : <p>Loading chart...</p>}
              </div>
            </div>
          </>
        )}

        {activeTab === "profile" && profile && (
          <div className="profile-form">
            <h3>My Profile</h3>
            <div className="profile-field">
              <label>Username</label>
              <input name="username" value={profile.username} disabled={!editMode} onChange={handleProfileChange} />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input value={profile.email} disabled />
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input name="phone" value={profile.phone} disabled={!editMode} onChange={handleProfileChange} />
            </div>
            <div className="profile-field">
              <label>Age</label>
              <input name="age" value={profile.age} type="number" disabled={!editMode} onChange={handleProfileChange} />
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
