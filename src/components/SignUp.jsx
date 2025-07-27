import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const SignUp = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    sign_up_as: "User",
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

    if (sign_up_as === "User") navigate("/loan-borrower");
    else if (sign_up_as === "Merchant") navigate("/merchant");
    else if (sign_up_as === "Admin") navigate("/admin");
  };

  return (
    <form onSubmit={handleSignUp} className="form-box">
      <h2>Create Account</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input name="age" placeholder="Age" type="number" onChange={handleChange} />
      <select name="sign_up_as" onChange={handleChange}>
        <option>Select Role</option>
        <option>Loan Borrower</option>
        <option>Merchant</option>
        <option>NBFC Admin</option>
      </select>
      <button type="submit">Sign Up</button>
      <p>
        Already a user? <span onClick={onSwitch}>Sign In</span>
      </p>
    </form>
  );
};

export default SignUp;
