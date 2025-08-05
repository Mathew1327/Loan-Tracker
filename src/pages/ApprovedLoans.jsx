import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./ApprovedLoans.css";

const ApprovedLoans = () => {
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  const fetchApprovedLoans = async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("id, first_name, last_name, created_at, loan_amount")
      .eq("status", "approved"); // ✅ updated to use 'status' field

    if (!error) setApprovedLoans(data);
    else console.error("Error fetching approved loans:", error);
  };

  const fetchDocuments = async (loanId) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .list(`${loanId}`, {
        limit: 10,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("Error fetching documents", error);
      return;
    }

    const signedUrls = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from("documents")
          .createSignedUrl(`${loanId}/${file.name}`, 3600);
        return { name: file.name, url: urlData?.signedUrl };
      })
    );

    setDocuments(signedUrls);
    setSelectedLoanId(loanId);
  };

  return (
    <div className="approved-container">
      <h2 className="approved-title">Approved Loans</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Loan Amount</th>
            <th>Application Date</th>
            <th>Documents</th>
          </tr>
        </thead>
        <tbody>
          {approvedLoans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.first_name} {loan.last_name}</td>
              <td>₹{Number(loan.loan_amount).toLocaleString("en-IN")}</td>
              <td>{loan.created_at?.split("T")[0]}</td>
              <td>
                <button className="view-btn" onClick={() => fetchDocuments(loan.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLoanId && (
        <div className="modal-overlay" onClick={() => setSelectedLoanId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Documents for Loan ID</h3>
            <ul className="doc-list">
              {documents.map((doc) => (
                <li key={doc.name}>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={() => setSelectedLoanId(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedLoans;
