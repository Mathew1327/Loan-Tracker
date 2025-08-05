import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Merchant Panel</h2>
      <ul>
        <li>Dashboard</li>
        <li>Products</li>
        <li>Refer a Loan</li>
        <li>Loan Status</li>
      </ul>
    </div>
  );
};

export default Sidebar;
