import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // ✅ Import the CSS file

const SignIn = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleError, setRoleError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setRoleError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setRoleError(error.message);
      return;
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("sign_up_as")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setRoleError("Role not found for user.");
      return;
    }

    const role = profile.sign_up_as;

    if (role === "Loan Borrower") navigate("/loan-borrower");
    else if (role === "Merchant") navigate("/merchant");
    else if (role === "NBFC Admin") navigate("/nbfc-admin");
    else setRoleError("Unknown role");
  };

  const handleForgotPassword = async () => {
    const userEmail = prompt("Enter your email to reset password:");
    if (!userEmail) return;

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: "http://localhost:5173/update-password",
    });

    if (error) {
      alert("Error sending reset link: " + error.message);
    } else {
      alert("Password reset link has been sent to your email.");
    }
  };

  return (
    <div className="auth-form-box">
      <h2>Welcome back!</h2>
      <p>Enter to get unlimited access to data & information.</p>

      <form onSubmit={handleSignIn}>
        <label>Email *</label>
        <input
          type="email"
          placeholder="Enter your mail address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password *</label>
        <input
          type="password"
          placeholder="Enter password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {roleError && <p className="error">{roleError}</p>}

        <div className="auth-links">
          <label>
            <input type="checkbox" style={{ marginRight: "6px" }} /> Remember me
          </label>
          <a href="#" onClick={handleForgotPassword}>
            Forgot your password?
          </a>
        </div>

        <button type="submit" className="auth-button">
          Log In
        </button>
      </form>

      <div className="toggle-auth">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitch}>
          Register here
        </button>
      </div>
    </div>
  );
};

export default SignIn;
