import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

const LoanStatus = () => {
  const [allLoans, setAllLoans] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [selectedApproved, setSelectedApproved] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const { data, error } = await supabase.from("loans").select("*");
    if (!error) {
      setAllLoans(data.filter((loan) => loan.review_status !== "approved"));
      setApprovedLoans(data.filter((loan) => loan.review_status === "approved"));
    } else {
      console.error("Error fetching loans:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setUploadedFiles(files);
  };

  const uploadDocuments = async () => {
    setUploading(true);

    const uploadedUrls = [];

    for (let file of uploadedFiles) {
      const fileExt = file.name.split(".").pop();
      const filePath = `documents/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        alert("Failed to upload some files");
        console.error(uploadError);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    // Save public URLs in the `loans` table
    const { error: updateError } = await supabase
      .from("loans")
      .update({ documents: uploadedUrls })
      .eq("id", selectedApproved.id);

    if (updateError) {
      alert("Failed to save documents to database");
      console.error(updateError);
    } else {
      alert("Documents uploaded successfully!");
      setSelectedApproved(null);
      fetchLoans();
    }

    setUploading(false);
  };

  return (
    <div>
      <h2>Loan Applicants</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Loan Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allLoans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.first_name} {loan.last_name}</td>
              <td>₹{loan.loan_amount}</td>
              <td>{loan.review_status}</td>
              <td>
                <button onClick={() => alert("View pending not required here")}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "2rem" }}>Approved Loan Applications</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
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
              <td>{loan.documents?.length || 0} uploaded</td>
              <td>
                <button onClick={() => setSelectedApproved(loan)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedApproved && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedApproved.first_name} {selectedApproved.last_name} - Upload Documents</h3>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p>Max 10 files allowed</p>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={uploadDocuments} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button onClick={() => setSelectedApproved(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanStatus;
