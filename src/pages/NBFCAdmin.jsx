import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./NBFCAdminDashboard.css";

const NBFCAdminDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    fetchLoans();
    fetchProfile();
  }, []);

  const fetchLoans = async () => {
    const { data, error } = await supabase.from("loans").select("*");
    if (!error) setLoans(data);
    else console.error("Error fetching loans", error);
  };

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error) setProfileData(data);
    }
  };

  const updateProfile = async () => {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        username: profileData.username,
        phone: profileData.phone,
        age: profileData.age,
      })
      .eq("id", profileData.id);

    if (!error) {
      alert("Profile updated successfully");
      setEditingProfile(false);
    } else {
      alert("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="admin-dashboard">
      <div className="header">
        <h1>Loan Applicants</h1>
        <div className="profile-icon" onClick={() => setShowProfile(true)}>
          👤
        </div>
      </div>

      <table className="loan-table">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Loan Amount</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{`${loan.first_name} ${loan.last_name}`}</td>
              <td>${Number(loan.loan_amount).toLocaleString()}</td>
              <td>{loan.created_at?.split("T")[0]}</td>
              <td>
                <span className={`status-badge ${loan.review_status}`}>
                  {loan.review_status}
                </span>
              </td>
              <td>
                <button onClick={() => setSelectedLoan(loan)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLoan && (
        <div className="modal">
          <div className="modal-content">
            <h2>Applicant Details</h2>
            <p><strong>Name:</strong> {selectedLoan.first_name} {selectedLoan.last_name}</p>
            <p><strong>Email:</strong> {selectedLoan.email || "N/A"}</p>
            <p><strong>Phone:</strong> {selectedLoan.phone}</p>
            <p><strong>Address:</strong> {selectedLoan.address}</p>
            <p><strong>Loan Amount:</strong> ${Number(selectedLoan.loan_amount).toLocaleString()}</p>
            <p><strong>Application Date:</strong> {selectedLoan.created_at?.split("T")[0]}</p>
            <p><strong>Status:</strong> {selectedLoan.review_status}</p>
            <div className="modal-actions">
              <button className="approve" onClick={() => updateLoanStatus(selectedLoan.id, "approved")}>Approve</button>
              <button className="reject" onClick={() => updateLoanStatus(selectedLoan.id, "rejected")}>Reject</button>
              <button className="close" onClick={() => setSelectedLoan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && profileData && (
        <div className="modal">
          <div className="modal-content">
            <h2>Admin Profile</h2>
            {editingProfile ? (
              <>
                <label>Username:</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                />
                <label>Email:</label>
                <input type="email" value={profileData.email} disabled />
                <label>Sign Up As:</label>
                <input type="text" value={profileData.sign_up_as} disabled />
                <label>Phone:</label>
                <input
                  type="text"
                  value={profileData.phone || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
                <label>Age:</label>
                <input
                  type="number"
                  value={profileData.age || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, age: e.target.value })
                  }
                />
                <div className="modal-actions">
                  <button onClick={updateProfile}>Save</button>
                  <button onClick={() => setEditingProfile(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p><strong>Username:</strong> {profileData.username}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Sign Up As:</strong> {profileData.sign_up_as}</p>
                <p><strong>Phone:</strong> {profileData.phone || "N/A"}</p>
                <p><strong>Age:</strong> {profileData.age || "N/A"}</p>
                <div className="modal-actions">
                  <button onClick={() => setEditingProfile(true)}>Edit</button>
                  <button onClick={() => setShowProfile(false)}>Close</button>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NBFCAdminDashboard;
