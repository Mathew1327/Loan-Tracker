import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './ReferLoan.css'; // Importing external CSS

const ReferLoan = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    phone: '',
    address: '',
    occupation: '',
    age: '',
    monthly_income: '',
    loan_amount: '',
    loan_purpose: '',
    aadhaar_number: '',
    pan_number: '',
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('User not authenticated');
      return;
    }

    const { error } = await supabase.from('loans').insert([{
      ...formData,
      referred_by: userId,
      age: parseInt(formData.age),
      monthly_income: parseFloat(formData.monthly_income),
      loan_amount: parseFloat(formData.loan_amount),
    }]);

    if (error) {
      console.error('Error submitting referral:', error.message);
      alert('Failed to refer loan.');
    } else {
      alert('Loan referral submitted successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        dob: '',
        phone: '',
        address: '',
        occupation: '',
        age: '',
        monthly_income: '',
        loan_amount: '',
        loan_purpose: '',
        aadhaar_number: '',
        pan_number: '',
      });
    }
  };

  return (
    <div className="refer-loan-container">
      <h2 className="refer-loan-title">📩 Refer a Loan</h2>

      <form onSubmit={handleSubmit} className="refer-loan-form">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="occupation"
          placeholder="Occupation"
          value={formData.occupation}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="number"
          name="monthly_income"
          placeholder="Monthly Income"
          value={formData.monthly_income}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="number"
          name="loan_amount"
          placeholder="Loan Amount"
          value={formData.loan_amount}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="loan_purpose"
          placeholder="Loan Purpose"
          value={formData.loan_purpose}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="aadhaar_number"
          placeholder="Aadhaar Number"
          value={formData.aadhaar_number}
          onChange={handleChange}
          required
          className="input-style"
        />
        <input
          type="text"
          name="pan_number"
          placeholder="PAN Number"
          value={formData.pan_number}
          onChange={handleChange}
          required
          className="input-style"
        />
        <button
          type="submit"
          className="submit-btn"
        >
          📤 Submit Referral
        </button>
      </form>
    </div>
  );
};

export default ReferLoan;
