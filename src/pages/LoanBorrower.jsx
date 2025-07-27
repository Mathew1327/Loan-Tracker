import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../pages/Dashboard.css";

const LoanBorrowerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

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
    referred_by: "",
  });

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    username: "",
    phone: "",
    age: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchUserProfile();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data);
    }
  };

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
    } else {
      setUserProfile(data);
      setProfileForm({
        username: data.username || "",
        phone: data.phone || "",
        age: data.age || "",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("user_profiles")
      .update(profileForm)
      .eq("id", user.id);

    if (error) {
      alert("Failed to update profile: " + error.message);
    } else {
      alert("Profile updated successfully.");
      setEditProfile(false);
      fetchUserProfile();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    if (type === "aadhaar") setAadhaarFile(e.target.files[0]);
    else setPanFile(e.target.files[0]);
  };

  const uploadFile = async (file, type) => {
    const ext = file.name.split(".").pop();
    const fileName = `${type}-${uuidv4()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (error) throw error;

    const { publicUrl } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName).data;

    return publicUrl;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const user_id = user?.id;

      const aadhaar_url = aadhaarFile
        ? await uploadFile(aadhaarFile, "aadhaar")
        : "";
      const pan_url = panFile ? await uploadFile(panFile, "pan") : "";

      const { error } = await supabase.from("loans").insert([
        {
          ...formData,
          user_id,
          aadhaar_url,
          pan_url,
        },
      ]);

      if (error) throw error;

      alert("Loan application submitted successfully.");
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
        referred_by: "",
      });
      setAadhaarFile(null);
      setPanFile(null);
      setShowForm(false);
    } catch (err) {
      alert("Error submitting loan: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Loan Borrower Dashboard</h1>
        <div className="profile-area">
          <img
            src="https://img.icons8.com/ios-filled/50/user.png"
            alt="Profile"
            className="profile-icon"
            onClick={() => setShowProfile(!showProfile)}
          />
          {showProfile && userProfile && (
            <div className="profile-dropdown">
              {editProfile ? (
                <>
                  <label>Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                  />
                  <label>Phone:</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                  />
                  <label>Age:</label>
                  <input
                    type="number"
                    name="age"
                    value={profileForm.age}
                    onChange={handleProfileChange}
                  />
                  <button onClick={handleProfileSave}>Save</button>
                  <button onClick={() => setEditProfile(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <p><strong>Username:</strong> {userProfile.username}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                  <p><strong>Phone:</strong> {userProfile.phone || "—"}</p>
                  <p><strong>Age:</strong> {userProfile.age || "—"}</p>
                  <p><strong>Role:</strong> {userProfile.sign_up_as}</p>
                  <button onClick={() => setEditProfile(true)}>Edit Profile</button>
                  <button onClick={() => setShowProfile(false)}>Close</button>
                </>
              )}
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-left">
          <div className="dashboard-card apply-loan">
            <h3>Apply for New Loan</h3>
            <p>Apply quickly with a few details and documents.</p>
            <button className="dashboard-btn" onClick={() => setShowForm(true)}>
              Apply Now
            </button>
          </div>

          <div className="dashboard-card loan-history">
            <h3>My Loan History</h3>
            <p>View your previous loans and repayment status.</p>
            <button className="dashboard-btn">View History</button>
          </div>

          <div className="dashboard-card products">
            <h3>Available Products</h3>
            {products.length === 0 ? (
              <p>No products available right now.</p>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td>{product.name}</td>
                      <td>{product.description || "—"}</td>
                      <td>{product.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showForm && (
          <div className="dashboard-form">
            <h2>Loan Application Form</h2>
            <form onSubmit={handleApply} className="loan-form">
              {[
                { label: "First Name", name: "first_name" },
                { label: "Last Name", name: "last_name" },
                { label: "Date of Birth", name: "dob", type: "date" },
                { label: "Phone", name: "phone" },
                { label: "Address", name: "address" },
                { label: "Occupation", name: "occupation" },
                { label: "Age", name: "age", type: "number" },
                { label: "Monthly Income", name: "monthly_income", type: "number" },
                { label: "Loan Amount", name: "loan_amount", type: "number" },
                { label: "Loan Purpose", name: "loan_purpose" },
                { label: "Aadhaar Number", name: "aadhaar_number" },
                { label: "PAN Number", name: "pan_number" },
                { label: "Referred By (User ID)", name: "referred_by" },
              ].map(({ label, name, type = "text" }) => (
                <div key={name}>
                  <label>{label}:</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={name !== "referred_by"}
                  />
                </div>
              ))}

              <label>Upload Aadhaar File:</label>
              <input type="file" onChange={(e) => handleFileChange(e, "aadhaar")} required />
              <label>Upload PAN File:</label>
              <input type="file" onChange={(e) => handleFileChange(e, "pan")} required />

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "Submit Loan Application"}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanBorrowerDashboard;
