import React from "react";

const Sidebar = ({ role, onSectionSelect }) => {
  const merchantLinks = [
    { name: "Products", key: "products" },
    { name: "Loan Status", key: "loanStatus" },
    { name: "Refer a Loan", key: "referLoan" },
  ];

  const renderLinks = () => {
    switch (role) {
      case "merchant":
        return merchantLinks.map((item) => (
          <button
            key={item.key}
            onClick={() => onSectionSelect(item.key)}
            className="w-full text-left px-4 py-3 hover:bg-blue-100 transition"
          >
            {item.name}
          </button>
        ));
      // Add more roles later if needed
      default:
        return null;
    }
  };

  return (
    <div className="h-full p-4 border-r">
      <h2 className="text-xl font-bold mb-6">Merchant Panel</h2>
      {renderLinks()}
    </div>
  );
};

export default Sidebar;
