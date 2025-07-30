import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./LoanBorrowerDashboard.css";

const LoanBorrowerDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("products");
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    phone: "",
    address: "",
    occupation: "",
    age: "",
    monthly_income: "",
    loan_amount: "",
    loan_purpose: "",
    aadhaar_number: "",
    pan_number: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ username: "", phone: "", age: "" });

  useEffect(() => {
    fetchUserProfile();
    fetchProducts();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();

    if (!error) {
      setUserProfile(data);
      setProfileEdit({ username: data.username || "", phone: data.phone || "", age: data.age || "" });
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleProfileChange = (e) => {
    setProfileEdit({ ...profileEdit, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("user_profiles")
      .update(profileEdit)
      .eq("id", userProfile.id);

    if (!error) {
      alert("Profile updated successfully");
      setEditMode(false);
      fetchUserProfile();
    } else {
      alert("Failed to update");
    }
  };

  const handleLoanChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    const submission = {
      ...formData,
      user_id: user.id,
      age: parseInt(formData.age),
      monthly_income: parseFloat(formData.monthly_income),
      loan_amount: parseFloat(formData.loan_amount),
      review_status: "pending",          // Set default
      referred_by: null                  // Set null if not referred
    };

    const { error } = await supabase.from("loans").insert([submission]);

    if (!error) {
      alert("Loan Application Submitted");
      setFormData({
        first_name: "",
        last_name: "",
        dob: "",
        phone: "",
        address: "",
        occupation: "",
        age: "",
        monthly_income: "",
        loan_amount: "",
        loan_purpose: "",
        aadhaar_number: "",
        pan_number: "",
      });
    } else {
      console.error("Loan insert error:", error);
      console.log("Submitted data:", submission);
      alert("Submission Failed: " + error.message);
    }
  };

  return (
    <div className="borrower-dashboard">
      <aside className="sidebar">
        <h2>Borrower Panel</h2>
        <ul>
          <li onClick={() => setActiveSection("products")}>Available Products</li>
          <li onClick={() => setActiveSection("loan")}>Apply for Loan</li>
          <li onClick={() => setActiveSection("profile")}>Profile</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeSection === "products" && (
          <>
            <h2>Available Products</h2>
            <div className="product-grid">
              {products.map((prod) => (
                <div key={prod.product_id} className="product-card">
                  <h3>{prod.name}</h3>
                  <p>{prod.description}</p>
                  <p>₹{prod.price}</p>
                  <button>Buy</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === "loan" && (
          <div className="loan-form">
            <h2>Apply for Loan</h2>
            <form onSubmit={handleLoanSubmit}>
              {[{ name: "first_name", placeholder: "First Name" },
                { name: "last_name", placeholder: "Last Name" },
                { name: "dob", placeholder: "Date of Birth", type: "date" },
                { name: "phone", placeholder: "Phone" },
                { name: "address", placeholder: "Address" },
                { name: "occupation", placeholder: "Occupation" },
                { name: "age", placeholder: "Age", type: "number" },
                { name: "monthly_income", placeholder: "Monthly Income", type: "number" },
                { name: "loan_amount", placeholder: "Loan Amount", type: "number" },
                { name: "loan_purpose", placeholder: "Loan Purpose" },
                { name: "aadhaar_number", placeholder: "Aadhaar Number" },
                { name: "pan_number", placeholder: "PAN Number" }].map(({ name, placeholder, type = "text" }) => (
                  <input
                    key={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleLoanChange}
                    required
                  />
              ))}
              <button type="submit">Submit Loan Application</button>
            </form>
          </div>
        )}

        {activeSection === "profile" && userProfile && (
          <div className="profile-section">
            <h2>My Profile</h2>
            {editMode ? (
              <>
                <input
                  name="username"
                  placeholder="Username"
                  value={profileEdit.username}
                  onChange={handleProfileChange}
                />
                <input
                  name="phone"
                  placeholder="Phone"
                  value={profileEdit.phone}
                  onChange={handleProfileChange}
                />
                <input
                  name="age"
                  placeholder="Age"
                  type="number"
                  value={profileEdit.age}
                  onChange={handleProfileChange}
                />
                <button onClick={handleSaveProfile}>Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Username:</strong> {userProfile.username}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Phone:</strong> {userProfile.phone || "—"}</p>
                <p><strong>Age:</strong> {userProfile.age || "—"}</p>
                <p><strong>Role:</strong> {userProfile.sign_up_as}</p>
                <button onClick={() => setEditMode(true)}>Edit</button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LoanBorrowerDashboard;
