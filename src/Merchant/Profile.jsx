import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Profile.css"; // custom CSS file

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    age: "",
    sign_up_as: "",
    shop_name: "",
    shop_address: "",
    gst_number: "",
  });

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      alert("Failed to fetch profile");
      console.error(error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        username: profile.username,
        phone: profile.phone,
        age: profile.age,
        shop_name: profile.shop_name,
        shop_address: profile.shop_address,
        gst_number: profile.gst_number,
      })
      .eq("id", profile.id);

    if (error) {
      alert("Failed to update profile");
    } else {
      alert("✅ Profile updated successfully!");
      setEditMode(false);
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">👤 My Profile</h2>

      <form className="profile-form">
        {/* Username */}
        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            value={profile.username}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* Email (read-only) */}
        <div className="form-group">
          <label>Email (read-only)</label>
          <input value={profile.email} readOnly />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* Age */}
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* Role (read-only) */}
        <div className="form-group">
          <label>Role (read-only)</label>
          <input value={profile.sign_up_as} readOnly />
        </div>

        {/* Shop Name */}
        <div className="form-group">
          <label>Shop Name</label>
          <input
            name="shop_name"
            value={profile.shop_name}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* Shop Address */}
        <div className="form-group">
          <label>Shop Address</label>
          <textarea
            name="shop_address"
            value={profile.shop_address}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* GST Number */}
        <div className="form-group">
          <label>GST Number</label>
          <input
            name="gst_number"
            value={profile.gst_number}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* Buttons */}
        <div className="button-group">
          {!editMode ? (
            <button type="button" onClick={() => setEditMode(true)} className="edit-btn">
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button type="button" onClick={handleSave} className="save-btn">
                💾 Save
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="cancel-btn">
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
