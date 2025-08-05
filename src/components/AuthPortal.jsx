import React, { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import './Auth.css'; // Shared styling

const AuthPortal = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="auth-wrapper">
      <div className="auth-image-section">
        <img src="/auth-banner.png" alt="Auth Banner" className="auth-banner" />
      </div>
      <div className="auth-form-section">
        {isSignIn ? (
          <SignIn onSwitch={() => setIsSignIn(false)} />
        ) : (
          <SignUp onSwitch={() => setIsSignIn(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPortal;
