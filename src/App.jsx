// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // ✅ Removed BrowserRouter
import AuthPortal from "./components/AuthPortal";
import LoanBorrower from "./pages/LoanBorrower";
import Merchant from "./pages/Merchant";
import NBFCAdmin from "./pages/NBFCAdmin";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPortal />} />
      <Route path="/loan-borrower" element={<LoanBorrower />} />
      <Route path="/merchant" element={<Merchant />} />
      <Route path="/nbfc-admin" element={<NBFCAdmin />} />
    </Routes>
  );
};

export default App;
