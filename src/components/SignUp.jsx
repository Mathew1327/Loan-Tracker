import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // ✅ Apply the common CSS

const SignUp = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    sign_up_as: "Loan Borrower",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { email, password, username, phone, age, sign_up_as } = formData;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    const { error: dbError } = await supabase.from("user_profiles").insert([
      {
        id: user.id,
        email,
        username,
        phone,
        age: parseInt(age),
        sign_up_as,
      },
    ]);

    if (dbError) {
      alert("Signed up but failed to save user data: " + dbError.message);
      return;
    }

    if (sign_up_as === "Loan Borrower") navigate("/loan-borrower");
    else if (sign_up_as === "Merchant") navigate("/merchant");
    else if (sign_up_as === "NBFC Admin") navigate("/nbfc-admin");
  };

  return (
    <div className="auth-form-box">
      <h2>Create Account</h2>
      <p>Fill in your details to create an account.</p>

      <form onSubmit={handleSignUp}>
        <label>Username *</label>
        <input name="username" placeholder="Enter username" onChange={handleChange} required />

        <label>Email *</label>
        <input type="email" name="email" placeholder="Enter email" onChange={handleChange} required />

        <label>Password *</label>
        <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" placeholder="Phone number" onChange={handleChange} />

        <label>Age</label>
        <input name="age" placeholder="Age" type="number" onChange={handleChange} />

        <label>Select Role *</label>
        <select name="sign_up_as" onChange={handleChange} required>
          <option disabled>Select Role</option>
          <option>Loan Borrower</option>
          <option>Merchant</option>
          <option>NBFC Admin</option>
        </select>

        <button type="submit" className="auth-button">Sign Up</button>
      </form>

      <div className="toggle-auth">
        Already a user?{" "}
        <button type="button" onClick={onSwitch}>
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SignUp;
