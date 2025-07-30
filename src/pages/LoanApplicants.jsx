import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

const LoanApplicants = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [merchantName, setMerchantName] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setLoans(data);
    else console.error(error);
  };

  const fetchMerchantName = async (merchantId) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("id", merchantId)
      .single();

    if (error) {
      console.error("Merchant fetch error:", error);
      setMerchantName("N/A");
    } else {
      setMerchantName(`${data.first_name} ${data.last_name}`);
    }
  };

  const openViewModal = async (loan) => {
    setSelectedLoan(loan);
    if (loan.referred_by) {
      await fetchMerchantName(loan.referred_by);
    } else {
      setMerchantName("Not Referred");
    }
  };

  const updateStatus = async (loanId, status) => {
    const { error } = await supabase
      .from("loans")
      .update({ review_status: status })
      .eq("id", loanId);

    if (!error) {
      fetchLoans();
      setSelectedLoan(null);
    } else {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div>
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
              <td>{loan.review_status || "Pending"}</td>
              <td>{loan.referred_by ? "Yes" : "No"}</td>
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
            <p><strong>Referred Merchant:</strong> {merchantName}</p>

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
