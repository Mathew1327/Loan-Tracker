import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    age: "",
    sign_up_as: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

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

      if (error) {
        alert("Failed to fetch profile");
      } else {
        setProfile(data);
      }
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
      })
      .eq("id", profile.id);

    if (error) {
      alert("Failed to update profile");
    } else {
      alert("Profile updated successfully!");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", background: "#fff", padding: "2rem", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>My Profile</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={profile.username}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Email (read-only)</label>
        <input type="text" value={profile.email} readOnly className="input" />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Phone</label>
        <input
          type="text"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Age</label>
        <input
          type="number"
          name="age"
          value={profile.age}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Role (read-only)</label>
        <input type="text" value={profile.sign_up_as} readOnly className="input" />
      </div>
      <button
        onClick={handleSave}
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
};

export default Profile;
