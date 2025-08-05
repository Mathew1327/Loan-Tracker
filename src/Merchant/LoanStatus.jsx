import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./LoanStatus.css";

const LoanStatus = () => {
  const [allLoans, setAllLoans] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentFiles, setDocumentFiles] = useState({});
  const [merchantId, setMerchantId] = useState(null);

  const documentLabels = [
    "Aadhar Image",
    "EB Bill / Gas Bill / Any Tax Receipt",
    "Appraisal Slip",
    "Upload the Invoice",
    "Upload Gold Product Live Photo from Weighing and Purity Machine",
    "Upload PAN",
    "Upload 6 Months Bank Statement",
    "Upload Income Proof / Salary Slip",
    "Upload Address Proof",
    "Other Document",
  ];

  useEffect(() => {
    fetchMerchantAndLoans();
  }, []);

  const fetchMerchantAndLoans = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) return;

    setMerchantId(profile.id);

    const { data: loansData, error: loansError } = await supabase
      .from("loans")
      .select("*")
      .eq("referred_by", profile.id);

    if (!loansError && loansData) {
      setAllLoans(loansData.filter((loan) => loan.status !== "approved"));
      setApprovedLoans(loansData.filter((loan) => loan.status === "approved"));
    } else {
      console.error("Error fetching loans:", loansError);
    }
  };

  const handleDocumentChange = (label, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File exceeds 5MB limit");
      return;
    }
    setDocumentFiles((prev) => ({ ...prev, [label]: file }));
  };

  const uploadDocuments = async () => {
    if (!selectedLoan) return;

    setUploading(true);
    const urls = {};

    for (let label of documentLabels) {
      const file = documentFiles[label];
      if (!file) continue;

      const ext = file.name.split(".").pop();
      const filePath = `documents/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        alert(`Failed to upload ${label}`);
        console.error(uploadError);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
      urls[label] = data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("loans")
      .update({ documents: urls })
      .eq("id", selectedLoan.id);

    if (updateError) {
      alert("Failed to save documents to database");
      console.error(updateError);
    } else {
      alert("Documents uploaded successfully!");
      setSelectedLoan(null);
      fetchMerchantAndLoans();
      setDocumentFiles({});
    }

    setUploading(false);
  };

  const statusClass = (status) => {
    const lower = status?.toLowerCase();
    if (lower === "approved") return "status-tag status-approved";
    if (lower === "pending") return "status-tag status-pending";
    if (lower === "rejected") return "status-tag status-rejected";
    if (lower === "under review") return "status-tag status-review";
    return "status-tag";
  };

  const renderModal = () => {
    if (!selectedLoan) return null;

    const { first_name, last_name, email, phone, address, loan_amount, created_at, status } = selectedLoan;

    return (
      <div className="modal-overlay">
        <div className="modal-box scrollable-modal">
          <h3>Applicant Details</h3>
          <p><strong>Name:</strong> {first_name} {last_name}</p>
          <p><strong>Email:</strong> {email || "N/A"}</p>
          <p><strong>Phone:</strong> {phone || "N/A"}</p>
          <p><strong>Address:</strong> {address || "N/A"}</p>
          <p><strong>Loan Amount:</strong> ₹{loan_amount}</p>
          <p><strong>Application Date:</strong> {created_at?.split("T")[0]}</p>
          <p><strong>Status:</strong> {status}</p>

          {status.toLowerCase() === "approved" && (
            <>
              <h4 style={{ marginTop: "20px" }}>Upload Documents</h4>
              <div className="document-grid">
                {documentLabels.map((label, idx) => (
                  <div className="document-upload-box" key={idx}>
                    <label>{label}</label>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentChange(label, e.target.files[0])}
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                    <span className="file-hint">Max 5MB</span>
                  </div>
                ))}
              </div>
              <button className="upload-btn" onClick={uploadDocuments} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Documents"}
              </button>
            </>
          )}

          <button className="close-btn" onClick={() => setSelectedLoan(null)}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="loan-page">
      <h2>Loan Applicants</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Loan Amount</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allLoans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.first_name} {loan.last_name}</td>
              <td>₹{loan.loan_amount}</td>
              <td>{loan.created_at?.split("T")[0]}</td>
              <td><span className={statusClass(loan.status)}>{loan.status}</span></td>
              <td>
                <button className="action-btn" onClick={() => setSelectedLoan(loan)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Approved Loan Applications</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Loan Amount</th>
            <th>Documents</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {approvedLoans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.first_name} {loan.last_name}</td>
              <td>₹{loan.loan_amount}</td>
              <td>{loan.documents ? Object.keys(loan.documents).length : 0} uploaded</td>
              <td>
                <button className="action-btn" onClick={() => setSelectedLoan(loan)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderModal()}
    </div>
  );
};

export default LoanStatus;
