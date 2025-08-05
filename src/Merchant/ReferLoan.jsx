import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './ReferLoan.css';

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
      alert('✅ Loan referral submitted successfully!');
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
    <div className="refer-loan-container animate-fade-in">
      <h2 className="refer-loan-title">📩 Refer a Loan</h2>

      <form onSubmit={handleSubmit} className="refer-loan-form">
        {Object.entries(formData).map(([key, value]) => (
          <input
            key={key}
            type={
              key === 'dob' ? 'date' :
              ['age', 'monthly_income', 'loan_amount'].includes(key) ? 'number' : 'text'
            }
            name={key}
            placeholder={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            value={value}
            onChange={handleChange}
            required
            className="input-style"
          />
        ))}
        <button type="submit" className="submit-btn">📤 Submit Referral</button>
      </form>
    </div>
  );
};

export default ReferLoan;
