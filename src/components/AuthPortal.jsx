import React, { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const AuthPortal = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="auth-container">
      {isSignIn ? (
        <SignIn onSwitch={() => setIsSignIn(false)} />
      ) : (
        <SignUp onSwitch={() => setIsSignIn(true)} />
      )}
    </div>
  );
};

export default AuthPortal;
