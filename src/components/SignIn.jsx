import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

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
      redirectTo: "http://localhost:5173/update-password", // Update based on your environment
    });

    if (error) {
      alert("Error sending reset link: " + error.message);
    } else {
      alert("Password reset link has been sent to your email.");
    }
  };

  return (
    <div className="auth-container">
      <div className="form-box">
        <h2>Sign In</h2>
        <form onSubmit={handleSignIn} className="form-fields">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {roleError && <p className="error">{roleError}</p>}
          <button type="submit">Login</button>
        </form>

        <p className="text-sm text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </p>

        <span onClick={onSwitch}>New user? Create account</span>
      </div>
    </div>
  );
};

export default SignIn;
  