// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPortal from "./components/AuthPortal";
import LoanBorrower from "./pages/LoanBorrower";
import Merchant from "./pages/Merchant";
import NBFCAdmin from "./pages/NBFCAdmin";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPortal />} />
        <Route path="/loan-borrower" element={<LoanBorrower />} />
        <Route path="/merchant" element={<Merchant />} />
        <Route path="/nbfc-admin" element={<NBFCAdmin />} />
      </Routes>
    </Router>
  );
};

export default App;
