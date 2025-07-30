import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

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
      .eq("review_status", "approved");

    if (!error) setApprovedLoans(data);
    else console.error(error);
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
    <div>
      <h2>Approved Loans</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Loan Amount</th>
            <th>Date</th>
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
                <button onClick={() => fetchDocuments(loan.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLoanId && (
        <div className="modal">
          <div className="modal-content">
            <h3>Documents for Loan ID: {selectedLoanId}</h3>
            <ul>
              {documents.map((doc) => (
                <li key={doc.name}>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <button onClick={() => setSelectedLoanId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedLoans;

import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

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
      .eq("review_status", "approved");

    if (!error) setApprovedLoans(data);
    else console.error(error);
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
    <div>
      <h2>Approved Loans</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Loan Amount</th>
            <th>Date</th>
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
                <button onClick={() => fetchDocuments(loan.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLoanId && (
        <div className="modal">
          <div className="modal-content">
            <h3>Documents for Loan ID: {selectedLoanId}</h3>
            <ul>
              {documents.map((doc) => (
                <li key={doc.name}>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <button onClick={() => setSelectedLoanId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedLoans;
