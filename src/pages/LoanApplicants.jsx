import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./LoanApplicants.css";

const LoanApplicants = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [merchantMap, setMerchantMap] = useState({}); // Map merchant ID to name

  useEffect(() => {
    fetchLoansAndMerchants();
  }, []);

  const fetchLoansAndMerchants = async () => {
    const { data: loansData, error: loansError } = await supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false });

    if (loansError) {
      console.error("Loan fetch error:", loansError);
      return;
    }

    setLoans(loansData);

    // Get unique merchant IDs
    const merchantIds = [
      ...new Set(loansData.map((loan) => loan.referred_by).filter(Boolean)),
    ];

    // Fetch merchant names
    const { data: merchants, error: merchantError } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name")
      .in("id", merchantIds);

    if (merchantError) {
      console.error("Merchant fetch error:", merchantError);
      return;
    }

    // Map merchant IDs to names
    const merchantNameMap = {};
    merchants.forEach((m) => {
      merchantNameMap[m.id] = `${m.first_name} ${m.last_name}`;
    });

    setMerchantMap(merchantNameMap);
  };

  const openViewModal = (loan) => {
    setSelectedLoan(loan);
  };

  const updateStatus = async (loanId, newStatus) => {
    const { error } = await supabase
      .from("loans")
      .update({ status: newStatus })
      .eq("id", loanId);

    if (!error) {
      fetchLoansAndMerchants();
      setSelectedLoan(null);
    } else {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="loan-applicants-container">
      <h2>Loan Applicants</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Loan Amount</th>
            <th>Status</th>
            <th>Referred By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.first_name} {loan.last_name}</td>
              <td>₹{loan.loan_amount?.toLocaleString("en-IN")}</td>
              <td>{loan.status || "Pending"}</td>
              <td>{loan.referred_by ? merchantMap[loan.referred_by] || "Loading..." : "Not Referred"}</td>
              <td>
                <button onClick={() => openViewModal(loan)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLoan && (
        <div className="modal">
          <div className="modal-content">
            <h3>Loan Details</h3>
            <p><strong>Name:</strong> {selectedLoan.first_name} {selectedLoan.last_name}</p>
            <p><strong>Age:</strong> {selectedLoan.age}</p>
            <p><strong>Phone:</strong> {selectedLoan.phone}</p>
            <p><strong>Loan Amount:</strong> ₹{selectedLoan.loan_amount}</p>
            <p><strong>Occupation:</strong> {selectedLoan.occupation}</p>
            <p><strong>Address:</strong> {selectedLoan.address}</p>
            <p><strong>Referred Merchant:</strong> {selectedLoan.referred_by ? merchantMap[selectedLoan.referred_by] || "Loading..." : "Not Referred"}</p>

            <div className="modal-actions">
              <button onClick={() => updateStatus(selectedLoan.id, "approved")}>Approve</button>
              <button onClick={() => updateStatus(selectedLoan.id, "rejected")}>Reject</button>
              <button onClick={() => setSelectedLoan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicants;
